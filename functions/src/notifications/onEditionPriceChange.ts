import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import { db } from "../lib/firebase";
import { notifyCustomer } from "../lib/notify";
import { EMAIL_API_KEY } from "../config";

const naira = (n: number) => `₦${Number(n || 0).toLocaleString("en-NG")}`;

/**
 * When an admin changes an edition's price, notify every customer holding an
 * issued invoice that contains that edition — the quote they have is now out
 * of date.
 */
export const onEditionPriceChange = onDocumentUpdated(
  { document: "reportEditions/{editionId}", secrets: [EMAIL_API_KEY] },
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!before || !after) return;
    if (before.price === after.price) return; // only price changes

    const editionId = event.params.editionId;

    const reportSnap = await db.collection("reports").doc(after.reportId).get();
    const reportTitle = (reportSnap.data()?.title as string) || "a report";

    // Issued invoices that include this edition.
    const snap = await db
      .collection("invoices")
      .where("editionIds", "array-contains", editionId)
      .where("status", "==", "issued")
      .get();

    let notified = 0;
    await Promise.all(
      snap.docs.map(async (d) => {
        const inv = d.data();
        const line = (inv.lineItems as Array<{ editionId: string; reportTitle?: string }>)?.find(
          (l) => l.editionId === editionId
        );
        await notifyCustomer({
          customerUid: inv.customerUid,
          type: "account_activity",
          title: "A price on your invoice has changed",
          body:
            `The price of "${line?.reportTitle || reportTitle}" on your ` +
            `invoice ${inv.invoiceNumber} has changed from ${naira(before.price)} ` +
            `to ${naira(after.price)}. Please request a fresh invoice to reflect ` +
            `the new price before making payment.`,
          link: "/account/invoices",
        });
        notified++;
      })
    );

    logger.info("Notified invoice holders of price change", {
      editionId,
      from: before.price,
      to: after.price,
      notified,
    });
  }
);
