import { onCall, HttpsError } from "firebase-functions/v2/https";
import { PAYSTACK_SECRET_KEY, EMAIL_API_KEY } from "../config";
import { db } from "../lib/firebase";
import { verifyTransaction } from "../lib/paystack";
import { fulfillFromVerify } from "./fulfill";

interface VerifyInput {
  reference?: string;
}

/**
 * Client-side poll used after the customer returns from the Paystack checkout,
 * in case the webhook is delayed. Re-verifies with Paystack and fulfills if
 * successful (idempotent with the webhook). Returns the current status so the
 * checkout UI can show processing / confirmed / failed.
 */
export const verifyPaystackTransaction = onCall(
  { secrets: [PAYSTACK_SECRET_KEY, EMAIL_API_KEY], cors: true },
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) {
      throw new HttpsError("unauthenticated", "You must be signed in.");
    }
    const reference = (request.data as VerifyInput)?.reference;
    if (!reference) {
      throw new HttpsError("invalid-argument", "reference is required.");
    }

    // Ensure the caller owns this transaction before revealing anything.
    const txnSnap = await db.collection("transactions").doc(reference).get();
    if (!txnSnap.exists) {
      throw new HttpsError("not-found", "Transaction not found.");
    }
    if ((txnSnap.data() as { customerUid: string }).customerUid !== uid) {
      throw new HttpsError("permission-denied", "Not your transaction.");
    }

    const verify = await verifyTransaction(PAYSTACK_SECRET_KEY.value(), reference);
    const result = await fulfillFromVerify(verify);

    return {
      reference,
      status: result.status,
      alreadyProcessed: result.alreadyProcessed,
    };
  }
);
