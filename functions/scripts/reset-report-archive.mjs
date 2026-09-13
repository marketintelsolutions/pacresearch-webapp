#!/usr/bin/env node
/**
 * One-off go-live reset for the Report Archive.
 *
 * DELETES all customer/report/commerce data so the site starts clean in live
 * mode, while KEEPING admin accounts, business config, report categories, and
 * the legacy free-resources content untouched.
 *
 * Usage:
 *   node scripts/reset-report-archive.mjs            # dry run (counts only, no writes)
 *   node scripts/reset-report-archive.mjs --confirm  # actually delete
 *
 * Requires functions/serviceAccount.json (Admin SDK key for pacresearch-feb77).
 * Run from the repo root. Review the KEEP / WIPE lists below before confirming.
 */
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { getAuth } from "firebase-admin/auth";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
// serviceAccount.json lives at functions/serviceAccount.json; this script is in
// functions/scripts/, so go up one level.
const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, "..", "serviceAccount.json"), "utf8")
);

const CONFIRM = process.argv.includes("--confirm");
const BUCKET = "pacresearch-feb77.appspot.com";

// Top-level collections to wipe entirely.
const WIPE_COLLECTIONS = [
  "purchases",
  "transactions",
  "invoices",
  "organizations",
  "organizationInvites",
  "reports",
  "reportEditions",
  "reportEditionFiles",
  "auditLogs",
  "passwordResetThrottle",
];

// customers is wiped separately because each doc has a `notifications`
// subcollection that must be deleted with it.
// Storage: every object under this prefix (report source PDFs) is deleted.
const STORAGE_PREFIX = "reports/";

// Explicitly KEPT (never touched): adminUsers, loyaltyConfig, orgConfig,
// reportCategories, and legacy free-resources collections
// (resourceCategories, resourceFiles, equityMarket, fixedIncome, newsCommentary).
// counters/invoices is RESET to 0 rather than deleted.

const app = initializeApp({
  credential: cert(serviceAccount),
  storageBucket: BUCKET,
});
const db = getFirestore(app);
const bucket = getStorage(app).bucket();
const auth = getAuth(app);

async function deleteCollection(path, batchSize = 300) {
  const col = db.collection(path);
  let total = 0;
  // Page through so huge collections don't exhaust memory.
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const snap = await col.limit(batchSize).get();
    if (snap.empty) break;
    total += snap.size;
    if (CONFIRM) {
      const batch = db.batch();
      snap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    } else {
      // Dry run: count only, don't loop forever.
      return snap.size >= batchSize ? `${total}+ (dry run, first page)` : total;
    }
  }
  return total;
}

async function deleteCustomersWithSubcollections(batchSize = 200) {
  const col = db.collection("customers");
  let total = 0;
  let notifTotal = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const snap = await col.limit(batchSize).get();
    if (snap.empty) break;

    for (const doc of snap.docs) {
      // Delete the notifications subcollection first.
      const notifs = await doc.ref.collection("notifications").get();
      notifTotal += notifs.size;
      if (CONFIRM && !notifs.empty) {
        const nb = db.batch();
        notifs.docs.forEach((n) => nb.delete(n.ref));
        await nb.commit();
      }
    }

    total += snap.size;
    if (CONFIRM) {
      const batch = db.batch();
      snap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    } else {
      return {
        customers: snap.size >= batchSize ? `${total}+ (dry run)` : total,
        notifications: `${notifTotal}+ (dry run)`,
      };
    }
  }
  return { customers: total, notifications: notifTotal };
}

async function deleteStoragePrefix(prefix) {
  const [files] = await bucket.getFiles({ prefix });
  if (CONFIRM) {
    await Promise.all(files.map((f) => f.delete().catch(() => undefined)));
  }
  return files.length;
}

async function deleteAuthUsersExceptAdmins() {
  // Never delete an admin's login. Admin uids are the doc ids of adminUsers.
  const adminSnap = await db.collection("adminUsers").get();
  const adminUids = new Set(adminSnap.docs.map((d) => d.id));

  const toDelete = [];
  let nextPageToken;
  do {
    const page = await auth.listUsers(1000, nextPageToken);
    for (const u of page.users) {
      if (!adminUids.has(u.uid)) toDelete.push(u.uid);
    }
    nextPageToken = page.pageToken;
  } while (nextPageToken);

  let deleted = 0;
  if (CONFIRM) {
    // deleteUsers handles up to 1000 uids per call.
    for (let i = 0; i < toDelete.length; i += 1000) {
      const chunk = toDelete.slice(i, i + 1000);
      const res = await auth.deleteUsers(chunk);
      deleted += res.successCount;
      if (res.failureCount > 0) {
        console.warn(
          `    (${res.failureCount} auth deletions failed:`,
          res.errors.map((e) => e.error.message).join("; "),
          ")"
        );
      }
    }
  }
  return {
    adminsKept: adminUids.size,
    wouldDelete: toDelete.length,
    deleted: CONFIRM ? deleted : `${toDelete.length} (dry run)`,
  };
}

async function resetInvoiceCounter() {
  const ref = db.collection("counters").doc("invoices");
  const snap = await ref.get();
  if (!snap.exists) return "counters/invoices absent (nothing to reset)";
  // requestInvoice computes seq = (stored.next || 0) + 1, so reset next to 0 to
  // make the first live invoice PAC-PI-<year>-0001.
  if (CONFIRM) await ref.set({ next: 0 }, { merge: true });
  return `counters/invoices.next -> 0 (was ${JSON.stringify(snap.data())})`;
}

async function main() {
  console.log(
    `\n=== Report Archive reset — ${
      CONFIRM ? "LIVE DELETE" : "DRY RUN (no writes)"
    } — project ${serviceAccount.project_id} ===\n`
  );

  for (const path of WIPE_COLLECTIONS) {
    const n = await deleteCollection(path);
    console.log(`  ${path.padEnd(22)} ${CONFIRM ? "deleted" : "would delete"}: ${n}`);
  }

  const cust = await deleteCustomersWithSubcollections();
  console.log(
    `  ${"customers".padEnd(22)} ${CONFIRM ? "deleted" : "would delete"}: ${cust.customers}`
  );
  console.log(
    `  ${"  .notifications".padEnd(22)} ${CONFIRM ? "deleted" : "would delete"}: ${cust.notifications}`
  );

  const files = await deleteStoragePrefix(STORAGE_PREFIX);
  console.log(
    `  ${("storage " + STORAGE_PREFIX + "**").padEnd(22)} ${
      CONFIRM ? "deleted" : "would delete"
    }: ${files} file(s)`
  );

  const authRes = await deleteAuthUsersExceptAdmins();
  console.log(
    `  ${"auth users".padEnd(22)} ${
      CONFIRM ? "deleted" : "would delete"
    }: ${authRes.deleted} (kept ${authRes.adminsKept} admin login(s))`
  );

  const counter = await resetInvoiceCounter();
  console.log(`  ${counter}`);

  console.log("\nKEPT (untouched): adminUsers, loyaltyConfig, orgConfig,");
  console.log("  reportCategories, resourceCategories, resourceFiles,");
  console.log("  equityMarket, fixedIncome, newsCommentary\n");

  if (!CONFIRM) {
    console.log("Dry run only. Re-run with --confirm to delete.\n");
  } else {
    console.log("Done. Report Archive data cleared.\n");
  }
  process.exit(0);
}

main().catch((e) => {
  console.error("Reset failed:", e);
  process.exit(1);
});
