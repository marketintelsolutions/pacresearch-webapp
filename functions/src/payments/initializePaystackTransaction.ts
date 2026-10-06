import { onCall, HttpsError } from "firebase-functions/v2/https";
import { db, FieldValue } from "../lib/firebase";
import {
  PAYSTACK_SECRET_KEY,
  PAYSTACK_SPLIT_CODE,
  ZILTCH_SUBACCOUNT_CODE,
  PAYSTACK_CALLBACK_URL,
  DEFAULT_LOYALTY_DISCOUNT_PERCENT,
} from "../config";
import { initializeTransaction } from "../lib/paystack";
import { computeSplit, applyDiscount, toKobo } from "../lib/money";
import { OwnerType, PurchaseKind } from "../types";

interface InitInput {
  purchaseKind: PurchaseKind;
  editionId?: string;
  organizationId?: string;
  termsAccepted?: boolean;
}

/**
 * True if the given customer (individual) or their organization (corporate)
 * already owns an active purchase of `editionId`.
 */
async function ownsEdition(
  editionId: string,
  customerUid: string,
  organizationId: string | null
): Promise<boolean> {
  // Individual entitlement.
  const mine = await db
    .collection("purchases")
    .where("editionId", "==", editionId)
    .where("customerUid", "==", customerUid)
    .where("status", "==", "active")
    .limit(1)
    .get();
  if (!mine.empty) return true;

  // Organization-wide entitlement.
  if (organizationId) {
    const org = await db
      .collection("purchases")
      .where("editionId", "==", editionId)
      .where("organizationId", "==", organizationId)
      .where("status", "==", "active")
      .limit(1)
      .get();
    if (!org.empty) return true;
  }
  return false;
}

export const initializePaystackTransaction = onCall(
  { secrets: [PAYSTACK_SECRET_KEY], cors: true },
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) {
      throw new HttpsError("unauthenticated", "You must be signed in to pay.");
    }
    const email = request.auth?.token.email as string | undefined;
    if (!email) {
      throw new HttpsError("failed-precondition", "Your account has no email.");
    }

    const input = (request.data ?? {}) as InitInput;
    const purchaseKind: PurchaseKind = input.purchaseKind ?? "report";

    // Load the customer profile for ownerType / organization context.
    const customerSnap = await db.collection("customers").doc(uid).get();
    if (!customerSnap.exists) {
      throw new HttpsError("failed-precondition", "Complete your profile first.");
    }
    const customer = customerSnap.data() as {
      type: OwnerType;
      status?: string;
      organizationId?: string | null;
    };
    if (customer.status === "suspended") {
      throw new HttpsError("permission-denied", "Your account is suspended.");
    }
    const ownerType: OwnerType = customer.type;
    const organizationId = customer.organizationId ?? null;

    let amount: number;
    let reportId: string | null = null;
    let editionId: string | null = null;
    let loyaltyDiscountPercent = 0;
    let loyaltyDiscountApplied = false;

    if (purchaseKind === "report") {
      if (!input.termsAccepted) {
        throw new HttpsError(
          "failed-precondition",
          "You must accept the Terms of Use before payment."
        );
      }
      if (!input.editionId) {
        throw new HttpsError("invalid-argument", "editionId is required.");
      }
      editionId = input.editionId;

      const editionSnap = await db.collection("reportEditions").doc(editionId).get();
      if (!editionSnap.exists) {
        throw new HttpsError("not-found", "Report edition not found.");
      }
      const edition = editionSnap.data() as {
        reportId: string;
        price: number;
        status: string;
        predecessorEditionId: string | null;
      };
      if (edition.status !== "published") {
        throw new HttpsError("failed-precondition", "This edition is not on sale.");
      }
      reportId = edition.reportId;

      // Guard against paying twice for the same edition.
      if (await ownsEdition(editionId, uid, organizationId)) {
        throw new HttpsError(
          "already-exists",
          "You already have access to this edition."
        );
      }

      amount = edition.price;

      // Loyalty: discount if the predecessor edition is already owned.
      if (edition.predecessorEditionId) {
        const ownsPredecessor = await ownsEdition(
          edition.predecessorEditionId,
          uid,
          organizationId
        );
        if (ownsPredecessor) {
          const cfgSnap = await db.collection("loyaltyConfig").doc("settings").get();
          const cfg = cfgSnap.data() as
            | { discountPercent?: number; enabled?: boolean }
            | undefined;
          const enabled = cfg?.enabled ?? true;
          const pct = cfg?.discountPercent ?? DEFAULT_LOYALTY_DISCOUNT_PERCENT;
          if (enabled && pct > 0) {
            const { finalPrice } = applyDiscount(amount, pct);
            amount = finalPrice;
            loyaltyDiscountPercent = pct;
            loyaltyDiscountApplied = true;
          }
        }
      }
    } else if (purchaseKind === "seatAddon") {
      if (!organizationId || organizationId !== input.organizationId) {
        throw new HttpsError(
          "permission-denied",
          "You can only add seats to your own organization."
        );
      }
      const orgSnap = await db.collection("organizations").doc(organizationId).get();
      if (!orgSnap.exists) {
        throw new HttpsError("not-found", "Organization not found.");
      }
      const org = orgSnap.data() as { primaryContactUid: string };
      if (org.primaryContactUid !== uid) {
        throw new HttpsError(
          "permission-denied",
          "Only the primary contact can purchase seats."
        );
      }
      const seatCfgSnap = await db.collection("orgConfig").doc("settings").get();
      const seatPrice = (seatCfgSnap.data() as { seatAddonPrice?: number } | undefined)
        ?.seatAddonPrice;
      if (!seatPrice || seatPrice <= 0) {
        throw new HttpsError(
          "failed-precondition",
          "Seat add-on pricing is not configured."
        );
      }
      amount = seatPrice;
    } else {
      throw new HttpsError("invalid-argument", "Unknown purchaseKind.");
    }

    // Compute the fee + 75/25 split and record everything before calling Paystack.
    const split = computeSplit(amount);
    const reference = `pac_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 10)}`;

    const txnRef = db.collection("transactions").doc(reference);
    await txnRef.set({
      id: reference,
      paystackReference: reference,
      purchaseKind,
      customerUid: uid,
      ownerType,
      organizationId,
      reportId,
      editionId,
      amount: split.amount,
      paystackFee: split.paystackFee,
      netAmount: split.netAmount,
      splitPacResearch: split.splitPacResearch,
      splitZiltch1: split.splitZiltch1,
      currency: "NGN",
      status: "pending",
      paymentChannel: null,
      loyaltyDiscountApplied,
      loyaltyDiscountPercent,
      termsAcceptedAt:
        purchaseKind === "report" ? FieldValue.serverTimestamp() : null,
      failureReason: null,
      initiatedAt: FieldValue.serverTimestamp(),
      verifiedAt: null,
    });

    const splitCode = PAYSTACK_SPLIT_CODE.value() || undefined;
    const subaccount = splitCode ? undefined : ZILTCH_SUBACCOUNT_CODE.value() || undefined;

    const paystackRes = await initializeTransaction({
      secretKey: PAYSTACK_SECRET_KEY.value(),
      email,
      amountKobo: toKobo(split.amount),
      reference,
      currency: "NGN",
      callbackUrl: PAYSTACK_CALLBACK_URL.value() || undefined,
      splitCode,
      subaccount,
      bearer: subaccount ? "account" : undefined,
      metadata: {
        purchaseKind,
        customerUid: uid,
        reportId,
        editionId,
        organizationId,
      },
    });

    if (!paystackRes.status) {
      await txnRef.update({
        status: "failed",
        failureReason: paystackRes.message ?? "Paystack initialize failed",
      });
      throw new HttpsError("internal", "Failed to initialize payment.");
    }

    return {
      reference,
      authorizationUrl: paystackRes.data.authorization_url,
      accessCode: paystackRes.data.access_code,
      amount: split.amount,
      currency: "NGN",
      loyaltyDiscountApplied,
      loyaltyDiscountPercent,
    };
  }
);
