import { onCall, HttpsError } from "firebase-functions/v2/https";
import { db, FieldValue } from "../lib/firebase";

interface InviteInput {
  organizationId?: string;
  email?: string;
}

/**
 * Invite a person (by email) to join an organization. Only the primary contact
 * may invite, and only while there is a free seat (members + pending invites <
 * seatLimit). Seats beyond the included limit require a paid seat add-on.
 */
export const inviteOrgMember = onCall({ cors: true }, async (request) => {
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

  // TODO (Phase 6): email the invitee a link to /account/accept-invite?inviteId=...
  return { inviteId, email: normalizedEmail };
});
