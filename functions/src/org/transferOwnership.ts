import { onCall, HttpsError } from "firebase-functions/v2/https";
import { db, FieldValue } from "../lib/firebase";
import { notifyCustomer } from "../lib/notify";
import { EMAIL_API_KEY } from "../config";

interface Input {
  organizationId?: string;
  newOwnerUid?: string;
}

/**
 * Transfer organization ownership to another current member. Only the current
 * primary contact (owner) may do this. The new owner becomes the primary
 * contact — which grants them implicit full access to every org report — and
 * the previous owner becomes a regular team member. Past org purchases stay
 * owned by whoever paid for them (customerUid), so the previous owner keeps
 * access to the reports they bought.
 */
export const transferOwnership = onCall(
  { secrets: [EMAIL_API_KEY], cors: true },
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) throw new HttpsError("unauthenticated", "Sign in required.");

    const { organizationId, newOwnerUid } = (request.data ?? {}) as Input;
    if (!organizationId || !newOwnerUid) {
      throw new HttpsError(
        "invalid-argument",
        "organizationId and newOwnerUid required."
      );
    }

    const orgRef = db.collection("organizations").doc(organizationId);
    const orgSnap = await orgRef.get();
    if (!orgSnap.exists) {
      throw new HttpsError("not-found", "Organization not found.");
    }
    const org = orgSnap.data() as {
      orgName?: string;
      primaryContactUid: string;
      memberUids: string[];
    };

    if (org.primaryContactUid !== uid) {
      throw new HttpsError(
        "permission-denied",
        "Only the current owner can transfer ownership."
      );
    }
    if (newOwnerUid === uid) {
      throw new HttpsError("failed-precondition", "You are already the owner.");
    }
    if (!org.memberUids?.includes(newOwnerUid)) {
      throw new HttpsError(
        "not-found",
        "The new owner must be a current member of the organization."
      );
    }

    await orgRef.update({
      primaryContactUid: newOwnerUid,
      ownershipTransferredAt: FieldValue.serverTimestamp(),
      ownershipTransferredFrom: uid,
    });

    // The new owner has implicit full access as primary — clear any per-member
    // restriction so nothing narrows what an owner can see.
    await db
      .collection("customers")
      .doc(newOwnerUid)
      .set(
        { orgAccess: FieldValue.delete(), updatedAt: FieldValue.serverTimestamp() },
        { merge: true }
      );

    const orgName = org.orgName ? ` of ${org.orgName}` : "";
    await Promise.all([
      notifyCustomer({
        customerUid: newOwnerUid,
        type: "account_activity",
        title: "You're now the account owner",
        body: `You have been made the owner${orgName}. You can now manage team members, seats and report access.`,
        link: "/account",
      }).catch(() => undefined),
      notifyCustomer({
        customerUid: uid,
        type: "account_activity",
        title: "Ownership transferred",
        body: `You transferred ownership${orgName}. You are now a team member.`,
        link: "/account",
      }).catch(() => undefined),
    ]);

    return { organizationId, newOwnerUid };
  }
);
