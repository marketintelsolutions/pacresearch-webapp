import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { callRequestInvoice } from "../firebase/functions";
import { Invoice } from "../types";

interface InvoicesState {
  myInvoices: Invoice[];
  loading: boolean;
  error: string | null;
}

const initialState: InvoicesState = {
  myInvoices: [],
  loading: false,
  error: null,
};

const errMsg = (err: unknown, fallback: string) =>
  err instanceof Error && err.message ? err.message : fallback;

export const fetchMyInvoices = createAsyncThunk(
  "invoices/fetchMyInvoices",
  async (uid: string, { rejectWithValue }) => {
    try {
      const snap = await getDocs(
        query(collection(db, "invoices"), where("customerUid", "==", uid))
      );
      const invoices: Invoice[] = [];
      snap.forEach((d) => invoices.push({ id: d.id, ...d.data() } as Invoice));
      invoices.sort(
        (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
      );
      return invoices;
    } catch (err) {
      return rejectWithValue(errMsg(err, "Failed to load invoices"));
    }
  }
);

export const requestInvoice = createAsyncThunk(
  "invoices/requestInvoice",
  async (
    args: { editionIds: string[]; notes?: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await callRequestInvoice(args);
      return res.data;
    } catch (err) {
      return rejectWithValue(errMsg(err, "Could not generate the invoice"));
    }
  }
);

const invoicesSlice = createSlice({
  name: "invoices",
  initialState,
  reducers: {
    clearInvoiceError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchMyInvoices.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchMyInvoices.fulfilled, (state, action) => {
      state.myInvoices = action.payload;
      state.loading = false;
    });
    builder.addCase(fetchMyInvoices.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    builder.addCase(requestInvoice.rejected, (state, action) => {
      state.error = action.payload as string;
    });
  },
});

export const { clearInvoiceError } = invoicesSlice.actions;
export default invoicesSlice.reducer;
