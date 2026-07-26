import { setGlobalOptions } from "firebase-functions/v2";

// Keep costs predictable across all functions in this codebase.
setGlobalOptions({ region: "us-central1", maxInstances: 10 });

// ---- Payments (Phase 1) -----------------------------------------------------
export { initializePaystackTransaction } from "./payments/initializePaystackTransaction";
export { paystackWebhook } from "./payments/paystackWebhook";
export { verifyPaystackTransaction } from "./payments/verifyPaystackTransaction";

// ---- Organizations / seats (Phase 4) ----------------------------------------
export { inviteOrgMember } from "./org/inviteOrgMember";
export { acceptOrgInvite } from "./org/acceptOrgInvite";
export { getOrgRoster } from "./org/getOrgRoster";

// ---- Secure viewer (Phase 5) ------------------------------------------------
export { issueSecureViewStream } from "./reports/issueSecureViewStream";
export { previewReport } from "./reports/previewReport";

// ---- Auth emails ------------------------------------------------------------
export { sendPasswordResetLink } from "./auth/sendPasswordResetLink";

// ---- Invoices (pro-forma quotes) --------------------------------------------
export { requestInvoice } from "./invoices/requestInvoice";
export { invoicePdf } from "./invoices/invoicePdf";
export { cancelInvoice } from "./invoices/cancelInvoice";

// ---- Admin, refunds, notifications (Phase 6) --------------------------------
export { processRefund } from "./payments/processRefund";
export { reconcileTransactionFees } from "./payments/reconcileTransactionFees";
export {
  setCustomerStatus,
  setPurchaseStatus,
  updateLoyaltyConfig,
  sendCustomerPasswordReset,
} from "./admin/adminActions";
export { onEditionPublished } from "./notifications/onEditionPublished";
export { onEditionMinorUpdate } from "./notifications/onEditionMinorUpdate";
