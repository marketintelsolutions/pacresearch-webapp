/*
 * Diagnose a "bought a report but My Reports is empty" case by dumping the
 * actual database records for one user and cross-referencing them.
 *
 * Usage (service account):
 *   GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json \
 *   USER_EMAIL=customer@example.com node scripts/diagnose-purchase.js
 *
 * Or by uid:
 *   GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json \
 *   USER_UID=abc123 node scripts/diagnose-purchase.js
 */
const admin = require("firebase-admin");

admin.initializeApp({
  projectId: process.env.GCLOUD_PROJECT || "pacresearch-feb77",
});
const db = admin.firestore();
const auth = admin.auth();

const line = () => console.log("-".repeat(70));

async function main() {
  const email = process.env.USER_EMAIL;
  const uidInput = process.env.USER_UID;
  if (!email && !uidInput) {
    throw new Error("Set USER_EMAIL or USER_UID.");
  }

  // 1) Resolve the Auth user.
  let userRecord;
  if (email) {
    userRecord = await auth.getUserByEmail(email.trim());
  } else {
    userRecord = await auth.getUser(uidInput.trim());
  }
  const uid = userRecord.uid;
  line();
  console.log("AUTH USER");
  console.log("  uid:  ", uid);
  console.log("  email:", userRecord.email);
  console.log("  disabled:", userRecord.disabled);

  // 2) Customer profile.
  line();
  console.log("customers/" + uid);
  const custSnap = await db.collection("customers").doc(uid).get();
  if (!custSnap.exists) {
    console.log("  ❌ NO CUSTOMER PROFILE DOC");
  } else {
    const c = custSnap.data();
    console.log("  type:              ", c.type);
    console.log("  email:             ", c.email);
    console.log("  status:            ", c.status);
    console.log("  organizationId:    ", c.organizationId);
    console.log("  purchasedReportIds:", JSON.stringify(c.purchasedReportIds || []));
    console.log("  totalSpend:        ", c.totalSpend);
  }

  // 3) Purchases owned by THIS uid.
  line();
  console.log('purchases WHERE customerUid == "' + uid + '"');
  const mine = await db
    .collection("purchases")
    .where("customerUid", "==", uid)
    .get();
  console.log("  count:", mine.size);
  mine.forEach((d) => {
    const p = d.data();
    console.log(`  • ${d.id}`);
    console.log(
      `      editionId=${p.editionId} reportId=${p.reportId} status=${p.status} org=${p.organizationId} txn=${p.transactionId}`
    );
  });

  // 4) Transactions by this uid — then check who owns each purchased edition,
  //    to catch a customerUid mismatch (purchase recorded under another uid).
  line();
  console.log('transactions WHERE customerUid == "' + uid + '"');
  const txns = await db
    .collection("transactions")
    .where("customerUid", "==", uid)
    .get();
  console.log("  count:", txns.size);
  for (const d of txns.docs) {
    const t = d.data();
    console.log(`  • ${d.id}`);
    console.log(
      `      status=${t.status} kind=${t.purchaseKind} editionId=${t.editionId} amount=${t.amount} ref=${t.paystackReference}`
    );
    // Deterministic purchase id fulfillment would have created.
    const expectedPurchaseId = `purchase_${t.paystackReference}`;
    const pSnap = await db.collection("purchases").doc(expectedPurchaseId).get();
    if (pSnap.exists) {
      const p = pSnap.data();
      const match = p.customerUid === uid ? "✅ matches uid" : "❌ OWNED BY " + p.customerUid;
      console.log(
        `      → purchase ${expectedPurchaseId}: customerUid=${p.customerUid} status=${p.status} ${match}`
      );
    } else if (t.status === "success") {
      console.log(
        `      → ❌ NO purchase doc ${expectedPurchaseId} despite success — fulfillment did not create it`
      );
    }
  }

  line();
  console.log("Done.");
}

main().then(
  () => process.exit(0),
  (err) => {
    console.error("ERROR:", err.message || err);
    process.exit(1);
  }
);
