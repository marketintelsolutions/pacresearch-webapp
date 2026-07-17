import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { db, adminAuth } from "../lib/firebase";
import { buildInvoicePdf, InvoiceData } from "../lib/invoicePdf";

/**
 * Streams an invoice as a downloadable PDF. Auth via a Firebase ID token; the
 * caller must own the invoice (or belong to its organization) or be an admin.
 */
export const invoicePdf = onRequest({ cors: true }, async (req, res) => {
  if (req.method !== "GET") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  const authHeader = req.header("authorization") || "";
  const match = authHeader.match(/^Bearer (.+)$/i);
  if (!match) {
    res.status(401).send("Missing bearer token");
    return;
  }
  let uid: string;
  try {
    uid = (await adminAuth.verifyIdToken(match[1])).uid;
  } catch {
    res.status(401).send("Invalid token");
    return;
  }

  const invoiceId = (req.query.invoiceId as string) || "";
  if (!invoiceId) {
    res.status(400).send("invoiceId required");
    return;
  }

  const snap = await db.collection("invoices").doc(invoiceId).get();
  if (!snap.exists) {
    res.status(404).send("Invoice not found");
    return;
  }
  const inv = snap.data() as InvoiceData & {
    customerUid: string;
    organizationId: string | null;
    invoiceNumber: string;
  };

  // Authorization: owner, same organization, or an active admin.
  let allowed = inv.customerUid === uid;
  if (!allowed && inv.organizationId) {
    const c = await db.collection("customers").doc(uid).get();
    allowed = c.data()?.organizationId === inv.organizationId;
  }
  if (!allowed) {
    const a = await db.collection("adminUsers").doc(uid).get();
    allowed = a.exists && a.data()?.active === true;
  }
  if (!allowed) {
    res.status(403).send("Not your invoice");
    return;
  }

  try {
    const bytes = await buildInvoicePdf(inv);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${inv.invoiceNumber}.pdf"`
    );
    res.setHeader("Cache-Control", "no-store");
    res.status(200).end(Buffer.from(bytes));
  } catch (err) {
    logger.error("Invoice PDF generation failed", { invoiceId, err });
    res.status(500).send("Could not generate invoice");
  }
});
