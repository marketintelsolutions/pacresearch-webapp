import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { PAYSTACK_SECRET_KEY, EMAIL_API_KEY } from "../config";
import { isValidWebhookSignature, verifyTransaction } from "../lib/paystack";
import { fulfillFromVerify } from "./fulfill";

/**
 * Paystack webhook receiver. Verifies the signature against the raw body, then
 * independently re-verifies the transaction with Paystack (never trusting the
 * webhook payload alone) before fulfilling. Always responds 200 quickly so
 * Paystack does not retry once we've accepted the event.
 */
export const paystackWebhook = onRequest(
  { secrets: [PAYSTACK_SECRET_KEY, EMAIL_API_KEY] },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    const secret = PAYSTACK_SECRET_KEY.value();
    const signature = req.header("x-paystack-signature");
    // req.rawBody is provided by the Functions runtime for signature checks.
    const rawBody: Buffer = (req as unknown as { rawBody: Buffer }).rawBody;

    if (!isValidWebhookSignature(rawBody, signature, secret)) {
      logger.warn("Rejected Paystack webhook: invalid signature");
      res.status(401).send("Invalid signature");
      return;
    }

    const event = req.body as { event?: string; data?: { reference?: string } };
    const reference = event?.data?.reference;

    // We care about charge outcomes; acknowledge everything else.
    if (!event?.event || !reference) {
      res.status(200).send("Ignored");
      return;
    }

    if (event.event !== "charge.success") {
      // e.g. transfer.* events — nothing to fulfill here.
      res.status(200).send("Ignored");
      return;
    }

    try {
      const verify = await verifyTransaction(secret, reference);
      const result = await fulfillFromVerify(verify);
      logger.info("Webhook fulfilled", { reference, ...result });
      res.status(200).send("OK");
    } catch (err) {
      logger.error("Webhook fulfillment error", { reference, err });
      // Return 200 to avoid infinite Paystack retries on non-transient errors;
      // the client-side verify poll + logs provide the recovery path.
      res.status(200).send("Acknowledged with error");
    }
  }
);
