import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { db, adminAuth, adminStorage, FieldValue } from "../lib/firebase";

/**
 * Streams a purchased report's PDF bytes to the browser after verifying, on
 * every request, a live Firebase Auth ID token AND an active purchase for the
 * requested edition (individual or organization-wide). No shareable URL is ever
 * issued — the caller must present a valid Authorization header each time.
 */
export const issueSecureViewStream = onRequest({ cors: true }, async (req, res) => {
  if (req.method !== "GET") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  // ---- authenticate ----
  const authHeader = req.header("authorization") || "";
  const match = authHeader.match(/^Bearer (.+)$/i);
  if (!match) {
    res.status(401).send("Missing bearer token");
    return;
  }
  let uid: string;
  try {
    const decoded = await adminAuth.verifyIdToken(match[1]);
    uid = decoded.uid;
  } catch {
    res.status(401).send("Invalid token");
    return;
  }

  const editionId = (req.query.editionId as string) || "";
  if (!editionId) {
    res.status(400).send("editionId required");
    return;
  }

  // ---- entitlement check (self or organization) ----
  try {
    const customerSnap = await db.collection("customers").doc(uid).get();
    const organizationId =
      (customerSnap.data()?.organizationId as string | undefined) ?? null;

    const checks = [
      db
        .collection("purchases")
        .where("editionId", "==", editionId)
        .where("customerUid", "==", uid)
        .where("status", "==", "active")
        .limit(1)
        .get(),
    ];
    if (organizationId) {
      checks.push(
        db
          .collection("purchases")
          .where("editionId", "==", editionId)
          .where("organizationId", "==", organizationId)
          .where("status", "==", "active")
          .limit(1)
          .get()
      );
    }
    const snaps = await Promise.all(checks);
    const entitled = snaps.some((s) => !s.empty);
    if (!entitled) {
      res.status(403).send("No access to this report");
      return;
    }
  } catch (err) {
    logger.error("Entitlement check failed", { editionId, uid, err });
    res.status(500).send("Access check failed");
    return;
  }

  // ---- resolve the private storage path ----
  const fileSnap = await db.collection("reportEditionFiles").doc(editionId).get();
  const storagePath = fileSnap.data()?.storagePath as string | undefined;
  if (!storagePath) {
    res.status(404).send("Report file not found");
    return;
  }

  // ---- stream, discouraging caching/saving ----
  const file = adminStorage.bucket().file(storagePath);
  const [exists] = await file.exists();
  if (!exists) {
    res.status(404).send("Report file missing");
    return;
  }

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "inline");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Best-effort view counter (don't block the stream on it).
  db.collection("reportEditions")
    .doc(editionId)
    .set({ viewCount: FieldValue.increment(1) }, { merge: true })
    .catch(() => undefined);

  file
    .createReadStream()
    .on("error", (err) => {
      logger.error("Stream error", { storagePath, err });
      if (!res.headersSent) res.status(500).send("Stream error");
      else res.end();
    })
    .pipe(res);
});
