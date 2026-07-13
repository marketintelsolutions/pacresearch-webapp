import { httpsCallable } from "firebase/functions";
import { functions } from "./firebaseConfig";

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

export interface OrgRosterMember {
  uid: string;
  email: string;
  name: string;
  isPrimary: boolean;
}
export interface OrgRoster {
  orgName: string;
  seatLimit: number;
  used: number;
  isPrimaryContact: boolean;
  members: OrgRosterMember[];
  pendingInvites: { id: string; email: string }[];
}

export const callGetOrgRoster = httpsCallable<
  { organizationId: string },
  OrgRoster
>(functions, "getOrgRoster");

// ---- Admin (Phase 6) --------------------------------------------------------

export const callProcessRefund = httpsCallable<
  { reference: string; reason?: string },
  { reference: string; status: string }
>(functions, "processRefund");

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
