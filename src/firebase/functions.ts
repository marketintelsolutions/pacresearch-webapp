import { httpsCallable } from "firebase/functions";
import { functions, auth } from "./firebaseConfig";

// Typed wrappers around the Report Archive Cloud Functions callables.
// Names must match the exported function names in functions/src/index.ts.

export interface InitTransactionInput {
  purchaseKind: "report" | "seatAddon";
  editionId?: string;
  organizationId?: string;
  termsAccepted?: boolean;
}
export interface InitTransactionResult {
  reference: string;
  authorizationUrl: string;
  accessCode: string;
  amount: number;
  currency: string;
  loyaltyDiscountApplied: boolean;
  loyaltyDiscountPercent: number;
}

export const callInitializeTransaction = httpsCallable<
  InitTransactionInput,
  InitTransactionResult
>(functions, "initializePaystackTransaction");

export const callVerifyTransaction = httpsCallable<
  { reference: string },
  { reference: string; status: string; alreadyProcessed: boolean }
>(functions, "verifyPaystackTransaction");

export const callInviteOrgMember = httpsCallable<
  { organizationId: string; email: string },
  { inviteId: string; email: string }
>(functions, "inviteOrgMember");

export const callAcceptOrgInvite = httpsCallable<
  { inviteId: string },
  { organizationId: string }
>(functions, "acceptOrgInvite");

export const callRemoveOrgMember = httpsCallable<
  { organizationId: string; memberUid: string },
  { organizationId: string; memberUid: string }
>(functions, "removeOrgMember");

export const callCancelOrgInvite = httpsCallable<
  { inviteId: string },
  { inviteId: string }
>(functions, "cancelOrgInvite");

export interface OrgMemberAccess {
  editionIds: string[];
  autoGrantFuture: boolean;
}
export interface OrgRosterMember {
  uid: string;
  email: string;
  name: string;
  isPrimary: boolean;
  access: OrgMemberAccess;
}
export interface OrgRosterReport {
  editionId: string;
  reportId: string;
  title: string;
}
export interface OrgRoster {
  orgName: string;
  seatLimit: number;
  used: number;
  isPrimaryContact: boolean;
  members: OrgRosterMember[];
  pendingInvites: { id: string; email: string }[];
  reports: OrgRosterReport[];
}

export const callGetOrgRoster = httpsCallable<
  { organizationId: string },
  OrgRoster
>(functions, "getOrgRoster");

export const callSetMemberAccess = httpsCallable<
  {
    organizationId: string;
    memberUid: string;
    editionIds: string[];
    autoGrantFuture: boolean;
  },
  { memberUid: string; editionIds: string[]; autoGrantFuture: boolean }
>(functions, "setMemberAccess");

// ---- Admin (Phase 6) --------------------------------------------------------

export const callProcessRefund = httpsCallable<
  { reference: string; reason?: string },
  { reference: string; status: string }
>(functions, "processRefund");

export const callReconcileTransactionFees = httpsCallable<
  void,
  { checked: number; updated: number; failed: number; remaining: number }
>(functions, "reconcileTransactionFees");

export const callSetCustomerStatus = httpsCallable<
  { customerUid: string; status: "active" | "suspended"; reason?: string },
  { customerUid: string; status: string }
>(functions, "setCustomerStatus");

export const callSetPurchaseStatus = httpsCallable<
  { purchaseId: string; status: "active" | "revoked"; reason?: string },
  { purchaseId: string; status: string }
>(functions, "setPurchaseStatus");

export const callUpdateLoyaltyConfig = httpsCallable<
  { discountPercent: number; enabled: boolean },
  { discountPercent: number; enabled: boolean }
>(functions, "updateLoyaltyConfig");

export const callSendCustomerPasswordReset = httpsCallable<
  { customerUid: string },
  { email: string; link: string }
>(functions, "sendCustomerPasswordReset");

// ---- Auth emails ------------------------------------------------------------

/** Sends a branded reset email from PAC Research's own provider. */
export const callSendPasswordResetLink = httpsCallable<
  { email: string },
  { sent: boolean }
>(functions, "sendPasswordResetLink");

// ---- Invoices ---------------------------------------------------------------

export const callRequestInvoice = httpsCallable<
  { editionIds: string[]; notes?: string },
  { invoiceId: string; invoiceNumber: string; total: number }
>(functions, "requestInvoice");

export const callCancelInvoice = httpsCallable<
  { invoiceId: string },
  { invoiceId: string; status: string }
>(functions, "cancelInvoice");

export const INVOICE_PDF_URL =
  process.env.REACT_APP_INVOICE_PDF_URL ||
  "https://us-central1-pacresearch-feb77.cloudfunctions.net/invoicePdf";

/** Fetch the invoice PDF (auth-checked) and trigger a browser download. */
export async function downloadInvoicePdf(
  invoiceId: string,
  invoiceNumber: string
): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("Sign in required.");
  const token = await user.getIdToken();
  const res = await fetch(
    `${INVOICE_PDF_URL}?invoiceId=${encodeURIComponent(invoiceId)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) throw new Error("Could not download the invoice.");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${invoiceNumber}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
