import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { Purchase } from "../types";

/**
 * Comparable milliseconds from a Firestore field that may be a Timestamp
 * ({seconds,...}), an ISO string, or null — so sorting never assumes a type.
 */
const toMillis = (v: unknown): number => {
  if (!v) return 0;
  if (typeof v === "string") return new Date(v).getTime() || 0;
  if (typeof v === "object") {
    const o = v as { seconds?: number; toMillis?: () => number };
    if (typeof o.toMillis === "function") return o.toMillis();
    if (typeof o.seconds === "number") return o.seconds * 1000;
  }
  return 0;
};

interface PurchasesState {
  myPurchases: Purchase[];
  loading: boolean;
  error: string | null;
}

const initialState: PurchasesState = {
  myPurchases: [],
  loading: false,
  error: null,
};

/**
 * Load the signed-in customer's entitlements: their own purchases plus, for
 * corporate members, any purchases owned by their organization.
 */
export const fetchMyPurchases = createAsyncThunk(
  "purchases/fetchMyPurchases",
  async (
    { uid, organizationId }: { uid: string; organizationId: string | null },
    { rejectWithValue }
  ) => {
    // Run the two reads independently so a failing org-scoped query (e.g. a
    // rules edge case) can never hide the customer's OWN purchases.
    const mineQuery = getDocs(
      query(collection(db, "purchases"), where("customerUid", "==", uid))
    );
    const orgQuery = organizationId
      ? getDocs(
          query(
            collection(db, "purchases"),
            where("organizationId", "==", organizationId)
          )
        )
      : Promise.resolve(null);

    const [mineRes, orgRes] = await Promise.allSettled([mineQuery, orgQuery]);

    const byId: Record<string, Purchase> = {};
    let anyOk = false;

    if (mineRes.status === "fulfilled" && mineRes.value) {
      anyOk = true;
      mineRes.value.forEach((d) => {
        byId[d.id] = { id: d.id, ...d.data() } as Purchase;
      });
    } else if (mineRes.status === "rejected") {
      console.error("Error fetching own purchases:", mineRes.reason);
    }

    if (orgRes.status === "fulfilled" && orgRes.value) {
      anyOk = true;
      orgRes.value.forEach((d) => {
        byId[d.id] = { id: d.id, ...d.data() } as Purchase;
      });
    } else if (orgRes.status === "rejected") {
      console.error("Error fetching org purchases:", orgRes.reason);
    }

    // Only report failure if BOTH reads failed — a partial success still shows
    // whatever the customer is entitled to.
    if (!anyOk) {
      return rejectWithValue("Failed to load your purchases");
    }

    const purchases = Object.values(byId).filter((p) => p.status === "active");
    purchases.sort((a, b) => toMillis(b.purchasedAt) - toMillis(a.purchasedAt));
    return purchases;
  }
);

const purchasesSlice = createSlice({
  name: "purchases",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchMyPurchases.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchMyPurchases.fulfilled, (state, action) => {
      state.myPurchases = action.payload;
      state.loading = false;
    });
    builder.addCase(fetchMyPurchases.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export default purchasesSlice.reducer;
