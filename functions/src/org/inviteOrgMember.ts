import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { db, FieldValue } from "../lib/firebase";
import { sendEmail } from "../lib/notify";
import { EMAIL_API_KEY, SITE_ORIGIN } from "../config";

interface InviteInput {
  organizationId?: string;
  email?: string;
}

/**
 * Invite a person (by email) to join an organization. Only the primary contact
 * may invite, and only while there is a free seat (members + pending invites <
 * seatLimit). Seats beyond the included limit require a paid seat add-on.
 * Emails the invitee an accept link.
 */
export const inviteOrgMember = onCall(
  { cors: true, secrets: [EMAIL_API_KEY] },
  async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Sign in required.");

  const { organizationId, email } = (request.data ?? {}) as InviteInput;
  if (!organizationId || !email) {
    throw new HttpsError("invalid-argument", "organizationId and email required.");
  }
  const normalizedEmail = email.trim().toLowerCase();

  const orgRef = db.collection("organizations").doc(organizationId);
  const orgSnap = await orgRef.get();
  if (!orgSnap.exists) throw new HttpsError("not-found", "Organization not found.");

  const org = orgSnap.data() as {
    orgName?: string;
    primaryContactUid: string;
    memberUids: string[];
    seatLimit: number;
  };
  if (org.primaryContactUid !== uid) {
    throw new HttpsError("permission-denied", "Only the primary contact can invite.");
  }

  // Count current members + still-pending invites against the seat limit.
  const pendingSnap = await db
    .collection("organizationInvites")
    .where("organizationId", "==", organizationId)
    .where("status", "==", "pending")
    .get();
  const used = (org.memberUids?.length ?? 0) + pendingSnap.size;
  if (used >= org.seatLimit) {
    throw new HttpsError(
      "resource-exhausted",
      "No free seats. Purchase a seat add-on to invite more members."
    );
  }

  // Prevent duplicate pending invites for the same email.
  const dup = pendingSnap.docs.find(
    (d) => (d.data().email as string) === normalizedEmail
  );
  if (dup) {
    throw new HttpsError("already-exists", "That email already has a pending invite.");
  }

  const inviteId = `invite_${Date.now()}`;
  await db.collection("organizationInvites").doc(inviteId).set({
    id: inviteId,
    organizationId,
    email: normalizedEmail,
    status: "pending",
    invitedBy: uid,
    invitedAt: FieldValue.serverTimestamp(),
  });

  // Email the invitee an accept link. (No-op if EMAIL_API_KEY isn't set — the
  // invite record still exists either way.)
  const orgName = org.orgName || "an organisation";
  const acceptUrl = `${SITE_ORIGIN.value()}/account/accept-invite?inviteId=${inviteId}`;
  const html = `
    <div style="font-family:Inter,Arial,sans-serif;color:#15284A">
      <h2 style="color:#15284A">You've been invited to join ${orgName}</h2>
      <p style="color:#444;line-height:1.6">
        You've been invited to join <strong>${orgName}</strong> on PAC Research,
        which gives you shared access to the organisation's purchased reports.
      </p>
      <p>
        <a href="${acceptUrl}" style="display:inline-block;padding:10px 20px;background:#15284A;color:#fff;border-radius:999px;text-decoration:none">Accept invitation</a>
      </p>
      <p style="color:#666;font-size:13px;line-height:1.6">
        You'll be asked to sign in or create an account with this email address
        (${normalizedEmail}) to accept.
      </p>
      <p style="font-size:12px;color:#888">PAC Research Limited</p>
    </div>`;
  try {
    await sendEmail(
      normalizedEmail,
      `You've been invited to join ${orgName} on PAC Research`,
      html
    );
  } catch (err) {
    logger.warn("Failed to send org invite email", { inviteId, err });
  }

  return { inviteId, email: normalizedEmail };
});
