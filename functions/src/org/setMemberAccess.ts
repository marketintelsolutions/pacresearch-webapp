import { onCall, HttpsError } from "firebase-functions/v2/https";
import { db, FieldValue } from "../lib/firebase";

interface Input {
  organizationId?: string;
  memberUid?: string;
  editionIds?: string[];
  autoGrantFuture?: boolean;
}

/**
 * Set which reports an organization member can access, and whether future org
 * purchases are auto-granted to them. Primary contact only. The primary contact
 * themselves always has full access, so they can't be targeted here.
 */
export const setMemberAccess = onCall({ cors: true }, async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Sign in required.");

  const { organizationId, memberUid, editionIds, autoGrantFuture } =
    (request.data ?? {}) as Input;
  if (!organizationId || !memberUid) {
    throw new HttpsError("invalid-argument", "organizationId and memberUid required.");
  }

  const orgSnap = await db.collection("organizations").doc(organizationId).get();
  if (!orgSnap.exists) throw new HttpsError("not-found", "Organization not found.");
  const org = orgSnap.data() as {
    primaryContactUid: string;
    memberUids: string[];
  };
  if (org.primaryContactUid !== uid) {
    throw new HttpsError("permission-denied", "Only the primary contact can manage access.");
  }
  if (memberUid === org.primaryContactUid) {
    throw new HttpsError("failed-precondition", "The primary contact always has full access.");
  }
  if (!org.memberUids?.includes(memberUid)) {
    throw new HttpsError("not-found", "That person isn't a member.");
  }

  // Restrict grants to editions the org actually owns.
  const purchaseSnap = await db
    .collection("purchases")
    .where("organizationId", "==", organizationId)
    .where("status", "==", "active")
    .get();
  const ownedEditions = new Set<string>();
  purchaseSnap.forEach((d) => {
    const e = d.data().editionId as string | undefined;
    if (e) ownedEditions.add(e);
  });
  const grants = (editionIds ?? []).filter((e) => ownedEditions.has(e));

  await db.collection("customers").doc(memberUid).set(
    {
      orgAccess: {
        editionIds: grants,
        autoGrantFuture: autoGrantFuture ?? false,
      },
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  return { memberUid, editionIds: grants, autoGrantFuture: autoGrantFuture ?? false };
});
