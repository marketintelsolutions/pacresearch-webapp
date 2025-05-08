import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  query,
  where,
  writeBatch,
  orderBy,
} from "firebase/firestore";
import {
  ref,
  deleteObject,
  listAll,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { ResourceCategory, ResourceFile } from "../types";
import { db, storage } from "../firebase/firebaseConfig";

interface ResourcesState {
  categories: ResourceCategory[];
  files: ResourceFile[];
  selectedCategory: string | null;
  loading: {
    categories: boolean;
    files: boolean;
    uploadProgress: number;
  };
  error: string | null;
  success: string | null;
}

interface FileUploadData {
  file: File;
  fileName: string;
  fileIcon: string;
}

const initialState: ResourcesState = {
  categories: [],
  files: [],
  selectedCategory: null,
  loading: {
    categories: false,
    files: false,
    uploadProgress: 0,
  },
  error: null,
  success: null,
};

// Async thunks for categories
export const fetchCategories = createAsyncThunk(
  "resources/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const categoriesRef = collection(db, "resourceCategories");
      const querySnapshot = await getDocs(categoriesRef);

      const fetchedCategories: ResourceCategory[] = [];
      querySnapshot.forEach((doc) => {
        fetchedCategories.push({
          id: doc.id,
          ...doc.data(),
        } as ResourceCategory);
      });

      // Sort by display order
      fetchedCategories.sort((a, b) => a.displayOrder - b.displayOrder);

      return fetchedCategories;
    } catch (error) {
      console.error("Error fetching categories:", error);
      return rejectWithValue("Failed to fetch categories");
    }
  }
);

export const addCategory = createAsyncThunk(
  "resources/addCategory",
  async (categoryData: Partial<ResourceCategory>, { rejectWithValue }) => {
    try {
      const newCategoryId = `cat_${Date.now()}`;
      const newCategory = {
        ...categoryData,
        id: newCategoryId,
      };

      await setDoc(doc(db, "resourceCategories", newCategoryId), newCategory);

      return newCategory as ResourceCategory;
    } catch (error) {
      console.error("Error adding category:", error);
      return rejectWithValue("Failed to add category");
    }
  }
);

export const updateCategory = createAsyncThunk(
  "resources/updateCategory",
  async (category: ResourceCategory, { rejectWithValue }) => {
    try {
      await setDoc(doc(db, "resourceCategories", category.id), category);
      return category;
    } catch (error) {
      console.error("Error updating category:", error);
      return rejectWithValue("Failed to update category");
    }
  }
);

export const deleteCategory = createAsyncThunk(
  "resources/deleteCategory",
  async (categoryId: string, { rejectWithValue, getState }) => {
    try {
      // 1. Get all files in this category
      const filesQuery = query(
        collection(db, "resourceFiles"),
        where("category", "==", categoryId)
      );
      const filesSnapshot = await getDocs(filesQuery);

      // Create a batch write for Firestore operations
      const batch = writeBatch(db);

      // Delete all files in Firebase Storage and queue Firestore deletes
      const deletePromises = filesSnapshot.docs.map(async (fileDoc) => {
        const fileData = fileDoc.data() as ResourceFile;

        // Delete from Storage
        try {
          const storageRef = ref(storage, fileData.path);
          await deleteObject(storageRef);
        } catch (storageError) {
          console.error(
            `Error deleting file from storage: ${fileData.path}`,
            storageError
          );
          // Continue with Firestore cleanup even if Storage delete fails
        }

        // Queue delete in Firestore batch
        batch.delete(doc(db, "resourceFiles", fileDoc.id));
      });

      // Wait for all storage deletions to complete
      await Promise.all(deletePromises);

      // Also try to delete the category folder in storage if it exists
      try {
        const categoryFolderRef = ref(storage, `resources/${categoryId}`);
        const folderContents = await listAll(categoryFolderRef);

        // Delete any remaining files in the folder
        const remainingFileDeletes = folderContents.items.map((itemRef) =>
          deleteObject(itemRef).catch((err) =>
            console.error(
              `Error deleting remaining file ${itemRef.fullPath}`,
              err
            )
          )
        );

        await Promise.all(remainingFileDeletes);
      } catch (folderError) {
        console.error(
          `Error cleaning up category folder: resources/${categoryId}`,
          folderError
        );
        // Continue with deletion even if folder cleanup fails
      }

      // Finally, delete the category document itself
      batch.delete(doc(db, "resourceCategories", categoryId));

      // Commit all the Firestore operations
      await batch.commit();

      return categoryId;
    } catch (error) {
      console.error("Error deleting category:", error);
      return rejectWithValue("Failed to delete category");
    }
  }
);

export const reorderCategories = createAsyncThunk(
  "resources/reorderCategories",
  async (updatedCategories: ResourceCategory[], { rejectWithValue }) => {
    try {
      // Create a batch write for better performance
      const batch = writeBatch(db);

      updatedCategories.forEach((category) => {
        const categoryRef = doc(db, "resourceCategories", category.id);
        batch.update(categoryRef, { displayOrder: category.displayOrder });
      });

      await batch.commit();

      return updatedCategories;
    } catch (error) {
      console.error("Error reordering categories:", error);
      return rejectWithValue("Failed to reorder categories");
    }
  }
);

// Async thunks for files
export const fetchFiles = createAsyncThunk(
  "resources/fetchFiles",
  async (categoryId: string | null, { rejectWithValue }) => {
    try {
      let filesQuery;

      if (categoryId === "all" || categoryId === null) {
        filesQuery = collection(db, "resourceFiles");
      } else {
        filesQuery = query(
          collection(db, "resourceFiles"),
          where("category", "==", categoryId)
        );
      }

      const querySnapshot = await getDocs(filesQuery);

      const fetchedFiles: ResourceFile[] = [];
      querySnapshot.forEach((doc) => {
        fetchedFiles.push({ id: doc.id, ...doc.data() } as ResourceFile);
      });

      // Sort by upload date (newest first)
      fetchedFiles.sort((a, b) => {
        return (
          new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
        );
      });

      return fetchedFiles;
    } catch (error) {
      console.error("Error fetching files:", error);
      return rejectWithValue("Failed to fetch files");
    }
  }
);

export const uploadFiles = createAsyncThunk(
  "resources/uploadFiles",
  async (
    {
      files,
      category,
    }: {
      files: FileUploadData[];
      category: string;
    },
    { dispatch, rejectWithValue }
  ) => {
    try {
      // Track overall progress
      let totalFiles = files.length;
      let completedFiles = 0;

      // Upload each file and collect results
      const uploadPromises = files.map(async (fileData) => {
        const { file, fileName, fileIcon } = fileData;

        // Create a reference to the file in Firebase Storage
        const fileExtension = file.name.split(".").pop() || "";
        const storageFilePath = `resources/${category}/${Date.now()}_${fileName.replace(
          /\s+/g,
          "_"
        )}.${fileExtension}`;
        const storageRef = ref(storage, storageFilePath);

        // Get file type
        const fileType = file.type || `application/${fileExtension}`;

        // Upload file with progress tracking
        const uploadTask = uploadBytesResumable(storageRef, file);

        return new Promise<ResourceFile>((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              // Track individual file progress
              const progress = Math.round(
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              );

              // Calculate overall progress (simple approach - equal weight to each file)
              const overallProgress = Math.round(
                (completedFiles * 100 + progress) / totalFiles
              );

              dispatch(setUploadProgress(overallProgress));
            },
            (error) => {
              console.error("Upload error:", error);
              reject(`Failed to upload file ${fileName}`);
            },
            async () => {
              // Upload completed successfully
              completedFiles++;

              // Get the download URL
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

              // Save file metadata to Firestore
              const fileId = `file_${Date.now()}_${Math.random()
                .toString(36)
                .substring(2, 11)}`;
              const fileData: ResourceFile = {
                id: fileId,
                name: fileName,
                url: downloadURL,
                fileType: fileType,
                uploadDate: new Date().toISOString(),
                category: category,
                path: storageFilePath,
                icon: fileIcon,
              };

              await setDoc(doc(db, "resourceFiles", fileId), fileData);

              resolve(fileData);
            }
          );
        });
      });

      // Wait for all uploads to complete
      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      console.error("Error uploading files:", error);
      return rejectWithValue("Failed to upload one or more files");
    }
  }
);

export const deleteFile = createAsyncThunk(
  "resources/deleteFile",
  async (
    { fileId, filePath }: { fileId: string; filePath: string },
    { rejectWithValue }
  ) => {
    try {
      // Delete from Storage
      const storageRef = ref(storage, filePath);
      await deleteObject(storageRef);

      // Delete from Firestore
      await deleteDoc(doc(db, "resourceFiles", fileId));

      return fileId;
    } catch (error) {
      console.error("Error deleting file:", error);
      return rejectWithValue("Failed to delete file");
    }
  }
);

const resourcesSlice = createSlice({
  name: "resources",
  initialState,
  reducers: {
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload;
    },
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
  },
  extraReducers: (builder) => {
    // Categories
    builder.addCase(fetchCategories.pending, (state) => {
      state.loading.categories = true;
      state.error = null;
    });
    builder.addCase(fetchCategories.fulfilled, (state, action) => {
      state.categories = action.payload;
      state.loading.categories = false;

      // Set default selected category if needed
      if (state.categories.length > 0 && !state.selectedCategory) {
        state.selectedCategory = state.categories[0].id;
      }
    });
    builder.addCase(fetchCategories.rejected, (state, action) => {
      state.loading.categories = false;
      state.error = action.payload as string;
    });

    builder.addCase(addCategory.pending, (state) => {
      state.error = null;
    });
    builder.addCase(addCategory.fulfilled, (state, action) => {
      state.categories.push(action.payload);
      state.success = "Category added successfully!";
    });
    builder.addCase(addCategory.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    builder.addCase(updateCategory.pending, (state) => {
      state.error = null;
    });
    builder.addCase(updateCategory.fulfilled, (state, action) => {
      const index = state.categories.findIndex(
        (cat) => cat.id === action.payload.id
      );
      if (index !== -1) {
        state.categories[index] = action.payload;
      }
      state.success = "Category updated successfully!";
    });
    builder.addCase(updateCategory.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    builder.addCase(deleteCategory.pending, (state) => {
      state.error = null;
    });
    builder.addCase(deleteCategory.fulfilled, (state, action) => {
      state.categories = state.categories.filter(
        (cat) => cat.id !== action.payload
      );
      state.success = "Category deleted successfully!";

      // Update selected category if needed
      if (state.selectedCategory === action.payload) {
        state.selectedCategory =
          state.categories.length > 0 ? state.categories[0].id : null;
      }
    });
    builder.addCase(deleteCategory.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    builder.addCase(reorderCategories.pending, (state) => {
      state.error = null;
    });
    builder.addCase(reorderCategories.fulfilled, (state, action) => {
      state.categories = action.payload;
      state.success = "Category order updated successfully!";
    });
    builder.addCase(reorderCategories.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    // Files
    builder.addCase(fetchFiles.pending, (state) => {
      state.loading.files = true;
      state.error = null;
    });
    builder.addCase(fetchFiles.fulfilled, (state, action) => {
      state.files = action.payload;
      state.loading.files = false;
    });
    builder.addCase(fetchFiles.rejected, (state, action) => {
      state.loading.files = false;
      state.error = action.payload as string;
    });

    builder.addCase(uploadFiles.pending, (state) => {
      state.error = null;
      state.loading.uploadProgress = 0;
    });
    builder.addCase(uploadFiles.fulfilled, (state, action) => {
      // Add all uploaded files to the files array
      state.files = [...action.payload, ...state.files];
      state.success = `${action.payload.length} file(s) uploaded successfully!`;
      state.loading.uploadProgress = 0;
    });
    builder.addCase(uploadFiles.rejected, (state, action) => {
      state.error = action.payload as string;
      state.loading.uploadProgress = 0;
    });

    builder.addCase(deleteFile.pending, (state) => {
      state.error = null;
    });
    builder.addCase(deleteFile.fulfilled, (state, action) => {
      state.files = state.files.filter((file) => file.id !== action.payload);
      state.success = "File deleted successfully!";
    });
    builder.addCase(deleteFile.rejected, (state, action) => {
      state.error = action.payload as string;
    });
  },
});

export const {
  setSelectedCategory,
  clearError,
  clearSuccess,
  setUploadProgress,
  resetUploadProgress,
} = resourcesSlice.actions;

export default resourcesSlice.reducer;
