import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import {
  ref,
  deleteObject,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import {
  Report,
  ReportCategory,
  ReportEdition,
  ReportStatus,
  EditionType,
} from "../types";
import { db, storage } from "../firebase/firebaseConfig";

interface ReportsAdminState {
  categories: ReportCategory[];
  reports: Report[];
  editions: ReportEdition[]; // editions for the currently viewed report
  activeReportId: string | null;
  loading: {
    categories: boolean;
    reports: boolean;
    editions: boolean;
    uploadProgress: number;
  };
  error: string | null;
  success: string | null;
}

const initialState: ReportsAdminState = {
  categories: [],
  reports: [],
  editions: [],
  activeReportId: null,
  loading: {
    categories: false,
    reports: false,
    editions: false,
    uploadProgress: 0,
  },
  error: null,
  success: null,
};

const nowIso = () => new Date().toISOString();
const slugify = (title: string) =>
  title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// ============================ Categories ====================================

export const fetchReportCategories = createAsyncThunk(
  "reportsAdmin/fetchReportCategories",
  async (_, { rejectWithValue }) => {
    try {
      const snap = await getDocs(collection(db, "reportCategories"));
      const cats: ReportCategory[] = [];
      snap.forEach((d) => cats.push({ id: d.id, ...d.data() } as ReportCategory));
      cats.sort((a, b) => a.displayOrder - b.displayOrder);
      return cats;
    } catch (err) {
      console.error("Error fetching report categories:", err);
      return rejectWithValue("Failed to fetch categories");
    }
  }
);

export const addReportCategory = createAsyncThunk(
  "reportsAdmin/addReportCategory",
  async (data: Partial<ReportCategory>, { rejectWithValue }) => {
    try {
      const id = `rcat_${Date.now()}`;
      const category = { ...data, id } as ReportCategory;
      await setDoc(doc(db, "reportCategories", id), category);
      return category;
    } catch (err) {
      console.error("Error adding report category:", err);
      return rejectWithValue("Failed to add category");
    }
  }
);

export const updateReportCategory = createAsyncThunk(
  "reportsAdmin/updateReportCategory",
  async (category: ReportCategory, { rejectWithValue }) => {
    try {
      await setDoc(doc(db, "reportCategories", category.id), category);
      return category;
    } catch (err) {
      console.error("Error updating report category:", err);
      return rejectWithValue("Failed to update category");
    }
  }
);

export const deleteReportCategory = createAsyncThunk(
  "reportsAdmin/deleteReportCategory",
  async (categoryId: string, { rejectWithValue }) => {
    try {
      // Block deletion while reports still reference this category.
      const reportsInCat = await getDocs(
        query(collection(db, "reports"), where("categoryId", "==", categoryId))
      );
      if (!reportsInCat.empty) {
        return rejectWithValue(
          "Cannot delete a category that still has reports. Reassign or delete them first."
        );
      }
      await deleteDoc(doc(db, "reportCategories", categoryId));
      return categoryId;
    } catch (err) {
      console.error("Error deleting report category:", err);
      return rejectWithValue("Failed to delete category");
    }
  }
);

// ============================== Reports =====================================

export const fetchReports = createAsyncThunk(
  "reportsAdmin/fetchReports",
  async (_, { rejectWithValue }) => {
    try {
      const snap = await getDocs(collection(db, "reports"));
      const reports: Report[] = [];
      snap.forEach((d) => reports.push({ id: d.id, ...d.data() } as Report));
      reports.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
      return reports;
    } catch (err) {
      console.error("Error fetching reports:", err);
      return rejectWithValue("Failed to fetch reports");
    }
  }
);

export const addReport = createAsyncThunk(
  "reportsAdmin/addReport",
  async (
    {
      data,
      coverFile,
    }: { data: Partial<Report>; coverFile?: File | null },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const id = `report_${Date.now()}`;

      let coverImageUrl = "";
      if (coverFile) {
        coverImageUrl = await uploadCover(id, coverFile, dispatch);
      }

      const report: Report = {
        id,
        title: data.title || "Untitled report",
        slug: data.slug || slugify(data.title || id),
        categoryId: data.categoryId || "",
        summary: data.summary || "",
        description: data.description || "",
        coverImageUrl,
        currentEditionId: null,
        status: (data.status as ReportStatus) || "draft",
        tags: data.tags || [],
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      await setDoc(doc(db, "reports", id), report);
      return report;
    } catch (err) {
      console.error("Error adding report:", err);
      return rejectWithValue("Failed to add report");
    }
  }
);

export const updateReport = createAsyncThunk(
  "reportsAdmin/updateReport",
  async (
    {
      report,
      coverFile,
    }: { report: Report; coverFile?: File | null },
    { dispatch, rejectWithValue }
  ) => {
    try {
      let coverImageUrl = report.coverImageUrl;
      if (coverFile) {
        coverImageUrl = await uploadCover(report.id, coverFile, dispatch);
      }
      const updated: Report = {
        ...report,
        coverImageUrl,
        slug: report.slug || slugify(report.title),
        updatedAt: nowIso(),
      };
      await setDoc(doc(db, "reports", report.id), updated);
      return updated;
    } catch (err) {
      console.error("Error updating report:", err);
      return rejectWithValue("Failed to update report");
    }
  }
);

export const setReportStatus = createAsyncThunk(
  "reportsAdmin/setReportStatus",
  async (
    { reportId, status }: { reportId: string; status: ReportStatus },
    { rejectWithValue }
  ) => {
    try {
      await updateDoc(doc(db, "reports", reportId), {
        status,
        updatedAt: nowIso(),
      });
      return { reportId, status };
    } catch (err) {
      console.error("Error updating report status:", err);
      return rejectWithValue("Failed to update report status");
    }
  }
);

export const deleteReport = createAsyncThunk(
  "reportsAdmin/deleteReport",
  async (reportId: string, { rejectWithValue }) => {
    try {
      const batch = writeBatch(db);

      // Delete all editions + their private file metadata, and Storage files.
      const editionsSnap = await getDocs(
        query(collection(db, "reportEditions"), where("reportId", "==", reportId))
      );
      const storageDeletes: Promise<unknown>[] = [];
      for (const edDoc of editionsSnap.docs) {
        const editionId = edDoc.id;
        const fileMetaSnap = await getDoc(
          doc(db, "reportEditionFiles", editionId)
        );
        const storagePath = fileMetaSnap.data()?.storagePath as string | undefined;
        if (storagePath) {
          storageDeletes.push(
            deleteObject(ref(storage, storagePath)).catch((e) =>
              console.error("Failed to delete edition file", storagePath, e)
            )
          );
        }
        batch.delete(doc(db, "reportEditionFiles", editionId));
        batch.delete(doc(db, "reportEditions", editionId));
      }
      await Promise.all(storageDeletes);

      batch.delete(doc(db, "reports", reportId));
      await batch.commit();
      return reportId;
    } catch (err) {
      console.error("Error deleting report:", err);
      return rejectWithValue("Failed to delete report");
    }
  }
);

// ============================== Editions ====================================

export const fetchEditions = createAsyncThunk(
  "reportsAdmin/fetchEditions",
  async (reportId: string, { rejectWithValue }) => {
    try {
      const snap = await getDocs(
        query(collection(db, "reportEditions"), where("reportId", "==", reportId))
      );
      const editions: ReportEdition[] = [];
      snap.forEach((d) =>
        editions.push({ id: d.id, ...d.data() } as ReportEdition)
      );
      editions.sort((a, b) =>
        (b.createdAt || "").localeCompare(a.createdAt || "")
      );
      return { reportId, editions };
    } catch (err) {
      console.error("Error fetching editions:", err);
      return rejectWithValue("Failed to fetch editions");
    }
  }
);

/**
 * Create a new (major) edition: uploads the PDF to a PRIVATE storage path,
 * records the path in reportEditionFiles (admin/function-readable only), writes
 * the edition doc WITHOUT the path, links predecessor, and points the parent
 * report's currentEditionId at it.
 */
export const addEdition = createAsyncThunk(
  "reportsAdmin/addEdition",
  async (
    {
      reportId,
      file,
      editionLabel,
      editionType,
      price,
      status,
      changeNotes,
      currentEditionId,
    }: {
      reportId: string;
      file: File;
      editionLabel: string;
      editionType: EditionType;
      price: number;
      status: ReportStatus;
      changeNotes: string;
      currentEditionId: string | null; // predecessor, from the parent report
    },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const editionId = `edition_${Date.now()}`;
      const ext = file.name.split(".").pop() || "pdf";
      const storagePath = `reports/${reportId}/${editionId}/source.${ext}`;

      await uploadWithProgress(storagePath, file, dispatch);

      // Private path metadata (never exposed to customers).
      await setDoc(doc(db, "reportEditionFiles", editionId), {
        editionId,
        reportId,
        storagePath,
        fileType: file.type || `application/${ext}`,
        updatedAt: nowIso(),
      });

      const edition: ReportEdition = {
        id: editionId,
        reportId,
        editionLabel,
        editionType,
        predecessorEditionId: editionType === "major" ? currentEditionId : null,
        price,
        currency: "NGN",
        pageCount: null,
        status,
        changeNotes,
        purchaseCount: 0,
        viewCount: 0,
        publishedAt: status === "published" ? nowIso() : null,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      await setDoc(doc(db, "reportEditions", editionId), edition);

      // A new edition becomes the report's current purchasable edition.
      await updateDoc(doc(db, "reports", reportId), {
        currentEditionId: editionId,
        updatedAt: nowIso(),
      });

      return { edition, reportId };
    } catch (err) {
      console.error("Error adding edition:", err);
      return rejectWithValue("Failed to add edition");
    }
  }
);

/**
 * Minor update: replace an existing edition's file in place. Existing
 * purchasers keep free access; nothing about pricing/entitlement changes.
 */
export const replaceEditionFile = createAsyncThunk(
  "reportsAdmin/replaceEditionFile",
  async (
    {
      edition,
      file,
      changeNotes,
    }: { edition: ReportEdition; file: File; changeNotes: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const metaSnap = await getDoc(
        doc(db, "reportEditionFiles", edition.id)
      );
      const oldPath = metaSnap.data()?.storagePath as string | undefined;
      const ext = file.name.split(".").pop() || "pdf";
      const storagePath =
        oldPath || `reports/${edition.reportId}/${edition.id}/source.${ext}`;

      await uploadWithProgress(storagePath, file, dispatch);

      await setDoc(doc(db, "reportEditionFiles", edition.id), {
        editionId: edition.id,
        reportId: edition.reportId,
        storagePath,
        fileType: file.type || `application/${ext}`,
        updatedAt: nowIso(),
      });

      const updated: ReportEdition = {
        ...edition,
        editionType: "minor",
        changeNotes: changeNotes || edition.changeNotes,
        updatedAt: nowIso(),
      };
      await updateDoc(doc(db, "reportEditions", edition.id), {
        changeNotes: updated.changeNotes,
        updatedAt: updated.updatedAt,
        // Touch a field the Phase 6 minor-update trigger can watch.
        lastMinorUpdateAt: nowIso(),
      });

      return updated;
    } catch (err) {
      console.error("Error replacing edition file:", err);
      return rejectWithValue("Failed to replace edition file");
    }
  }
);

export const updateEditionMeta = createAsyncThunk(
  "reportsAdmin/updateEditionMeta",
  async (edition: ReportEdition, { rejectWithValue }) => {
    try {
      const updated: ReportEdition = { ...edition, updatedAt: nowIso() };
      await updateDoc(doc(db, "reportEditions", edition.id), {
        editionLabel: updated.editionLabel,
        price: updated.price,
        status: updated.status,
        changeNotes: updated.changeNotes,
        publishedAt:
          updated.status === "published"
            ? updated.publishedAt || nowIso()
            : updated.publishedAt,
        updatedAt: updated.updatedAt,
      });
      return updated;
    } catch (err) {
      console.error("Error updating edition:", err);
      return rejectWithValue("Failed to update edition");
    }
  }
);

export const deleteEdition = createAsyncThunk(
  "reportsAdmin/deleteEdition",
  async (
    { edition }: { edition: ReportEdition },
    { rejectWithValue }
  ) => {
    try {
      const metaSnap = await getDoc(doc(db, "reportEditionFiles", edition.id));
      const storagePath = metaSnap.data()?.storagePath as string | undefined;
      if (storagePath) {
        await deleteObject(ref(storage, storagePath)).catch((e) =>
          console.error("Failed to delete edition file", storagePath, e)
        );
      }
      await deleteDoc(doc(db, "reportEditionFiles", edition.id));
      await deleteDoc(doc(db, "reportEditions", edition.id));

      // If this was the report's current edition, repoint to the predecessor.
      const reportSnap = await getDoc(doc(db, "reports", edition.reportId));
      if (
        reportSnap.exists() &&
        reportSnap.data()?.currentEditionId === edition.id
      ) {
        await updateDoc(doc(db, "reports", edition.reportId), {
          currentEditionId: edition.predecessorEditionId,
          updatedAt: nowIso(),
        });
      }
      return { editionId: edition.id, reportId: edition.reportId };
    } catch (err) {
      console.error("Error deleting edition:", err);
      return rejectWithValue("Failed to delete edition");
    }
  }
);

// ============================== Helpers =====================================

// Local helper: upload to Storage with progress dispatched into this slice.
function uploadWithProgress(
  storagePath: string,
  file: File,
  dispatch: (action: unknown) => void
): Promise<void> {
  const task = uploadBytesResumable(ref(storage, storagePath), file);
  return new Promise<void>((resolve, reject) => {
    task.on(
      "state_changed",
      (snap) => {
        const progress = Math.round(
          (snap.bytesTransferred / snap.totalBytes) * 100
        );
        dispatch(setUploadProgress(progress));
      },
      (err) => reject(err),
      () => resolve()
    );
  });
}

// Cover images are public; upload and return a download URL.
async function uploadCover(
  reportId: string,
  file: File,
  dispatch: (action: unknown) => void
): Promise<string> {
  const ext = file.name.split(".").pop() || "png";
  const path = `reportCovers/${reportId}/${Date.now()}_cover.${ext}`;
  await uploadWithProgress(path, file, dispatch);
  return getDownloadURL(ref(storage, path));
}

// ================================ Slice =====================================

const reportsAdminSlice = createSlice({
  name: "reportsAdmin",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    setUploadProgress: (state, action: PayloadAction<number>) => {
      state.loading.uploadProgress = action.payload;
    },
    resetUploadProgress: (state) => {
      state.loading.uploadProgress = 0;
    },
    setActiveReport: (state, action: PayloadAction<string | null>) => {
      state.activeReportId = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Categories
    builder.addCase(fetchReportCategories.pending, (state) => {
      state.loading.categories = true;
      state.error = null;
    });
    builder.addCase(fetchReportCategories.fulfilled, (state, action) => {
      state.categories = action.payload;
      state.loading.categories = false;
    });
    builder.addCase(fetchReportCategories.rejected, (state, action) => {
      state.loading.categories = false;
      state.error = action.payload as string;
    });
    builder.addCase(addReportCategory.fulfilled, (state, action) => {
      state.categories.push(action.payload);
      state.success = "Category added.";
    });
    builder.addCase(addReportCategory.rejected, (state, action) => {
      state.error = action.payload as string;
    });
    builder.addCase(updateReportCategory.fulfilled, (state, action) => {
      const i = state.categories.findIndex((c) => c.id === action.payload.id);
      if (i !== -1) state.categories[i] = action.payload;
      state.success = "Category updated.";
    });
    builder.addCase(updateReportCategory.rejected, (state, action) => {
      state.error = action.payload as string;
    });
    builder.addCase(deleteReportCategory.fulfilled, (state, action) => {
      state.categories = state.categories.filter((c) => c.id !== action.payload);
      state.success = "Category deleted.";
    });
    builder.addCase(deleteReportCategory.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    // Reports
    builder.addCase(fetchReports.pending, (state) => {
      state.loading.reports = true;
      state.error = null;
    });
    builder.addCase(fetchReports.fulfilled, (state, action) => {
      state.reports = action.payload;
      state.loading.reports = false;
    });
    builder.addCase(fetchReports.rejected, (state, action) => {
      state.loading.reports = false;
      state.error = action.payload as string;
    });
    builder.addCase(addReport.fulfilled, (state, action) => {
      state.reports.unshift(action.payload);
      state.success = "Report created.";
      state.loading.uploadProgress = 0;
    });
    builder.addCase(addReport.rejected, (state, action) => {
      state.error = action.payload as string;
      state.loading.uploadProgress = 0;
    });
    builder.addCase(updateReport.fulfilled, (state, action) => {
      const i = state.reports.findIndex((r) => r.id === action.payload.id);
      if (i !== -1) state.reports[i] = action.payload;
      state.success = "Report updated.";
      state.loading.uploadProgress = 0;
    });
    builder.addCase(updateReport.rejected, (state, action) => {
      state.error = action.payload as string;
      state.loading.uploadProgress = 0;
    });
    builder.addCase(setReportStatus.fulfilled, (state, action) => {
      const i = state.reports.findIndex((r) => r.id === action.payload.reportId);
      if (i !== -1) state.reports[i].status = action.payload.status;
      state.success = "Report status updated.";
    });
    builder.addCase(setReportStatus.rejected, (state, action) => {
      state.error = action.payload as string;
    });
    builder.addCase(deleteReport.fulfilled, (state, action) => {
      state.reports = state.reports.filter((r) => r.id !== action.payload);
      state.success = "Report deleted.";
    });
    builder.addCase(deleteReport.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    // Editions
    builder.addCase(fetchEditions.pending, (state) => {
      state.loading.editions = true;
      state.error = null;
    });
    builder.addCase(fetchEditions.fulfilled, (state, action) => {
      state.editions = action.payload.editions;
      state.activeReportId = action.payload.reportId;
      state.loading.editions = false;
    });
    builder.addCase(fetchEditions.rejected, (state, action) => {
      state.loading.editions = false;
      state.error = action.payload as string;
    });
    builder.addCase(addEdition.fulfilled, (state, action) => {
      state.editions.unshift(action.payload.edition);
      // Keep the parent report's currentEditionId in sync in local state.
      const r = state.reports.findIndex(
        (rep) => rep.id === action.payload.reportId
      );
      if (r !== -1) state.reports[r].currentEditionId = action.payload.edition.id;
      state.success = "Edition added.";
      state.loading.uploadProgress = 0;
    });
    builder.addCase(addEdition.rejected, (state, action) => {
      state.error = action.payload as string;
      state.loading.uploadProgress = 0;
    });
    builder.addCase(replaceEditionFile.fulfilled, (state, action) => {
      const i = state.editions.findIndex((e) => e.id === action.payload.id);
      if (i !== -1) state.editions[i] = action.payload;
      state.success = "Minor update uploaded. Existing purchasers keep access.";
      state.loading.uploadProgress = 0;
    });
    builder.addCase(replaceEditionFile.rejected, (state, action) => {
      state.error = action.payload as string;
      state.loading.uploadProgress = 0;
    });
    builder.addCase(updateEditionMeta.fulfilled, (state, action) => {
      const i = state.editions.findIndex((e) => e.id === action.payload.id);
      if (i !== -1) state.editions[i] = action.payload;
      state.success = "Edition updated.";
    });
    builder.addCase(updateEditionMeta.rejected, (state, action) => {
      state.error = action.payload as string;
    });
    builder.addCase(deleteEdition.fulfilled, (state, action) => {
      state.editions = state.editions.filter(
        (e) => e.id !== action.payload.editionId
      );
      state.success = "Edition deleted.";
    });
    builder.addCase(deleteEdition.rejected, (state, action) => {
      state.error = action.payload as string;
    });
  },
});

export const {
  clearError,
  clearSuccess,
  setUploadProgress,
  resetUploadProgress,
  setActiveReport,
} = reportsAdminSlice.actions;

export default reportsAdminSlice.reducer;
