import { onCall } from "firebase-functions/v2/https";
import { db, FieldValue } from "../lib/firebase";
import { assertAdmin } from "../lib/admin";

/**
 * One-time migration: grant every existing corporate member that has no
 * orgAccess field yet access to all of their organization's current reports,
 * with auto-grant of future purchases on. Idempotent — members who already have
 * an orgAccess field are left untouched. Admin only.
 */
export const backfillOrgAccess = onCall({ cors: true }, async (request) => {
  await assertAdmin(request.auth?.uid, ["superadmin", "admin"]);

  const orgsSnap = await db.collection("organizations").get();
  let updated = 0;
  let skipped = 0;

  for (const orgDoc of orgsSnap.docs) {
    const org = orgDoc.data() as {
      memberUids?: string[];
      primaryContactUid?: string;
    };
    const members = (org.memberUids ?? []).filter(
      (m) => m !== org.primaryContactUid
    );
    if (members.length === 0) continue;

    // Editions the org currently owns.
    const purchaseSnap = await db
      .collection("purchases")
      .where("organizationId", "==", orgDoc.id)
      .where("status", "==", "active")
      .get();
    const editionIds = Array.from(
      new Set(
        purchaseSnap.docs
          .map((d) => d.data().editionId as string | undefined)
          .filter((e): e is string => !!e)
      )
    );

    for (const memberUid of members) {
      const cSnap = await db.collection("customers").doc(memberUid).get();
      if (cSnap.data()?.orgAccess) {
        skipped++;
        continue;
      }
      await db.collection("customers").doc(memberUid).set(
        {
          orgAccess: { editionIds, autoGrantFuture: true },
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      updated++;
    }
  }

  return { updated, skipped };
});
