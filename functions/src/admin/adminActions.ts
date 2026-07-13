import { onCall, HttpsError } from "firebase-functions/v2/https";
import { db, adminAuth, FieldValue } from "../lib/firebase";
import { assertAdmin } from "../lib/admin";
import { notifyCustomer } from "../lib/notify";
import { EMAIL_API_KEY } from "../config";

/** Write an audit-log entry (auditLogs is function-write-only by security rules). */
async function audit(
  actorUid: string,
  actorEmail: string,
  action: string,
  targetType: string,
  targetId: string,
  metadata: Record<string, unknown> = {}
) {
  await db.collection("auditLogs").add({
    actorUid,
    actorEmail,
    action,
    targetType,
    targetId,
    metadata,
    timestamp: FieldValue.serverTimestamp(),
  });
}

/**
 * Suspend or reactivate a customer. A suspended customer cannot buy (checked in
 * initializePaystackTransaction) and their Firebase Auth account is disabled,
 * which also invalidates the ID tokens the secure viewer requires.
 */
export const setCustomerStatus = onCall(
  { secrets: [EMAIL_API_KEY], cors: true },
  async (request) => {
    const admin = await assertAdmin(request.auth?.uid, [
      "superadmin",
      "admin",
      "support",
    ]);
    const { customerUid, status, reason } = (request.data ?? {}) as {
      customerUid?: string;
      status?: "active" | "suspended";
      reason?: string;
    };
    if (!customerUid || (status !== "active" && status !== "suspended")) {
      throw new HttpsError("invalid-argument", "customerUid and status required.");
    }

    await db.collection("customers").doc(customerUid).set(
      { status, updatedAt: FieldValue.serverTimestamp() },
      { merge: true }
    );
    // Disabling the auth user is what actually cuts off report viewing.
    await adminAuth.updateUser(customerUid, { disabled: status === "suspended" });

    await audit(admin.uid, admin.email, `customer.${status}`, "customer", customerUid, {
      reason: reason ?? null,
    });

    if (status === "active") {
      await notifyCustomer({
        customerUid,
        type: "account_activity",
        title: "Your account has been reactivated",
        body: "You can sign in and read your purchased reports again.",
        link: "/account",
      });
    }

    return { customerUid, status };
  }
);

/**
 * Revoke (or restore) a single purchase — e.g. for a licensing violation, per
 * the Terms of Use ("access may be revoked for violations"), without refunding.
 */
export const setPurchaseStatus = onCall(
  { secrets: [EMAIL_API_KEY], cors: true },
  async (request) => {
    const admin = await assertAdmin(request.auth?.uid, [
      "superadmin",
      "admin",
      "support",
    ]);
    const { purchaseId, status, reason } = (request.data ?? {}) as {
      purchaseId?: string;
      status?: "active" | "revoked";
      reason?: string;
    };
    if (!purchaseId || (status !== "active" && status !== "revoked")) {
      throw new HttpsError("invalid-argument", "purchaseId and status required.");
    }

    const ref = db.collection("purchases").doc(purchaseId);
    const snap = await ref.get();
    if (!snap.exists) throw new HttpsError("not-found", "Purchase not found.");

    await ref.update({
      status,
      revokedAt: status === "revoked" ? FieldValue.serverTimestamp() : null,
      revokedReason: status === "revoked" ? reason ?? "Licensing violation" : null,
    });

    await audit(admin.uid, admin.email, `purchase.${status}`, "purchase", purchaseId, {
      reason: reason ?? null,
    });

    return { purchaseId, status };
  }
);

/** Update the loyalty discount configuration (admin-configurable percentage). */
export const updateLoyaltyConfig = onCall({ cors: true }, async (request) => {
  const admin = await assertAdmin(request.auth?.uid, ["superadmin", "admin", "finance"]);
  const { discountPercent, enabled } = (request.data ?? {}) as {
    discountPercent?: number;
    enabled?: boolean;
  };
  if (
    discountPercent == null ||
    Number.isNaN(discountPercent) ||
    discountPercent < 0 ||
    discountPercent > 100
  ) {
    throw new HttpsError("invalid-argument", "discountPercent must be 0–100.");
  }

  await db.collection("loyaltyConfig").doc("settings").set(
    {
      discountPercent,
      enabled: enabled ?? true,
      eligibility: "direct-successor-only",
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: admin.uid,
    },
    { merge: true }
  );

  await audit(admin.uid, admin.email, "loyalty.update", "loyaltyConfig", "settings", {
    discountPercent,
    enabled: enabled ?? true,
  });

  return { discountPercent, enabled: enabled ?? true };
});

/** Send a password-reset email to a customer, on their behalf. */
export const sendCustomerPasswordReset = onCall({ cors: true }, async (request) => {
  const admin = await assertAdmin(request.auth?.uid, [
    "superadmin",
    "admin",
    "support",
  ]);
  const { customerUid } = (request.data ?? {}) as { customerUid?: string };
  if (!customerUid) {
    throw new HttpsError("invalid-argument", "customerUid required.");
  }

  const user = await adminAuth.getUser(customerUid);
  if (!user.email) throw new HttpsError("failed-precondition", "No email on file.");

  // Generating the link is what the Admin SDK supports; delivery goes through
  // Firebase Auth's own template when the client calls sendPasswordResetEmail.
  const link = await adminAuth.generatePasswordResetLink(user.email);

  await audit(
    admin.uid,
    admin.email,
    "customer.passwordReset",
    "customer",
    customerUid,
    {}
  );

  return { email: user.email, link };
});
