import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import { db } from "../lib/firebase";
import { notifyEditionOwners } from "../lib/notify";
import {
  EMAIL_API_KEY,
  DEFAULT_LOYALTY_DISCOUNT_PERCENT,
} from "../config";

/**
 * A MAJOR update creates a new edition. Customers who own the predecessor must
 * repurchase to read it — and are eligible for the loyalty discount. Notify
 * them (they keep access to the edition they already own; nothing is revoked).
 */
export const onEditionPublished = onDocumentCreated(
  { document: "reportEditions/{editionId}", secrets: [EMAIL_API_KEY] },
  async (event) => {
    const edition = event.data?.data();
    if (!edition) return;

    if (
      edition.editionType !== "major" ||
      edition.status !== "published" ||
      !edition.predecessorEditionId
    ) {
      return; // first edition, draft, or a minor update — nothing to announce
    }

    const reportSnap = await db.collection("reports").doc(edition.reportId).get();
    const reportTitle = (reportSnap.data()?.title as string) || "a report";

    const cfgSnap = await db.collection("loyaltyConfig").doc("settings").get();
    const cfg = cfgSnap.data() as
      | { discountPercent?: number; enabled?: boolean }
      | undefined;
    const enabled = cfg?.enabled ?? true;
    const percent = cfg?.discountPercent ?? DEFAULT_LOYALTY_DISCOUNT_PERCENT;

    const discountLine =
      enabled && percent > 0
        ? ` As an existing customer you get <strong>${percent}% off</strong> — the discount is applied automatically at checkout.`
        : "";

    const count = await notifyEditionOwners(
      edition.predecessorEditionId as string,
      () => ({
        type: "new_edition",
        title: `New edition available: ${reportTitle}`,
        body:
          `A new edition (${edition.editionLabel}) of "${reportTitle}" has been published.` +
          `${discountLine} You keep full access to the edition you already own.`,
        link: `/report-archive/${edition.reportId}`,
      })
    );

    logger.info("Announced new edition", {
      editionId: event.params.editionId,
      notified: count,
    });
  }
);
