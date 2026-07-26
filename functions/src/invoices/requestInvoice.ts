import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { db, FieldValue } from "../lib/firebase";
import { ownsEdition } from "../lib/entitlement";
import { round2 } from "../lib/money";
import { DEFAULT_LOYALTY_DISCOUNT_PERCENT } from "../config";
import { InvoiceLineItem } from "../lib/invoicePdf";

interface Input {
  editionIds?: string[];
  notes?: string;
}

const VALIDITY_DAYS = 14;

/**
 * Auto-issued pro-forma invoice (quote). Computes a line per requested edition
 * with the loyalty discount applied when the customer/org owns the predecessor,
 * assigns a sequential invoice number, and stores the invoice. It does NOT take
 * payment — reports are still bought through normal checkout.
 */
export const requestInvoice = onCall({ cors: true }, async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Sign in required.");
  const email = request.auth?.token.email as string | undefined;

  const { editionIds, notes } = (request.data ?? {}) as Input;
  if (!editionIds || editionIds.length === 0) {
    throw new HttpsError("invalid-argument", "Select at least one report.");
  }
  if (editionIds.length > 50) {
    throw new HttpsError("invalid-argument", "Too many items on one invoice.");
  }

  const custSnap = await db.collection("customers").doc(uid).get();
  if (!custSnap.exists) {
    throw new HttpsError("failed-precondition", "Complete your profile first.");
  }
  const cust = custSnap.data() as {
    type: "individual" | "corporate";
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    organizationId?: string | null;
  };
  const organizationId = cust.organizationId ?? null;

  if (!cust.type) {
    // An incomplete profile (e.g. an account that never went through signup).
    // Quote it as individual rather than failing, but make it visible.
    logger.warn("Customer profile has no type; defaulting to individual", {
      uid,
    });
  }

  let organizationName = "";
  if (organizationId) {
    const orgSnap = await db.collection("organizations").doc(organizationId).get();
    organizationName = (orgSnap.data()?.orgName as string) || "";
  }

  // Loyalty config (percentage read live, per the business rule).
  const cfgSnap = await db.collection("loyaltyConfig").doc("settings").get();
  const cfg = cfgSnap.data() as
    | { discountPercent?: number; enabled?: boolean }
    | undefined;
  const loyaltyEnabled = cfg?.enabled ?? true;
  const loyaltyPct = cfg?.discountPercent ?? DEFAULT_LOYALTY_DISCOUNT_PERCENT;

  const uniqueIds = Array.from(new Set(editionIds));
  const lineItems: (InvoiceLineItem & { editionId: string; reportId: string })[] = [];

  for (const editionId of uniqueIds) {
    const edSnap = await db.collection("reportEditions").doc(editionId).get();
    if (!edSnap.exists) continue;
    const ed = edSnap.data() as {
      reportId: string;
      editionLabel: string;
      price: number;
      status: string;
      predecessorEditionId: string | null;
    };
    if (ed.status !== "published") continue;

    const reportSnap = await db.collection("reports").doc(ed.reportId).get();
    const reportTitle = (reportSnap.data()?.title as string) || "Report";

    let discountPercent = 0;
    if (loyaltyEnabled && loyaltyPct > 0 && ed.predecessorEditionId) {
      try {
        if (await ownsEdition(ed.predecessorEditionId, uid, organizationId)) {
          discountPercent = loyaltyPct;
        }
      } catch (err) {
        // A loyalty lookup failure must not sink the whole invoice — quote at
        // full price and record why.
        logger.error("Loyalty check failed; quoting full price", {
          editionId,
          uid,
          err,
        });
      }
    }

    // Every value below is defaulted: Firestore rejects any write containing
    // `undefined`, which would otherwise surface to the caller as INTERNAL.
    const rawPrice = Number(ed.price);
    const unitPrice = round2(Number.isFinite(rawPrice) ? rawPrice : 0);
    const loyaltyDiscountAmount = round2((unitPrice * discountPercent) / 100);
    const lineTotal = round2(unitPrice - loyaltyDiscountAmount);

    lineItems.push({
      editionId,
      reportId: ed.reportId || "",
      reportTitle,
      editionLabel: ed.editionLabel || "Edition",
      unitPrice,
      loyaltyDiscountPercent: discountPercent,
      loyaltyDiscountAmount,
      lineTotal,
    });
  }

  if (lineItems.length === 0) {
    throw new HttpsError(
      "failed-precondition",
      "None of the selected reports are available for invoicing."
    );
  }

  const subtotal = round2(lineItems.reduce((s, l) => s + l.unitPrice, 0));
  const discountTotal = round2(
    lineItems.reduce((s, l) => s + l.loyaltyDiscountAmount, 0)
  );
  const total = round2(subtotal - discountTotal);

  // Sequential invoice number via an atomic counter.
  const year = new Date().getFullYear();
  const counterRef = db.collection("counters").doc("invoices");
  const seq = await db.runTransaction(async (t) => {
    const snap = await t.get(counterRef);
    const next = ((snap.data()?.next as number) || 0) + 1;
    t.set(counterRef, { next }, { merge: true });
    return next;
  });
  const invoiceNumber = `PAC-PI-${year}-${String(seq).padStart(4, "0")}`;

  const invoiceId = `inv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const expiresAt = new Date(Date.now() + VALIDITY_DAYS * 86400000);

  try {
    await db.collection("invoices").doc(invoiceId).set({
      id: invoiceId,
      invoiceNumber,
      customerUid: uid,
      ownerType: cust.type || "individual",
      organizationId,
      status: "issued",
      lineItems,
      subtotal,
      discountTotal,
      total,
      currency: "NGN",
      notes: notes || "",
      billTo: {
        name: cust.name || "",
        email: email || cust.email || "",
        phone: cust.phone || "",
        organizationName,
        location: cust.location || "",
      },
      createdAt: FieldValue.serverTimestamp(),
      expiresAt,
    });
  } catch (err) {
    // Surface something diagnosable instead of a bare INTERNAL.
    logger.error("Failed to write invoice", {
      uid,
      invoiceId,
      editionIds: uniqueIds,
      err,
    });
    throw new HttpsError(
      "internal",
      "Could not save the invoice. Please try again, and contact support if it persists."
    );
  }

  return { invoiceId, invoiceNumber, total };
});
