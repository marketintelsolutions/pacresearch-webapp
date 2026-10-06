import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { Report, ReportCategory, ReportEdition } from "../types";
import { db } from "../firebase/firebaseConfig";

interface ReportArchiveState {
  categories: ReportCategory[];
  reports: Report[]; // published only
  editionsById: Record<string, ReportEdition>;
  selectedCategory: string | null; // null = All
  activeReport: Report | null;
  activeReportEditions: ReportEdition[];
  loading: {
    catalog: boolean;
    details: boolean;
  };
  error: string | null;
}

const initialState: ReportArchiveState = {
  categories: [],
  reports: [],
  editionsById: {},
  selectedCategory: null,
  activeReport: null,
  activeReportEditions: [],
  loading: {
    catalog: false,
    details: false,
  },
  error: null,
};

/** Load the public catalogue: categories, published reports, published editions. */
export const fetchCatalog = createAsyncThunk(
  "reportArchive/fetchCatalog",
  async (_, { rejectWithValue }) => {
    try {
      const [catSnap, reportSnap, editionSnap] = await Promise.all([
        getDocs(collection(db, "reportCategories")),
        getDocs(query(collection(db, "reports"), where("status", "==", "published"))),
        getDocs(
          query(collection(db, "reportEditions"), where("status", "==", "published"))
        ),
      ]);

      const categories: ReportCategory[] = [];
      catSnap.forEach((d) =>
        categories.push({ id: d.id, ...d.data() } as ReportCategory)
      );
      categories.sort((a, b) => a.displayOrder - b.displayOrder);

      const reports: Report[] = [];
      reportSnap.forEach((d) => reports.push({ id: d.id, ...d.data() } as Report));
      reports.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));

      const editionsById: Record<string, ReportEdition> = {};
      editionSnap.forEach((d) => {
        editionsById[d.id] = { id: d.id, ...d.data() } as ReportEdition;
      });

      return { categories, reports, editionsById };
    } catch (err) {
      console.error("Error fetching catalog:", err);
      return rejectWithValue("Failed to load reports");
    }
  }
);

/** Load a single report's public detail + its published editions. */
export const fetchReportDetails = createAsyncThunk(
  "reportArchive/fetchReportDetails",
  async (reportId: string, { rejectWithValue }) => {
    try {
      const reportDoc = await getDoc(doc(db, "reports", reportId));
      if (!reportDoc.exists()) {
        return rejectWithValue("Report not found");
      }
      const report = { id: reportDoc.id, ...reportDoc.data() } as Report;
      if (report.status !== "published") {
        return rejectWithValue("Report not available");
      }

      const editionsSnap = await getDocs(
        query(
          collection(db, "reportEditions"),
          where("reportId", "==", reportId),
          where("status", "==", "published")
        )
      );
      const editions: ReportEdition[] = [];
      editionsSnap.forEach((d) =>
        editions.push({ id: d.id, ...d.data() } as ReportEdition)
      );
      editions.sort((a, b) =>
        (b.createdAt || "").localeCompare(a.createdAt || "")
      );

      return { report, editions };
    } catch (err) {
      console.error("Error fetching report details:", err);
      return rejectWithValue("Failed to load report");
    }
  }
);

const reportArchiveSlice = createSlice({
  name: "reportArchive",
  initialState,
  reducers: {
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload;
    },
    clearActiveReport: (state) => {
      state.activeReport = null;
      state.activeReportEditions = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCatalog.pending, (state) => {
      state.loading.catalog = true;
      state.error = null;
    });
    builder.addCase(fetchCatalog.fulfilled, (state, action) => {
      state.categories = action.payload.categories;
      state.reports = action.payload.reports;
      state.editionsById = action.payload.editionsById;
      state.loading.catalog = false;
    });
    builder.addCase(fetchCatalog.rejected, (state, action) => {
      state.loading.catalog = false;
      state.error = action.payload as string;
    });

    builder.addCase(fetchReportDetails.pending, (state) => {
      state.loading.details = true;
      state.error = null;
      state.activeReport = null;
      state.activeReportEditions = [];
    });
    builder.addCase(fetchReportDetails.fulfilled, (state, action) => {
      state.activeReport = action.payload.report;
      state.activeReportEditions = action.payload.editions;
      state.loading.details = false;
    });
    builder.addCase(fetchReportDetails.rejected, (state, action) => {
      state.loading.details = false;
      state.error = action.payload as string;
    });
  },
});

export const { setSelectedCategory, clearActiveReport } =
  reportArchiveSlice.actions;

export default reportArchiveSlice.reducer;
