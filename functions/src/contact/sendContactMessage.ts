import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as crypto from "crypto";
import { db, FieldValue } from "../lib/firebase";
import { sendEmail } from "../lib/notify";
import { EMAIL_API_KEY } from "../config";

/** Where contact-form messages are delivered. */
const CONTACT_INBOX = "info@pacresearch.org";
const MIN_INTERVAL_MS = 30_000; // one message per sender every 30s
const DAILY_CAP = 10; // per sender per 24h
const DAY_MS = 86_400_000;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const emailHtml = (
  name: string,
  email: string,
  subject: string,
  message: string,
  when: string
) => `
<div style="font-family:Inter,Arial,sans-serif;background:#f4f6fa;padding:32px">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden">
    <div style="background:#15284A;padding:22px 28px">
      <h1 style="color:#ffffff;margin:0;font-size:18px;letter-spacing:.02em">PAC Research</h1>
    </div>
    <div style="padding:28px">
      <h2 style="color:#15284A;margin:0 0 16px;font-size:20px">New contact form message</h2>
      <p style="color:#444;line-height:1.6;margin:0 0 6px"><strong>Name:</strong> ${name}</p>
      <p style="color:#444;line-height:1.6;margin:0 0 6px"><strong>Email:</strong> ${email}</p>
      <p style="color:#444;line-height:1.6;margin:0 0 6px"><strong>Subject:</strong> ${subject}</p>
      <p style="color:#444;line-height:1.6;margin:0 0 16px"><strong>Received:</strong> ${when}</p>
      <div style="color:#222;line-height:1.6;white-space:pre-wrap;background:#f7f8fb;border-radius:10px;padding:16px">${message}</div>
    </div>
    <div style="padding:16px 28px;background:#fafafa;color:#999;font-size:12px">
      Sent from the contact form on pacresearch.org. Reply to this email to respond to the sender.
    </div>
  </div>
</div>`;

/**
 * Public contact form on /contact. Stores the message in Firestore and emails
 * it to the PAC Research inbox via SendGrid, with reply-to set to the sender.
 */
export const sendContactMessage = onCall(
  { secrets: [EMAIL_API_KEY], cors: true },
  async (request) => {
    const name = String(request.data?.name ?? "").trim().slice(0, 120);
    const email = String(request.data?.email ?? "").trim().toLowerCase().slice(0, 254);
    const subject = String(request.data?.subject ?? "").trim().slice(0, 200);
    const message = String(request.data?.message ?? "").trim().slice(0, 5000);

    if (name.length < 2) {
      throw new HttpsError("invalid-argument", "Name must be at least 2 characters.");
    }
    if (!EMAIL_RE.test(email)) {
      throw new HttpsError("invalid-argument", "Enter a valid email address.");
    }
    if (!subject) {
      throw new HttpsError("invalid-argument", "Subject is required.");
    }
    if (message.length < 10) {
      throw new HttpsError("invalid-argument", "Message must be at least 10 characters.");
    }

    // Throttle per sender address so the endpoint can't be used to flood the inbox.
    const key = crypto.createHash("sha256").update(email).digest("hex");
    const throttleRef = db.collection("contactThrottle").doc(key);
    const now = Date.now();

    const allowed = await db.runTransaction(async (t) => {
      const snap = await t.get(throttleRef);
      const data = snap.data() as
        | { lastSentAt?: number; windowStart?: number; count?: number }
        | undefined;
      const lastSentAt = data?.lastSentAt ?? 0;
      const windowStart = data?.windowStart ?? 0;
      const withinWindow = now - windowStart < DAY_MS;
      const count = withinWindow ? data?.count ?? 0 : 0;

      if (now - lastSentAt < MIN_INTERVAL_MS || count >= DAILY_CAP) return false;

      t.set(
        throttleRef,
        {
          lastSentAt: now,
          windowStart: withinWindow ? windowStart || now : now,
          count: count + 1,
        },
        { merge: true }
      );
      return true;
    });

    if (!allowed) {
      throw new HttpsError(
        "resource-exhausted",
        "You've sent several messages recently. Please wait a little and try again."
      );
    }

    const msgRef = await db.collection("contactMessages").add({
      name,
      email,
      subject,
      message,
      emailed: false,
      createdAt: FieldValue.serverTimestamp(),
    });

    const when = new Date(now).toLocaleString("en-NG", { timeZone: "Africa/Lagos" });
    const sent = await sendEmail(
      CONTACT_INBOX,
      `Contact form: ${subject}`,
      emailHtml(
        escapeHtml(name),
        escapeHtml(email),
        escapeHtml(subject),
        escapeHtml(message),
        when
      ),
      { replyTo: email }
    );

    if (!sent) {
      // Refund the throttle slot so the sender can retry straight away.
      await throttleRef
        .update({ lastSentAt: 0, count: FieldValue.increment(-1) })
        .catch(() => undefined);
      logger.error("Contact form email was not sent", { messageId: msgRef.id });
      throw new HttpsError("unavailable", "Your message could not be sent. Please try again.");
    }

    await msgRef.update({ emailed: true }).catch(() => undefined);
    return { sent: true };
  }
);
