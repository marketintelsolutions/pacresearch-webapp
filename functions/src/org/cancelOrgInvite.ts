import { onCall, HttpsError } from "firebase-functions/v2/https";
import { db } from "../lib/firebase";

interface Input {
  inviteId?: string;
}

/**
 * Cancel a pending organization invite (frees the seat it was holding). Only the
 * organization's primary contact may cancel.
 */
export const cancelOrgInvite = onCall({ cors: true }, async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Sign in required.");

  const { inviteId } = (request.data ?? {}) as Input;
  if (!inviteId) throw new HttpsError("invalid-argument", "inviteId required.");

  const inviteRef = db.collection("organizationInvites").doc(inviteId);
  const inviteSnap = await inviteRef.get();
  if (!inviteSnap.exists) throw new HttpsError("not-found", "Invite not found.");
  const invite = inviteSnap.data() as { organizationId: string; status: string };

  const orgSnap = await db
    .collection("organizations")
    .doc(invite.organizationId)
    .get();
  if (
    !orgSnap.exists ||
    (orgSnap.data() as { primaryContactUid: string }).primaryContactUid !== uid
  ) {
    throw new HttpsError("permission-denied", "Only the primary contact can cancel.");
  }
  if (invite.status !== "pending") {
    throw new HttpsError("failed-precondition", "Invite is no longer pending.");
  }

  await inviteRef.delete();
  return { inviteId };
});
