export interface Stock {
  id: string;
  symbol: string;
  previousDayClose: number;
  currentDayClose: number;
  change: number;
}

export interface MacroeconomicData {
  id?: string;
  date: string;
  percentage: number;
}

export interface ExchangeRateData {
  id?: string;
  price: number;
}

export interface ASIData {
  id?: string;
  value: number;
  change: number;
  date: string;
}

export interface FGNTenure {
  label: string; // For bonds: "5-YEAR", "10-YEAR", etc. For T-bills: "91-DAY", "182-DAY", etc.
  rate: number; // Interest rate percentage
}

export interface FGNData {
  id?: string;
  type: "BONDS" | "T-BILLS";
  tenures: FGNTenure[];
}

export interface Stock {
  id: string;
  symbol: string;
  previousDayClose: number;
  currentDayClose: number;
  change: number;
}

export interface ResourceFile {
  id: string;
  name: string;
  url: string;
  fileType: string;
  uploadDate: string;
  category: string;
  path: string;
  icon: string; // Updated to include icon per file
}

export interface ResourceCategory {
  id: string;
  name: string;
  displayOrder: number;
}

// ---- Report Archive ---------------------------------------------------------

export interface ReportCategory {
  id: string;
  name: string;
  displayOrder: number;
}

export type ReportStatus = "draft" | "published" | "archived";

export interface Report {
  id: string;
  title: string;
  slug: string;
  categoryId: string;
  summary: string;
  description: string;
  coverImageUrl: string; // public cover art; "" if none
  currentEditionId: string | null; // latest purchasable edition
  status: ReportStatus;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export type EditionType = "major" | "minor";

export interface ReportEdition {
  id: string;
  reportId: string;
  editionLabel: string; // e.g. "2026 Edition"
  editionType: EditionType;
  predecessorEditionId: string | null; // for the loyalty successor discount
  price: number; // naira, sticker price
  currency: string; // "NGN"
  pageCount: number | null;
  status: ReportStatus;
  changeNotes: string;
  purchaseCount: number;
  viewCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Private file-path metadata for an edition (admin/function-readable only).
export interface ReportEditionFile {
  editionId: string;
  reportId: string;
  storagePath: string;
  fileType: string;
  updatedAt: string;
}

export type CustomerType = "individual" | "corporate";

export interface Customer {
  uid: string;
  type: CustomerType;
  email: string;
  name: string;
  phone: string;
  location: string;
  organizationId: string | null;
  status: "active" | "suspended";
  purchasedReportIds?: string[];
  totalSpend?: number;
  lastLoginAt?: string;
  createdAt?: string;
}

export interface Organization {
  id: string;
  orgName: string;
  industry: string;
  primaryContactUid: string;
  memberUids: string[];
  seatLimit: number;
  createdAt?: string;
}

export interface Purchase {
  id: string;
  ownerType: CustomerType;
  customerUid: string;
  organizationId: string | null;
  reportId: string;
  editionId: string;
  transactionId: string;
  price: number;
  loyaltyDiscountApplied: boolean;
  loyaltyDiscountPercent: number;
  status: "active" | "revoked";
  purchasedAt?: string;
}

export type TransactionStatus =
  | "pending"
  | "success"
  | "failed"
  | "abandoned"
  | "refunded";

export interface Transaction {
  id: string;
  paystackReference: string;
  purchaseKind: "report" | "seatAddon";
  customerUid: string;
  ownerType: CustomerType;
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
  failureReason: string | null;
  initiatedAt?: { seconds: number } | null;
  verifiedAt?: { seconds: number } | null;
}

export interface LoyaltyConfig {
  discountPercent: number;
  enabled: boolean;
  eligibility?: string;
}

export interface InvoiceLineItem {
  editionId: string;
  reportId: string;
  reportTitle: string;
  editionLabel: string;
  unitPrice: number;
  loyaltyDiscountPercent: number;
  loyaltyDiscountAmount: number;
  lineTotal: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerUid: string;
  ownerType: CustomerType;
  organizationId: string | null;
  status: "issued" | "cancelled";
  lineItems: InvoiceLineItem[];
  subtotal: number;
  discountTotal: number;
  total: number;
  currency: string;
  notes: string;
  billTo: {
    name: string;
    email: string;
    phone: string;
    organizationName: string;
    location: string;
  };
  createdAt?: { seconds: number } | null;
  expiresAt?: { seconds: number } | null;
}

export interface TopStock {
  id: string;
  symbol: string;
  previousDayClose: number;
  currentDayClose: number;
  change: number;
  displayOrder: number;
}

export interface EquityMarketList {
  id: string;
  type: "gainers" | "losers";
  stocks: TopStock[];
  lastUpdated: string;
}
