import * as logger from "firebase-functions/logger";
import { db, FieldValue } from "../lib/firebase";
import { toKobo } from "../lib/money";
import { notifyCustomer } from "../lib/notify";
import { PaystackVerifyResponse } from "../types";

export interface FulfillResult {
  processed: boolean;
  alreadyProcessed: boolean;
  status: "success" | "failed" | "abandoned" | "pending";
}

/**
 * Idempotently fulfill a transaction given a Paystack verify response. Safe to
 * call from both the webhook and the client-side verify poll — the first call
 * to reach "success" performs the side effects; later calls are no-ops.
 */
export async function fulfillFromVerify(
  verify: PaystackVerifyResponse
): Promise<FulfillResult> {
  const reference = verify.data.reference;
  const gatewayStatus = verify.data.status;
  const txnRef = db.collection("transactions").doc(reference);

  const result = await db.runTransaction(async (t) => {
    const snap = await t.get(txnRef);
    if (!snap.exists) {
      throw new Error(`Transaction ${reference} not found for fulfillment.`);
    }
    const txn = snap.data() as {
      status: string;
      purchaseKind: "report" | "seatAddon";
      customerUid: string;
      ownerType: "individual" | "corporate";
      organizationId: string | null;
      reportId: string | null;
      editionId: string | null;
      amount: number;
      loyaltyDiscountApplied: boolean;
      loyaltyDiscountPercent: number;
    };

    // Already finalized → idempotent no-op.
    if (txn.status === "success") {
      return { processed: false, alreadyProcessed: true, status: "success" as const };
    }

    // Non-success gateway states just mark the transaction and stop.
    if (gatewayStatus !== "success") {
      const mapped =
        gatewayStatus === "abandoned" ? "abandoned" : ("failed" as const);
      t.update(txnRef, {
        status: mapped,
        paymentChannel: verify.data.channel ?? null,
        failureReason: verify.data.gateway_response ?? gatewayStatus,
        verifiedAt: FieldValue.serverTimestamp(),
      });
      return {
        processed: true,
        alreadyProcessed: false,
        status: mapped as "failed" | "abandoned",
      };
    }

    // Defense-in-depth: the amount charged must match what we recorded.
    if (verify.data.amount !== toKobo(txn.amount)) {
      t.update(txnRef, {
        status: "failed",
        failureReason: `Amount mismatch: charged ${verify.data.amount} kobo, expected ${toKobo(
          txn.amount
        )} kobo`,
        verifiedAt: FieldValue.serverTimestamp(),
      });
      throw new Error(`Amount mismatch for ${reference}; refusing to fulfill.`);
    }

    // ---- Mark success + apply side effects -------------------------------
    t.update(txnRef, {
      status: "success",
      paymentChannel: verify.data.channel ?? null,
      verifiedAt: FieldValue.serverTimestamp(),
    });

    if (txn.purchaseKind === "report" && txn.editionId) {
      // Deterministic id keyed on the reference → re-processing can't duplicate.
      const purchaseRef = db.collection("purchases").doc(`purchase_${reference}`);
      t.set(purchaseRef, {
        id: `purchase_${reference}`,
        ownerType: txn.ownerType,
        customerUid: txn.customerUid,
        organizationId: txn.ownerType === "corporate" ? txn.organizationId : null,
        reportId: txn.reportId,
        editionId: txn.editionId,
        transactionId: reference,
        price: txn.amount,
        loyaltyDiscountApplied: txn.loyaltyDiscountApplied,
        loyaltyDiscountPercent: txn.loyaltyDiscountPercent,
        status: "active",
        revokedAt: null,
        revokedReason: null,
        purchasedAt: FieldValue.serverTimestamp(),
      });

      const customerRef = db.collection("customers").doc(txn.customerUid);
      t.set(
        customerRef,
        {
          purchasedReportIds: FieldValue.arrayUnion(txn.editionId),
          totalSpend: FieldValue.increment(txn.amount),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      const editionRef = db.collection("reportEditions").doc(txn.editionId);
      t.set(
        editionRef,
        { purchaseCount: FieldValue.increment(1) },
        { merge: true }
      );
    } else if (txn.purchaseKind === "seatAddon" && txn.organizationId) {
      const orgRef = db.collection("organizations").doc(txn.organizationId);
      t.set(orgRef, { seatLimit: FieldValue.increment(1) }, { merge: true });
    }

    return { processed: true, alreadyProcessed: false, status: "success" as const };
  });

  // Notify outside the transaction — a notification failure must never roll
  // back a completed payment.
  if (result.processed) {
    try {
      const txn = (await txnRef.get()).data() as
        | { customerUid: string; amount: number; purchaseKind: string }
        | undefined;
      if (txn?.customerUid) {
        if (result.status === "success") {
          await notifyCustomer({
            customerUid: txn.customerUid,
            type: "purchase_success",
            title:
              txn.purchaseKind === "seatAddon"
                ? "Seat added to your organization"
                : "Your purchase is confirmed",
            body:
              txn.purchaseKind === "seatAddon"
                ? "An extra seat has been added. You can now invite another team member."
                : "Payment received. Your report is ready to read in your account.",
            link: "/account",
          });
        } else {
          await notifyCustomer({
            customerUid: txn.customerUid,
            type: "payment_failed",
            title: "Your payment did not go through",
            body: "We could not complete your payment. No money has been taken — please try again.",
            link: "/report-archive",
          });
        }
      }
    } catch (err) {
      logger.warn("Failed to send purchase notification", err);
    }
  }

  return result;
}
