import { defineSecret, defineString } from "firebase-functions/params";

// ---- Secrets (set with: firebase functions:secrets:set <NAME>) --------------
// Paystack SECRET key — used server-side only, NEVER shipped to the browser.
export const PAYSTACK_SECRET_KEY = defineSecret("PAYSTACK_SECRET_KEY");
// Transactional email provider API key (SendGrid / Postmark / etc.).
export const EMAIL_API_KEY = defineSecret("EMAIL_API_KEY");

// ---- Non-secret params (set in .env / functions config) ---------------------
// A Paystack "split code" (recommended): create a Transaction Split in the
// Paystack dashboard with the PAC Research + Ziltch1 subaccounts and their
// 75/25 shares, then put its code here. When present it is passed on every
// transaction and Paystack performs the split automatically.
export const PAYSTACK_SPLIT_CODE = defineString("PAYSTACK_SPLIT_CODE", {
  default: "",
});

// Fallback if no split code is configured: a single Ziltch1 subaccount code
// plus the percentage that goes to it. Paystack sends that share to the
// subaccount and the remainder settles to the main (PAC Research) account.
export const ZILTCH_SUBACCOUNT_CODE = defineString("ZILTCH_SUBACCOUNT_CODE", {
  default: "",
});

// Where Paystack redirects the customer after payment (frontend callback page).
export const PAYSTACK_CALLBACK_URL = defineString("PAYSTACK_CALLBACK_URL", {
  default: "https://pacresearch.org/report-archive/payment-callback",
});

// The public site origin, used when building absolute links in emails.
export const SITE_ORIGIN = defineString("SITE_ORIGIN", {
  default: "https://pacresearch.org",
});

// Transactional email. Emails are only sent when EMAIL_API_KEY is configured;
// otherwise notifications are still recorded in-app and email is skipped.
export const EMAIL_PROVIDER = defineString("EMAIL_PROVIDER", {
  default: "sendgrid", // currently the only implemented provider
});
export const EMAIL_FROM = defineString("EMAIL_FROM", {
  default: "no-reply@pacresearch.org",
});

// ---- Static business constants (from the technical spec) --------------------
// Paystack Nigeria local-card fee estimate: 1.5% + a flat ₦100, where the flat
// fee is waived below ₦2,500 and the whole fee is capped at ₦2,000. This is
// only an ESTIMATE for pending transactions — the actual settled fee is taken
// from Paystack's verify response once a payment succeeds.
export const PAYSTACK_FEE_RATE = 0.015;
export const PAYSTACK_FLAT_FEE = 100; // extra ₦100 Paystack adds
export const PAYSTACK_FLAT_FEE_WAIVER_UNDER = 2500; // flat fee waived below this
export const PAYSTACK_FEE_CAP = 2000; // total fee capped at ₦2,000
// Revenue split of the post-fee amount.
export const PAC_RESEARCH_SHARE = 0.75;
export const ZILTCH1_SHARE = 0.25;
// Bump when the split methodology changes; the reconcile backfill reprocesses
// any transaction stamped with an older version.
//   v1: 75/25 of net (proportional fee) — superseded
//   v2: % of gross, fee shared equally (matches Paystack bearer_type "all")
export const SPLIT_VERSION = 2;
// Default loyalty discount if the loyaltyConfig/settings doc is missing.
export const DEFAULT_LOYALTY_DISCOUNT_PERCENT = 30;
// Corporate seats included with a purchase before add-ons are required.
export const DEFAULT_INCLUDED_SEATS = 3;
// How many opening pages a non-purchaser may preview (per-edition override via
// reportEditions.previewPageCount).
export const PREVIEW_PAGE_COUNT = 1;
