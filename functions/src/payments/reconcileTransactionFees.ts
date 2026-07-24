import { onCall } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { db, FieldValue } from "../lib/firebase";
import { assertAdmin } from "../lib/admin";
import { verifyTransaction } from "../lib/paystack";
import { computeSplitFromFee, fromKobo } from "../lib/money";
import { PAYSTACK_SECRET_KEY, SPLIT_VERSION } from "../config";

const BATCH = 40;

/**
 * One-off (re-runnable) backfill: re-verifies past successful transactions that
 * still carry the estimated fee and rewrites their fee/split with Paystack's
 * actual settled fee. Processes up to BATCH per call to stay within limits and
 * to bound the number of Paystack requests; returns how many remain so an admin
 * can run it again until `remaining` is 0.
 */
export const reconcileTransactionFees = onCall(
  { secrets: [PAYSTACK_SECRET_KEY], cors: true },
  async (request) => {
    const admin = await assertAdmin(request.auth?.uid, [
      "superadmin",
      "admin",
      "finance",
    ]);

    const snap = await db
      .collection("transactions")
      .where("status", "==", "success")
      .get();

    // Those not yet reconciled with the current split methodology (covers both
    // never-reconciled records and any settled under an older SPLIT_VERSION).
    const pending = snap.docs.filter(
      (d) => d.data().splitVersion !== SPLIT_VERSION
    );

    let updated = 0;
    let failed = 0;
    let scanned = 0;
    // Scan past unverifiable records (e.g. test-mode refs) to reach good ones,
    // while capping Paystack calls per invocation. Stop after BATCH updates.
    for (const docSnap of pending) {
      if (updated >= BATCH || scanned >= BATCH * 2) break;
      scanned++;
      const txn = docSnap.data() as {
        paystackReference: string;
        amount: number;
        paystackFee?: number;
        splitPacResearch?: number;
        splitZiltch1?: number;
      };
      try {
        const verify = await verifyTransaction(
          PAYSTACK_SECRET_KEY.value(),
          txn.paystackReference
        );
        const hasFee =
          verify.data.status === "success" &&
          typeof verify.data.fees === "number";
        const actual = hasFee
          ? computeSplitFromFee(txn.amount, fromKobo(verify.data.fees as number))
          : null;

        await docSnap.ref.update({
          estimatedPaystackFee: txn.paystackFee ?? null,
          estimatedSplitPacResearch: txn.splitPacResearch ?? null,
          estimatedSplitZiltch1: txn.splitZiltch1 ?? null,
          ...(actual
            ? {
                paystackFee: actual.paystackFee,
                netAmount: actual.netAmount,
                splitPacResearch: actual.splitPacResearch,
                splitZiltch1: actual.splitZiltch1,
                paystackFeeActual: true,
              }
            : {}),
          splitVersion: SPLIT_VERSION,
          reconciledAt: FieldValue.serverTimestamp(),
        });
        updated++;
      } catch (err) {
        // Couldn't reach Paystack for this ref — leave it pending for a retry.
        failed++;
        logger.error("Reconcile failed for transaction", {
          reference: txn.paystackReference,
          err,
        });
      }
    }

    await db.collection("auditLogs").add({
      actorUid: admin.uid,
      actorEmail: admin.email,
      action: "transactions.reconcileFees",
      targetType: "transactions",
      targetId: "batch",
      metadata: { scanned, updated, failed },
      timestamp: FieldValue.serverTimestamp(),
    });

    return {
      checked: scanned,
      updated,
      failed,
      remaining: Math.max(0, pending.length - updated),
    };
  }
);
