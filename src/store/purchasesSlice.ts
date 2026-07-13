import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { Purchase } from "../types";

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
    try {
      const queries = [
        getDocs(
          query(collection(db, "purchases"), where("customerUid", "==", uid))
        ),
      ];
      if (organizationId) {
        queries.push(
          getDocs(
            query(
              collection(db, "purchases"),
              where("organizationId", "==", organizationId)
            )
          )
        );
      }
      const snaps = await Promise.all(queries);

      const byId: Record<string, Purchase> = {};
      snaps.forEach((snap) =>
        snap.forEach((d) => {
          byId[d.id] = { id: d.id, ...d.data() } as Purchase;
        })
      );
      const purchases = Object.values(byId).filter(
        (p) => p.status === "active"
      );
      purchases.sort((a, b) =>
        (b.purchasedAt || "").localeCompare(a.purchasedAt || "")
      );
      return purchases;
    } catch (err) {
      console.error("Error fetching purchases:", err);
      return rejectWithValue("Failed to load your purchases");
    }
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
