import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { db, FieldValue } from "../lib/firebase";
import { assertAdmin } from "../lib/admin";
import { refundTransaction } from "../lib/paystack";
import { toKobo } from "../lib/money";
import { notifyCustomer } from "../lib/notify";
import { PAYSTACK_SECRET_KEY, EMAIL_API_KEY } from "../config";

interface RefundInput {
  reference?: string;
  reason?: string;
}

/**
 * Admin-only refund. Refunds via Paystack, marks the transaction refunded, and
 * REVOKES the purchase that the payment granted — a refunded customer loses
 * access to the report. Written to auditLogs.
 */
export const processRefund = onCall(
  { secrets: [PAYSTACK_SECRET_KEY, EMAIL_API_KEY], cors: true },
  async (request) => {
    const admin = await assertAdmin(request.auth?.uid, ["superadmin", "admin", "finance"]);

    const { reference, reason } = (request.data ?? {}) as RefundInput;
    if (!reference) {
      throw new HttpsError("invalid-argument", "reference is required.");
    }

    const txnRef = db.collection("transactions").doc(reference);
    const txnSnap = await txnRef.get();
    if (!txnSnap.exists) {
      throw new HttpsError("not-found", "Transaction not found.");
    }
    const txn = txnSnap.data() as {
      status: string;
      amount: number;
      customerUid: string;
      editionId: string | null;
    };

    if (txn.status !== "success") {
      throw new HttpsError(
        "failed-precondition",
        "Only successful transactions can be refunded."
      );
    }

    // Ask Paystack for the refund first — if this fails, change nothing.
    try {
      await refundTransaction(
        PAYSTACK_SECRET_KEY.value(),
        reference,
        toKobo(txn.amount)
      );
    } catch (err) {
      logger.error("Paystack refund failed", { reference, err });
      throw new HttpsError("internal", "Paystack refund failed.");
    }

    // Mark the transaction and revoke the entitlement it granted.
    const purchaseRef = db.collection("purchases").doc(`purchase_${reference}`);
    const batch = db.batch();
    batch.update(txnRef, {
      status: "refunded",
      refundedAt: FieldValue.serverTimestamp(),
      refundedBy: admin.uid,
      refundReason: reason ?? null,
    });
    const purchaseSnap = await purchaseRef.get();
    if (purchaseSnap.exists) {
      batch.update(purchaseRef, {
        status: "revoked",
        revokedAt: FieldValue.serverTimestamp(),
        revokedReason: reason ?? "Refunded",
      });
      // Drop the edition from the customer's owned-list so the account/viewer
      // stop showing it.
      if (txn.editionId) {
        batch.set(
          db.collection("customers").doc(txn.customerUid),
          { purchasedReportIds: FieldValue.arrayRemove(txn.editionId) },
          { merge: true }
        );
      }
    }
    batch.set(db.collection("auditLogs").doc(), {
      actorUid: admin.uid,
      actorEmail: admin.email,
      action: "transaction.refund",
      targetType: "transaction",
      targetId: reference,
      metadata: { amount: txn.amount, reason: reason ?? null },
      timestamp: FieldValue.serverTimestamp(),
    });
    await batch.commit();

    await notifyCustomer({
      customerUid: txn.customerUid,
      type: "account_activity",
      title: "Your purchase has been refunded",
      body:
        `A refund of ₦${txn.amount.toLocaleString()} has been processed.` +
        " Access to the associated report has been removed.",
      link: "/account",
    });

    return { reference, status: "refunded" };
  }
);
