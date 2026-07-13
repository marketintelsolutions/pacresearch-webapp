/*
 * One-off seeding for the Report Archive backend.
 *
 * Seeds:
 *   - the first admin (adminUsers/{uid}, role superadmin)
 *   - loyaltyConfig/settings   (30% default, enabled)
 *   - orgConfig/settings       (seat add-on price — EDIT before running)
 *
 * Usage (against the real project — requires a service account key):
 *   GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccount.json \
 *   FIRST_ADMIN_UID=<firebase-auth-uid> FIRST_ADMIN_EMAIL=<email> \
 *   SEAT_ADDON_PRICE=25000 \
 *   node scripts/seed.js
 *
 * Usage (against the local emulator):
 *   FIRESTORE_EMULATOR_HOST=localhost:8080 GCLOUD_PROJECT=pacresearch-feb77 \
 *   FIRST_ADMIN_UID=test-admin FIRST_ADMIN_EMAIL=admin@example.com \
 *   node scripts/seed.js
 */
const admin = require("firebase-admin");

admin.initializeApp({ projectId: process.env.GCLOUD_PROJECT || "pacresearch-feb77" });
const db = admin.firestore();

async function main() {
  const uid = process.env.FIRST_ADMIN_UID;
  const email = process.env.FIRST_ADMIN_EMAIL;
  const seatPrice = Number(process.env.SEAT_ADDON_PRICE || 0);

  if (!uid || !email) {
    throw new Error("Set FIRST_ADMIN_UID and FIRST_ADMIN_EMAIL.");
  }

  await db.collection("adminUsers").doc(uid).set({
    uid,
    email,
    role: "superadmin",
    active: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    createdBy: "seed-script",
  });
  console.log(`Seeded adminUsers/${uid} (superadmin).`);

  await db.collection("loyaltyConfig").doc("settings").set(
    {
      discountPercent: 30,
      eligibility: "direct-successor-only",
      enabled: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: "seed-script",
    },
    { merge: true }
  );
  console.log("Seeded loyaltyConfig/settings (30%).");

  await db.collection("orgConfig").doc("settings").set(
    {
      seatAddonPrice: seatPrice,
      currency: "NGN",
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: "seed-script",
    },
    { merge: true }
  );
  console.log(`Seeded orgConfig/settings (seatAddonPrice=${seatPrice}).`);

  console.log("Done.");
}

main().then(
  () => process.exit(0),
  (err) => {
    console.error(err);
    process.exit(1);
  }
);
