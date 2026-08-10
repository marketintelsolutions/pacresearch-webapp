import { onCall, HttpsError } from "firebase-functions/v2/https";
import { db, FieldValue } from "../lib/firebase";

interface AcceptInput {
  inviteId?: string;
}

/**
 * Accept an organization invite. The signed-in user's email must match the
 * invite. On success the user is linked to the org (added to memberUids and
 * their customer profile marked corporate with the organizationId), and the
 * invite is marked accepted — all guarded by the seat limit in a transaction.
 */
export const acceptOrgInvite = onCall({ cors: true }, async (request) => {
  const uid = request.auth?.uid;
  const email = (request.auth?.token.email as string | undefined)?.toLowerCase();
  if (!uid || !email) {
    throw new HttpsError("unauthenticated", "Sign in required.");
  }

  const { inviteId } = (request.data ?? {}) as AcceptInput;
  if (!inviteId) throw new HttpsError("invalid-argument", "inviteId required.");

  const inviteRef = db.collection("organizationInvites").doc(inviteId);

  const result = await db.runTransaction(async (t) => {
    const inviteSnap = await t.get(inviteRef);
    if (!inviteSnap.exists) throw new HttpsError("not-found", "Invite not found.");
    const invite = inviteSnap.data() as {
      organizationId: string;
      email: string;
      status: string;
    };
    if (invite.status !== "pending") {
      throw new HttpsError("failed-precondition", "Invite is no longer valid.");
    }
    if (invite.email !== email) {
      throw new HttpsError("permission-denied", "This invite is for a different email.");
    }

    const orgRef = db.collection("organizations").doc(invite.organizationId);
    const orgSnap = await t.get(orgRef);
    if (!orgSnap.exists) throw new HttpsError("not-found", "Organization not found.");
    const org = orgSnap.data() as { memberUids: string[]; seatLimit: number };

    const members = org.memberUids ?? [];
    if (members.includes(uid)) {
      // Already a member — just settle the invite.
      t.update(inviteRef, { status: "accepted", acceptedAt: FieldValue.serverTimestamp() });
      return { organizationId: invite.organizationId, isNew: false };
    }
    if (members.length >= org.seatLimit) {
      throw new HttpsError("resource-exhausted", "The organization has no free seats.");
    }

    t.update(orgRef, { memberUids: FieldValue.arrayUnion(uid) });
    t.set(
      db.collection("customers").doc(uid),
      {
        type: "corporate",
        organizationId: invite.organizationId,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    t.update(inviteRef, {
      status: "accepted",
      acceptedAt: FieldValue.serverTimestamp(),
      acceptedBy: uid,
    });
    return { organizationId: invite.organizationId, isNew: true };
  });

  // New members start with access to all of the org's current reports and
  // auto-grant of future purchases (the primary contact can adjust this later).
  if (result.isNew) {
    const orgPurchases = await db
      .collection("purchases")
      .where("organizationId", "==", result.organizationId)
      .where("status", "==", "active")
      .get();
    const editionIds = Array.from(
      new Set(
        orgPurchases.docs
          .map((d) => d.data().editionId as string | undefined)
          .filter((e): e is string => !!e)
      )
    );
    await db
      .collection("customers")
      .doc(uid)
      .set(
        { orgAccess: { editionIds, autoGrantFuture: true } },
        { merge: true }
      );
  }

  return { organizationId: result.organizationId };
});
