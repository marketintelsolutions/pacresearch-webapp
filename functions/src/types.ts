// Shared Firestore document shapes for the Report Archive backend.
// Timestamps are stored as Firestore Timestamps; ids mirror the document id.

export type AdminRole = "superadmin" | "admin" | "finance" | "support";

export interface AdminUser {
  uid: string;
  email: string;
  role: AdminRole;
  active: boolean;
}

export type PurchaseKind = "report" | "seatAddon";
export type OwnerType = "individual" | "corporate";
export type TransactionStatus =
  | "pending"
  | "success"
  | "failed"
  | "abandoned"
  | "refunded";

export interface ReportEdition {
  id: string;
  reportId: string;
  editionLabel: string;
  editionType: "major" | "minor";
  predecessorEditionId: string | null;
  price: number;
  currency: string;
  status: "draft" | "published" | "archived";
  purchaseCount?: number;
  viewCount?: number;
}

export interface TransactionDoc {
  id: string;
  paystackReference: string;
  purchaseKind: PurchaseKind;
  customerUid: string;
  ownerType: OwnerType;
  organizationId: string | null;
  reportId: string | null;
  editionId: string | null;
  amount: number;
  paystackFee: number;
  netAmount: number;
  splitPacResearch: number;
  splitZiltch1: number;
  currency: string;
  status: TransactionStatus;
  paymentChannel: string | null;
  loyaltyDiscountApplied: boolean;
  loyaltyDiscountPercent: number;
  termsAcceptedAt: FirebaseFirestore.Timestamp | null;
  failureReason: string | null;
}

// Minimal Paystack response shapes we rely on.
export interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    status: "success" | "failed" | "abandoned" | string;
    reference: string;
    amount: number; // kobo
    currency: string;
    channel: string | null;
    fees: number | null; // kobo
    gateway_response: string | null;
    metadata: Record<string, unknown> | null;
    customer: { email: string } | null;
  };
}
