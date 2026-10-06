import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import { db } from "../lib/firebase";
import { notifyEditionOwners } from "../lib/notify";
import { EMAIL_API_KEY } from "../config";

/**
 * A MINOR update replaces an existing edition's file in place. Existing
 * purchasers keep access free of charge — we just let them know the report they
 * own has been refreshed. Fires when the admin panel stamps lastMinorUpdateAt.
 */
export const onEditionMinorUpdate = onDocumentUpdated(
  { document: "reportEditions/{editionId}", secrets: [EMAIL_API_KEY] },
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!before || !after) return;

    // Only react when a new minor update was actually stamped.
    if (before.lastMinorUpdateAt === after.lastMinorUpdateAt) return;
    if (!after.lastMinorUpdateAt) return;

    const reportSnap = await db.collection("reports").doc(after.reportId).get();
    const reportTitle = (reportSnap.data()?.title as string) || "a report";
    const notes = (after.changeNotes as string) || "";

    const count = await notifyEditionOwners(event.params.editionId, () => ({
      type: "minor_update",
      title: `"${reportTitle}" has been updated`,
      body:
        `The edition you own (${after.editionLabel}) has received a free update.` +
        (notes ? ` Changes: ${notes}.` : "") +
        " Open it in your account to read the latest version — no repurchase needed.",
      link: "/account",
    }));

    logger.info("Announced minor update", {
      editionId: event.params.editionId,
      notified: count,
    });
  }
);
