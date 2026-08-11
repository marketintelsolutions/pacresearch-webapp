import { onCall, HttpsError } from "firebase-functions/v2/https";
import { db, FieldValue } from "../lib/firebase";
import { assertAdmin } from "../lib/admin";
import { notifyCustomer } from "../lib/notify";
import { EMAIL_API_KEY } from "../config";

/** Admin: cancel (void) a pro-forma invoice. */
export const cancelInvoice = onCall(
  { secrets: [EMAIL_API_KEY], cors: true },
  async (request) => {
    const admin = await assertAdmin(request.auth?.uid, [
      "superadmin",
      "admin",
      "finance",
    ]);
    const { invoiceId } = (request.data ?? {}) as { invoiceId?: string };
    if (!invoiceId) {
      throw new HttpsError("invalid-argument", "invoiceId required.");
    }

    const invRef = db.collection("invoices").doc(invoiceId);
    const invSnap = await invRef.get();
    if (!invSnap.exists) {
      throw new HttpsError("not-found", "Invoice not found.");
    }
    const inv = invSnap.data() as {
      customerUid?: string;
      invoiceNumber?: string;
      status?: string;
    };
    if (inv.status === "cancelled") {
      return { invoiceId, status: "cancelled" };
    }

    await invRef.update({
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

    // Notify the customer (in-app + email) that their invoice was cancelled.
    if (inv.customerUid) {
      const label = inv.invoiceNumber ? ` ${inv.invoiceNumber}` : "";
      await notifyCustomer({
        customerUid: inv.customerUid,
        type: "account_activity",
        title: "Your invoice was cancelled",
        body: `Invoice${label} has been cancelled. If you believe this is a mistake or have any questions, please contact us.`,
        link: "/account",
      }).catch(() => undefined);
    }

    return { invoiceId, status: "cancelled" };
  }
);
