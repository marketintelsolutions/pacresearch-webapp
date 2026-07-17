import { onCall, HttpsError } from "firebase-functions/v2/https";
import { db, FieldValue } from "../lib/firebase";
import { assertAdmin } from "../lib/admin";

/** Admin: cancel (void) a pro-forma invoice. */
export const cancelInvoice = onCall({ cors: true }, async (request) => {
  const admin = await assertAdmin(request.auth?.uid, [
    "superadmin",
    "admin",
    "finance",
  ]);
  const { invoiceId } = (request.data ?? {}) as { invoiceId?: string };
  if (!invoiceId) {
    throw new HttpsError("invalid-argument", "invoiceId required.");
  }

  await db.collection("invoices").doc(invoiceId).update({
    status: "cancelled",
    cancelledAt: FieldValue.serverTimestamp(),
    cancelledBy: admin.uid,
  });

  await db.collection("auditLogs").add({
    actorUid: admin.uid,
    actorEmail: admin.email,
    action: "invoice.cancel",
    targetType: "invoice",
    targetId: invoiceId,
    metadata: {},
    timestamp: FieldValue.serverTimestamp(),
  });

  return { invoiceId, status: "cancelled" };
});
