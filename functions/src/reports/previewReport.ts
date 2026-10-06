import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { PDFDocument } from "pdf-lib";
import { db, adminStorage } from "../lib/firebase";
import { PREVIEW_PAGE_COUNT } from "../config";

/**
 * Public (no-auth) preview: streams a PDF containing ONLY the first few pages
 * of a published edition. The truncated document is built server-side with
 * pdf-lib from the private source, so the remaining pages never leave the
 * server — a non-purchaser can sample the report without exposing the full file.
 */
export const previewReport = onRequest({ cors: true }, async (req, res) => {
  if (req.method !== "GET") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  const editionId = (req.query.editionId as string) || "";
  if (!editionId) {
    res.status(400).send("editionId required");
    return;
  }

  try {
    // Only published editions are previewable (never drafts).
    const editionSnap = await db.collection("reportEditions").doc(editionId).get();
    if (!editionSnap.exists || editionSnap.data()?.status !== "published") {
      res.status(404).send("Preview not available");
      return;
    }
    const overridePages = Number(editionSnap.data()?.previewPageCount);
    const requestedPages =
      Number.isFinite(overridePages) && overridePages > 0
        ? overridePages
        : PREVIEW_PAGE_COUNT;

    const fileSnap = await db.collection("reportEditionFiles").doc(editionId).get();
    const storagePath = fileSnap.data()?.storagePath as string | undefined;
    if (!storagePath) {
      res.status(404).send("Report file not found");
      return;
    }

    const [bytes] = await adminStorage.bucket().file(storagePath).download();

    // Copy the first N pages into a fresh document.
    const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const total = src.getPageCount();
    const n = Math.max(1, Math.min(requestedPages, total));

    const preview = await PDFDocument.create();
    const copied = await preview.copyPages(
      src,
      Array.from({ length: n }, (_, i) => i)
    );
    copied.forEach((p) => preview.addPage(p));
    const out = await preview.save();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline");
    // Safe to cache — the preview only changes when the edition file changes.
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.status(200).end(Buffer.from(out));
  } catch (err) {
    logger.error("Preview generation failed", { editionId, err });
    res.status(500).send("Could not generate preview");
  }
});
