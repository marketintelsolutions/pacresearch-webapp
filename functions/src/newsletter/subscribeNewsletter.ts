import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as crypto from "crypto";
import { db, FieldValue } from "../lib/firebase";
import { sendEmail } from "../lib/notify";
import { EMAIL_API_KEY } from "../config";

/** Where newsletter sign-up notifications are delivered. */
const NEWSLETTER_INBOX = "info@pacresearch.org";
/** Ignore repeat sign-ups from the same address within this window. */
const RESUBMIT_WINDOW_MS = 10 * 60_000;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const emailHtml = (name: string, email: string, when: string) => `
<div style="font-family:Inter,Arial,sans-serif;background:#f4f6fa;padding:32px">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden">
    <div style="background:#15284A;padding:22px 28px">
      <h1 style="color:#ffffff;margin:0;font-size:18px;letter-spacing:.02em">PAC Research</h1>
    </div>
    <div style="padding:28px">
      <h2 style="color:#15284A;margin:0 0 16px;font-size:20px">New newsletter subscription</h2>
      <p style="color:#444;line-height:1.6;margin:0 0 6px"><strong>Name:</strong> ${name}</p>
      <p style="color:#444;line-height:1.6;margin:0 0 6px"><strong>Email:</strong> ${email}</p>
      <p style="color:#444;line-height:1.6;margin:0"><strong>Subscribed at:</strong> ${when}</p>
    </div>
    <div style="padding:16px 28px;background:#fafafa;color:#999;font-size:12px">
      Sent from the newsletter form on pacresearch.org
    </div>
  </div>
</div>`;

/**
 * Public newsletter sign-up from the site's popup form. Records the subscriber
 * in Firestore and emails the details to the PAC Research inbox via SendGrid.
 */
export const subscribeNewsletter = onCall(
  { secrets: [EMAIL_API_KEY], cors: true },
  async (request) => {
    const name = String(request.data?.name ?? "").trim().slice(0, 120);
    const email = String(request.data?.email ?? "").trim().toLowerCase().slice(0, 254);

    if (name.length < 2) {
      throw new HttpsError("invalid-argument", "Name must be at least 2 characters.");
    }
    if (!EMAIL_RE.test(email)) {
      throw new HttpsError("invalid-argument", "Enter a valid email address.");
    }

    const key = crypto.createHash("sha256").update(email).digest("hex");
    const ref = db.collection("newsletterSubscribers").doc(key);
    const now = Date.now();

    // Upsert the subscriber; skip the email if this address just signed up.
    const shouldNotify = await db.runTransaction(async (t) => {
      const snap = await t.get(ref);
      const lastNotifiedAt = (snap.data()?.lastNotifiedAt as number | undefined) ?? 0;
      const notify = now - lastNotifiedAt >= RESUBMIT_WINDOW_MS;

      t.set(
        ref,
        {
          name,
          email,
          updatedAt: FieldValue.serverTimestamp(),
          ...(snap.exists ? {} : { createdAt: FieldValue.serverTimestamp() }),
          ...(notify ? { lastNotifiedAt: now } : {}),
        },
        { merge: true }
      );
      return notify;
    });

    if (!shouldNotify) return { subscribed: true };

    const when = new Date(now).toLocaleString("en-NG", { timeZone: "Africa/Lagos" });
    const sent = await sendEmail(
      NEWSLETTER_INBOX,
      `New newsletter subscription: ${name}`,
      emailHtml(escapeHtml(name), escapeHtml(email), when),
      { replyTo: email }
    );

    if (!sent) {
      // Let the same address retry immediately instead of waiting out the window.
      await ref.update({ lastNotifiedAt: 0 }).catch(() => undefined);
      logger.error("Newsletter notification email was not sent", { email });
      throw new HttpsError("unavailable", "Could not complete your subscription. Please try again.");
    }

    return { subscribed: true };
  }
);
