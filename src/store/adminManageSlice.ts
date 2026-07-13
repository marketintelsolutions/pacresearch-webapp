import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import {
  callProcessRefund,
  callSetCustomerStatus,
  callSetPurchaseStatus,
  callUpdateLoyaltyConfig,
  callSendCustomerPasswordReset,
} from "../firebase/functions";
import {
  Customer,
  LoyaltyConfig,
  Organization,
  Purchase,
  Transaction,
} from "../types";

interface AdminManageState {
  customers: Customer[];
  organizations: Organization[];
  transactions: Transaction[];
  purchases: Purchase[];
  loyalty: LoyaltyConfig;
  loading: {
    customers: boolean;
    transactions: boolean;
    loyalty: boolean;
  };
  error: string | null;
  success: string | null;
}

const initialState: AdminManageState = {
  customers: [],
  organizations: [],
  transactions: [],
  purchases: [],
  loyalty: { discountPercent: 30, enabled: true },
  loading: { customers: false, transactions: false, loyalty: false },
  error: null,
  success: null,
};

const errMsg = (err: unknown, fallback: string) =>
  err instanceof Error && err.message ? err.message : fallback;

// ---- Customers (+ organizations, for the corporate view) -------------------

export const fetchCustomers = createAsyncThunk(
  "adminManage/fetchCustomers",
  async (_, { rejectWithValue }) => {
    try {
      const [custSnap, orgSnap] = await Promise.all([
        getDocs(collection(db, "customers")),
        getDocs(collection(db, "organizations")),
      ]);
      const customers: Customer[] = [];
      custSnap.forEach((d) => customers.push({ uid: d.id, ...d.data() } as Customer));
      const organizations: Organization[] = [];
      orgSnap.forEach((d) =>
        organizations.push({ id: d.id, ...d.data() } as Organization)
      );
      return { customers, organizations };
    } catch (err) {
      return rejectWithValue(errMsg(err, "Failed to load customers"));
    }
  }
);

export const setCustomerStatus = createAsyncThunk(
  "adminManage/setCustomerStatus",
  async (
    args: { customerUid: string; status: "active" | "suspended"; reason?: string },
    { rejectWithValue }
  ) => {
    try {
      await callSetCustomerStatus(args);
      return args;
    } catch (err) {
      return rejectWithValue(errMsg(err, "Failed to update customer"));
    }
  }
);

export const sendPasswordReset = createAsyncThunk(
  "adminManage/sendPasswordReset",
  async (customerUid: string, { rejectWithValue }) => {
    try {
      const res = await callSendCustomerPasswordReset({ customerUid });
      return res.data.email;
    } catch (err) {
      return rejectWithValue(errMsg(err, "Failed to generate reset link"));
    }
  }
);

// ---- Transactions + purchases ----------------------------------------------

export const fetchTransactions = createAsyncThunk(
  "adminManage/fetchTransactions",
  async (_, { rejectWithValue }) => {
    try {
      const [txnSnap, purchaseSnap] = await Promise.all([
        getDocs(collection(db, "transactions")),
        getDocs(collection(db, "purchases")),
      ]);
      const transactions: Transaction[] = [];
      txnSnap.forEach((d) =>
        transactions.push({ id: d.id, ...d.data() } as Transaction)
      );
      transactions.sort(
        (a, b) => (b.initiatedAt?.seconds || 0) - (a.initiatedAt?.seconds || 0)
      );
      const purchases: Purchase[] = [];
      purchaseSnap.forEach((d) =>
        purchases.push({ id: d.id, ...d.data() } as Purchase)
      );
      return { transactions, purchases };
    } catch (err) {
      return rejectWithValue(errMsg(err, "Failed to load transactions"));
    }
  }
);

export const refundTransaction = createAsyncThunk(
  "adminManage/refundTransaction",
  async (
    args: { reference: string; reason?: string },
    { rejectWithValue }
  ) => {
    try {
      await callProcessRefund(args);
      return args.reference;
    } catch (err) {
      return rejectWithValue(errMsg(err, "Refund failed"));
    }
  }
);

export const setPurchaseStatus = createAsyncThunk(
  "adminManage/setPurchaseStatus",
  async (
    args: { purchaseId: string; status: "active" | "revoked"; reason?: string },
    { rejectWithValue }
  ) => {
    try {
      await callSetPurchaseStatus(args);
      return args;
    } catch (err) {
      return rejectWithValue(errMsg(err, "Failed to update access"));
    }
  }
);

// ---- Loyalty ---------------------------------------------------------------

export const fetchLoyaltyConfig = createAsyncThunk(
  "adminManage/fetchLoyaltyConfig",
  async (_, { rejectWithValue }) => {
    try {
      const snap = await getDoc(doc(db, "loyaltyConfig", "settings"));
      if (!snap.exists()) return { discountPercent: 30, enabled: true };
      return snap.data() as LoyaltyConfig;
    } catch (err) {
      return rejectWithValue(errMsg(err, "Failed to load loyalty settings"));
    }
  }
);

export const saveLoyaltyConfig = createAsyncThunk(
  "adminManage/saveLoyaltyConfig",
  async (
    args: { discountPercent: number; enabled: boolean },
    { rejectWithValue }
  ) => {
    try {
      await callUpdateLoyaltyConfig(args);
      return args;
    } catch (err) {
      return rejectWithValue(errMsg(err, "Failed to save loyalty settings"));
    }
  }
);

const adminManageSlice = createSlice({
  name: "adminManage",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCustomers.pending, (state) => {
      state.loading.customers = true;
      state.error = null;
    });
    builder.addCase(fetchCustomers.fulfilled, (state, action) => {
      state.customers = action.payload.customers;
      state.organizations = action.payload.organizations;
      state.loading.customers = false;
    });
    builder.addCase(fetchCustomers.rejected, (state, action) => {
      state.loading.customers = false;
      state.error = action.payload as string;
    });

    builder.addCase(setCustomerStatus.fulfilled, (state, action) => {
      const i = state.customers.findIndex(
        (c) => c.uid === action.payload.customerUid
      );
      if (i !== -1) state.customers[i].status = action.payload.status;
      state.success =
        action.payload.status === "suspended"
          ? "Customer suspended."
          : "Customer reactivated.";
    });
    builder.addCase(setCustomerStatus.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    builder.addCase(sendPasswordReset.fulfilled, (state, action) => {
      state.success = `Password reset link generated for ${action.payload}.`;
    });
    builder.addCase(sendPasswordReset.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    builder.addCase(fetchTransactions.pending, (state) => {
      state.loading.transactions = true;
      state.error = null;
    });
    builder.addCase(fetchTransactions.fulfilled, (state, action) => {
      state.transactions = action.payload.transactions;
      state.purchases = action.payload.purchases;
      state.loading.transactions = false;
    });
    builder.addCase(fetchTransactions.rejected, (state, action) => {
      state.loading.transactions = false;
      state.error = action.payload as string;
    });

    builder.addCase(refundTransaction.fulfilled, (state, action) => {
      const i = state.transactions.findIndex((t) => t.id === action.payload);
      if (i !== -1) state.transactions[i].status = "refunded";
      const p = state.purchases.findIndex(
        (pu) => pu.transactionId === action.payload
      );
      if (p !== -1) state.purchases[p].status = "revoked";
      state.success = "Refund processed and access revoked.";
    });
    builder.addCase(refundTransaction.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    builder.addCase(setPurchaseStatus.fulfilled, (state, action) => {
      const i = state.purchases.findIndex(
        (p) => p.id === action.payload.purchaseId
      );
      if (i !== -1) state.purchases[i].status = action.payload.status;
      state.success =
        action.payload.status === "revoked"
          ? "Access revoked."
          : "Access restored.";
    });
    builder.addCase(setPurchaseStatus.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    builder.addCase(fetchLoyaltyConfig.pending, (state) => {
      state.loading.loyalty = true;
    });
    builder.addCase(fetchLoyaltyConfig.fulfilled, (state, action) => {
      state.loyalty = action.payload as LoyaltyConfig;
      state.loading.loyalty = false;
    });
    builder.addCase(fetchLoyaltyConfig.rejected, (state, action) => {
      state.loading.loyalty = false;
      state.error = action.payload as string;
    });

    builder.addCase(saveLoyaltyConfig.fulfilled, (state, action) => {
      state.loyalty = { ...state.loyalty, ...action.payload };
      state.success = "Loyalty settings saved.";
    });
    builder.addCase(saveLoyaltyConfig.rejected, (state, action) => {
      state.error = action.payload as string;
    });
  },
});

export const { clearError, clearSuccess } = adminManageSlice.actions;
export default adminManageSlice.reducer;
