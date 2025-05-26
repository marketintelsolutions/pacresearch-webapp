import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { TopStock, EquityMarketList } from "../types";

interface EquityMarketState {
  gainers: TopStock[];
  losers: TopStock[];
  loading: {
    gainers: boolean;
    losers: boolean;
  };
  error: string | null;
  success: string | null;
}

const initialState: EquityMarketState = {
  gainers: [],
  losers: [],
  loading: {
    gainers: false,
    losers: false,
  },
  error: null,
  success: null,
};

// Async thunks for top gainers
export const fetchTopGainers = createAsyncThunk(
  "equityMarket/fetchTopGainers",
  async (_, { rejectWithValue }) => {
    try {
      const docRef = doc(db, "equityMarket", "topGainers");
      const docSnap = await getDocs(collection(db, "equityMarket"));

      const gainersDoc = docSnap.docs.find((doc) => doc.id === "topGainers");

      if (gainersDoc && gainersDoc.exists()) {
        const data = gainersDoc.data() as EquityMarketList;
        return data.stocks.sort((a, b) => a.displayOrder - b.displayOrder);
      }

      return [];
    } catch (error) {
      console.error("Error fetching top gainers:", error);
      return rejectWithValue("Failed to fetch top gainers");
    }
  }
);

export const saveTopGainers = createAsyncThunk(
  "equityMarket/saveTopGainers",
  async (stocks: TopStock[], { rejectWithValue }) => {
    try {
      const data: EquityMarketList = {
        id: "topGainers",
        type: "gainers",
        stocks: stocks.map((stock, index) => ({
          ...stock,
          displayOrder: index,
        })),
        lastUpdated: new Date().toISOString(),
      };

      await setDoc(doc(db, "equityMarket", "topGainers"), data);

      return data.stocks;
    } catch (error) {
      console.error("Error saving top gainers:", error);
      return rejectWithValue("Failed to save top gainers");
    }
  }
);

// Async thunks for top losers
export const fetchTopLosers = createAsyncThunk(
  "equityMarket/fetchTopLosers",
  async (_, { rejectWithValue }) => {
    try {
      const docRef = doc(db, "equityMarket", "topLosers");
      const docSnap = await getDocs(collection(db, "equityMarket"));

      const losersDoc = docSnap.docs.find((doc) => doc.id === "topLosers");

      if (losersDoc && losersDoc.exists()) {
        const data = losersDoc.data() as EquityMarketList;
        return data.stocks.sort((a, b) => a.displayOrder - b.displayOrder);
      }

      return [];
    } catch (error) {
      console.error("Error fetching top losers:", error);
      return rejectWithValue("Failed to fetch top losers");
    }
  }
);

export const saveTopLosers = createAsyncThunk(
  "equityMarket/saveTopLosers",
  async (stocks: TopStock[], { rejectWithValue }) => {
    try {
      const data: EquityMarketList = {
        id: "topLosers",
        type: "losers",
        stocks: stocks.map((stock, index) => ({
          ...stock,
          displayOrder: index,
        })),
        lastUpdated: new Date().toISOString(),
      };

      await setDoc(doc(db, "equityMarket", "topLosers"), data);

      return data.stocks;
    } catch (error) {
      console.error("Error saving top losers:", error);
      return rejectWithValue("Failed to save top losers");
    }
  }
);

const equityMarketSlice = createSlice({
  name: "equityMarket",
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
    // Top Gainers
    builder.addCase(fetchTopGainers.pending, (state) => {
      state.loading.gainers = true;
      state.error = null;
    });
    builder.addCase(fetchTopGainers.fulfilled, (state, action) => {
      state.gainers = action.payload;
      state.loading.gainers = false;
    });
    builder.addCase(fetchTopGainers.rejected, (state, action) => {
      state.loading.gainers = false;
      state.error = action.payload as string;
    });

    builder.addCase(saveTopGainers.pending, (state) => {
      state.loading.gainers = true;
      state.error = null;
    });
    builder.addCase(saveTopGainers.fulfilled, (state, action) => {
      state.gainers = action.payload;
      state.loading.gainers = false;
      state.success = "Top gainers saved successfully!";
    });
    builder.addCase(saveTopGainers.rejected, (state, action) => {
      state.loading.gainers = false;
      state.error = action.payload as string;
    });

    // Top Losers
    builder.addCase(fetchTopLosers.pending, (state) => {
      state.loading.losers = true;
      state.error = null;
    });
    builder.addCase(fetchTopLosers.fulfilled, (state, action) => {
      state.losers = action.payload;
      state.loading.losers = false;
    });
    builder.addCase(fetchTopLosers.rejected, (state, action) => {
      state.loading.losers = false;
      state.error = action.payload as string;
    });

    builder.addCase(saveTopLosers.pending, (state) => {
      state.loading.losers = true;
      state.error = null;
    });
    builder.addCase(saveTopLosers.fulfilled, (state, action) => {
      state.losers = action.payload;
      state.loading.losers = false;
      state.success = "Top losers saved successfully!";
    });
    builder.addCase(saveTopLosers.rejected, (state, action) => {
      state.loading.losers = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearError, clearSuccess } = equityMarketSlice.actions;

export default equityMarketSlice.reducer;
