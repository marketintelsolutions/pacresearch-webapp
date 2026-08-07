import { onCall, HttpsError } from "firebase-functions/v2/https";
import { db, FieldValue } from "../lib/firebase";
import { notifyCustomer } from "../lib/notify";
import { EMAIL_API_KEY } from "../config";

interface Input {
  organizationId?: string;
  memberUid?: string;
}

/**
 * Remove a member from an organization. Only the primary contact may do this,
 * and the primary contact cannot remove themselves. The member is detached from
 * the org (loses access to org-owned reports, which frees a seat).
 */
export const removeOrgMember = onCall(
  { cors: true, secrets: [EMAIL_API_KEY] },
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) throw new HttpsError("unauthenticated", "Sign in required.");

    const { organizationId, memberUid } = (request.data ?? {}) as Input;
    if (!organizationId || !memberUid) {
      throw new HttpsError("invalid-argument", "organizationId and memberUid required.");
    }

    const orgRef = db.collection("organizations").doc(organizationId);
    const orgSnap = await orgRef.get();
    if (!orgSnap.exists) throw new HttpsError("not-found", "Organization not found.");
    const org = orgSnap.data() as {
      orgName?: string;
      primaryContactUid: string;
      memberUids: string[];
    };

    if (org.primaryContactUid !== uid) {
      throw new HttpsError(
        "permission-denied",
        "Only the primary contact can remove members."
      );
    }
    if (memberUid === org.primaryContactUid) {
      throw new HttpsError(
        "failed-precondition",
        "The primary contact can't be removed."
      );
    }
    if (!org.memberUids?.includes(memberUid)) {
      throw new HttpsError("not-found", "That person isn't a member.");
    }

    // Detach: drop from the roster and clear the member's org link so the
    // entitlement check stops granting them the org's reports.
    await orgRef.update({ memberUids: FieldValue.arrayRemove(memberUid) });
    await db.collection("customers").doc(memberUid).set(
      { organizationId: null, type: "individual", updatedAt: FieldValue.serverTimestamp() },
      { merge: true }
    );

    await notifyCustomer({
      customerUid: memberUid,
      type: "account_activity",
      title: "You've been removed from an organisation",
      body:
        `You've been removed from ${org.orgName || "an organisation"} on PAC ` +
        `Research and no longer have access to its purchased reports.`,
      link: "/account",
    });

    return { organizationId, memberUid };
  }
);
