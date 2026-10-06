import { onCall, HttpsError } from "firebase-functions/v2/https";
import { db } from "../lib/firebase";

interface RosterInput {
  organizationId?: string;
}

/**
 * Return an organization's roster (member emails + pending invites + seat usage)
 * to any member of that organization. Member/invite documents are otherwise
 * locked down by security rules, so this callable is the one sanctioned read.
 */
export const getOrgRoster = onCall({ cors: true }, async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Sign in required.");

  const { organizationId } = (request.data ?? {}) as RosterInput;
  if (!organizationId) {
    throw new HttpsError("invalid-argument", "organizationId required.");
  }

  const orgSnap = await db.collection("organizations").doc(organizationId).get();
  if (!orgSnap.exists) throw new HttpsError("not-found", "Organization not found.");
  const org = orgSnap.data() as {
    orgName: string;
    primaryContactUid: string;
    memberUids: string[];
    seatLimit: number;
  };

  if (!org.memberUids?.includes(uid)) {
    throw new HttpsError("permission-denied", "Not a member of this organization.");
  }

  const memberDocs = await Promise.all(
    (org.memberUids || []).map((memberUid) =>
      db.collection("customers").doc(memberUid).get()
    )
  );
  const members = memberDocs
    .filter((d) => d.exists)
    .map((d) => {
      const data = d.data() as {
        email?: string;
        name?: string;
        orgAccess?: { editionIds?: string[]; autoGrantFuture?: boolean };
      };
      return {
        uid: d.id,
        email: data.email ?? "",
        name: data.name ?? "",
        isPrimary: d.id === org.primaryContactUid,
        access: {
          editionIds: data.orgAccess?.editionIds ?? [],
          autoGrantFuture: data.orgAccess?.autoGrantFuture ?? false,
        },
      };
    });

  // The org's purchased reports (for the access-management UI).
  const purchaseSnap = await db
    .collection("purchases")
    .where("organizationId", "==", organizationId)
    .where("status", "==", "active")
    .get();
  const editionToReport = new Map<string, string>();
  purchaseSnap.forEach((d) => {
    const p = d.data() as { editionId?: string; reportId?: string };
    if (p.editionId) editionToReport.set(p.editionId, p.reportId ?? "");
  });
  const reports = await Promise.all(
    Array.from(editionToReport.entries()).map(async ([editionId, reportId]) => {
      let title = "Report";
      if (reportId) {
        const r = await db.collection("reports").doc(reportId).get();
        if (r.exists) title = (r.data()?.title as string) || title;
      }
      return { editionId, reportId, title };
    })
  );

  const pendingSnap = await db
    .collection("organizationInvites")
    .where("organizationId", "==", organizationId)
    .where("status", "==", "pending")
    .get();
  const pendingInvites = pendingSnap.docs.map((d) => ({
    id: d.id,
    email: (d.data().email as string) ?? "",
  }));

  return {
    orgName: org.orgName,
    seatLimit: org.seatLimit,
    used: members.length + pendingInvites.length,
    isPrimaryContact: org.primaryContactUid === uid,
    members,
    pendingInvites,
    reports,
  };
});
