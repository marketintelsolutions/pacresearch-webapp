import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as crypto from "crypto";
import { db, adminAuth } from "../lib/firebase";
import { sendEmail } from "../lib/notify";
import { EMAIL_API_KEY, SITE_ORIGIN } from "../config";

const MIN_INTERVAL_MS = 60_000; // one email per address per minute
const DAILY_CAP = 5; // per address per 24h
const DAY_MS = 86_400_000;

const emailHtml = (url: string) => `
<div style="font-family:Inter,Arial,sans-serif;background:#f4f6fa;padding:32px">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden">
    <div style="background:#15284A;padding:22px 28px">
      <h1 style="color:#ffffff;margin:0;font-size:18px;letter-spacing:.02em">PAC Research</h1>
    </div>
    <div style="padding:28px">
      <h2 style="color:#15284A;margin:0 0 12px;font-size:20px">Reset your password</h2>
      <p style="color:#444;line-height:1.6;margin:0 0 22px">
        We received a request to reset the password for your PAC Research account.
        Click the button below to choose a new one.
      </p>
      <p style="margin:0 0 24px">
        <a href="${url}" style="display:inline-block;background:#15284A;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:999px;font-weight:600">Reset password</a>
      </p>
      <p style="color:#777;font-size:13px;line-height:1.6;margin:0 0 8px">
        This link expires in one hour and can only be used once.
      </p>
      <p style="color:#777;font-size:13px;line-height:1.6;margin:0">
        If you didn't request this, you can safely ignore this email — your password won't change.
      </p>
      <p style="color:#aaa;font-size:12px;margin:24px 0 0;word-break:break-all">
        Or paste this link into your browser:<br>${url}
      </p>
    </div>
    <div style="padding:16px 28px;background:#fafafa;color:#999;font-size:12px">
      PAC Research · Victoria Island, Lagos
    </div>
  </div>
</div>`;

/**
 * Sends a branded password-reset email from PAC Research's own mail provider
 * instead of Firebase's default noreply@<project>.firebaseapp.com sender.
 *
 * The reset link is generated with the Admin SDK, then rebuilt to point at our
 * own /account/reset-password page — so no custom action URL is needed in the
 * Firebase console. Always returns success so the endpoint can't be used to
 * discover which email addresses have accounts.
 */
export const sendPasswordResetLink = onCall(
  { secrets: [EMAIL_API_KEY], cors: true },
  async (request) => {
    const email = String(request.data?.email ?? "").trim().toLowerCase();
    if (!email || !email.includes("@")) {
      throw new HttpsError("invalid-argument", "Enter a valid email address.");
    }

    // Throttle per address (Firebase's own rate limiting doesn't apply here).
    const key = crypto.createHash("sha256").update(email).digest("hex");
    const ref = db.collection("passwordResetThrottle").doc(key);
    const now = Date.now();

    const allowed = await db.runTransaction(async (t) => {
      const snap = await t.get(ref);
      const data = snap.data() as
        | { lastSentAt?: number; windowStart?: number; count?: number }
        | undefined;

      const lastSentAt = data?.lastSentAt ?? 0;
      const windowStart = data?.windowStart ?? 0;
      const withinWindow = now - windowStart < DAY_MS;
      const count = withinWindow ? data?.count ?? 0 : 0;

      if (now - lastSentAt < MIN_INTERVAL_MS) return false;
      if (count >= DAILY_CAP) return false;

      t.set(
        ref,
        {
          lastSentAt: now,
          windowStart: withinWindow ? windowStart || now : now,
          count: count + 1,
        },
        { merge: true }
      );
      return true;
    });

    if (!allowed) return { sent: true };

    try {
      // No actionCodeSettings: avoids the authorized-continue-URI requirement.
      const firebaseLink = await adminAuth.generatePasswordResetLink(email);
      const oobCode = new URL(firebaseLink).searchParams.get("oobCode");
      if (!oobCode) throw new Error("Generated link contained no oobCode");

      const resetUrl = `${SITE_ORIGIN.value()}/account/reset-password?oobCode=${encodeURIComponent(
        oobCode
      )}`;
      await sendEmail(email, "Reset your PAC Research password", emailHtml(resetUrl));
    } catch (err) {
      const code = (err as { code?: string })?.code || "";
      if (code === "auth/user-not-found") {
        // Expected for unknown addresses — stay silent, don't disclose.
        logger.info("Password reset requested for an address with no account");
      } else {
        logger.error("Password reset email failed", err);
      }
    }

    return { sent: true };
  }
);
