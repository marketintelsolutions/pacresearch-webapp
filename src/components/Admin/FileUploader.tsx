import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  fetchCategories,
  uploadFiles,
  clearError,
  clearSuccess,
  resetUploadProgress,
} from "../../store/resourcesSlice";
import { fileIcons, getFileIconByType } from "../../utils/fileIcons";

// Interface for managing multiple files
interface FileEntry {
  id: string; // Local ID for tracking in the UI
  file: File;
  fileName: string;
  fileIcon: string;
}

const FileUploader: React.FC = () => {
  const dispatch = useAppDispatch();
  const { categories, loading, error, success } = useAppSelector((state) => ({
    categories: state.resources.categories,
    loading: state.resources.loading,
    error: state.resources.error,
    success: state.resources.success,
  }));

  const [selectedFiles, setSelectedFiles] = useState<FileEntry[]>([]);
  const [category, setCategory] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);

  useEffect(() => {
    // Fetch categories if not already loaded
    if (categories.length === 0) {
      dispatch(fetchCategories());
    }

    // Set default category if available
    if (categories.length > 0 && !category) {
      setCategory(categories[0].id);
    }
  }, [dispatch, categories, category]);

  // Clear success message after 5 seconds
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (success) {
      timer = setTimeout(() => {
        dispatch(clearSuccess());
      }, 5000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [success, dispatch]);

  // Clear error message after 5 seconds
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (error) {
      timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [error, dispatch]);

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles: FileEntry[] = Array.from(e.target.files).map((file) => {
        // Generate a unique local ID
        const id = `local_${Date.now()}_${Math.random()
          .toString(36)
          .substring(2, 11)}`;

        // Default file name is the original name without extension
        const fileName = file.name.split(".")[0];

        // Auto-detect file icon based on type
        const fileIcon = getFileIconByType(file.type);

        return {
          id,
          file,
          fileName,
          fileIcon,
        };
      });

      setSelectedFiles([...selectedFiles, ...newFiles]);
    }
  };

  const handleFileNameChange = (id: string, newName: string) => {
    setSelectedFiles((prevFiles) =>
      prevFiles.map((fileEntry) =>
        fileEntry.id === id ? { ...fileEntry, fileName: newName } : fileEntry
      )
    );
  };

  const handleFileIconChange = (id: string, newIcon: string) => {
    setSelectedFiles((prevFiles) =>
      prevFiles.map((fileEntry) =>
        fileEntry.id === id ? { ...fileEntry, fileIcon: newIcon } : fileEntry
      )
    );
  };

  const handleRemoveFile = (id: string) => {
    setSelectedFiles((prevFiles) =>
      prevFiles.filter((fileEntry) => fileEntry.id !== id)
    );
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedFiles.length === 0) {
      dispatch({
        type: "resources/setError",
        payload: "Please select at least one file to upload.",
      });
      return;
    }

    if (!category) {
      dispatch({
        type: "resources/setError",
        payload: "Please select a category.",
      });
      return;
    }

    // Check that all files have names
    const missingNames = selectedFiles.some((file) => !file.fileName.trim());
    if (missingNames) {
      dispatch({
        type: "resources/setError",
        payload: "Please provide a name for all files.",
      });
      return;
    }

    setUploading(true);

    try {
      // Prepare files for upload
      const filesToUpload = selectedFiles.map((fileEntry) => ({
        file: fileEntry.file,
        fileName: fileEntry.fileName,
        fileIcon: fileEntry.fileIcon,
      }));

      await dispatch(
        uploadFiles({
          files: filesToUpload,
          category,
        })
      ).unwrap();

      // Reset form
      setSelectedFiles([]);

      // Reset file input
      const fileInput = document.getElementById(
        "fileInput"
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }
    } catch (err) {
      console.error("Error during upload:", err);
    } finally {
      setUploading(false);
      dispatch(resetUploadProgress());
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Upload Resource Files</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {success}
        </div>
      )}

      <form onSubmit={handleUpload}>
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Files
            </label>
            <input
              id="fileInput"
              type="file"
              multiple
              onChange={handleFilesChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              You can select multiple files at once
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              name="category"
              value={category}
              onChange={handleCategoryChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {selectedFiles.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Selected Files ({selectedFiles.length})
              </h3>
              <div className="space-y-4 mt-2 max-h-[400px] overflow-y-auto pr-2">
                {selectedFiles.map((fileEntry) => (
                  <div
                    key={fileEntry.id}
                    className="p-4 rounded-lg border border-gray-200 bg-gray-50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="p-2 bg-primaryBlue rounded-full mr-3">
                          <img
                            src={`/images/${fileEntry.fileIcon}.svg`}
                            alt="file"
                            className="w-5 h-5"
                          />
                        </div>
                        <span className="font-medium text-gray-900 truncate max-w-[200px]">
                          {fileEntry.file.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(fileEntry.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          File Name (Display Name)
                        </label>
                        <input
                          type="text"
                          value={fileEntry.fileName}
                          onChange={(e) =>
                            handleFileNameChange(fileEntry.id, e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter display name"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          File Icon
                        </label>
                        <div className="flex space-x-2">
                          <select
                            value={fileEntry.fileIcon}
                            onChange={(e) =>
                              handleFileIconChange(fileEntry.id, e.target.value)
                            }
                            className="flex-grow px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          >
                            {fileIcons.map((icon) => (
                              <option
                                key={`${fileEntry.id}_${icon.value}`}
                                value={icon.value}
                              >
                                {icon.label}
                              </option>
                            ))}
                          </select>
                          <div className="flex items-center">
                            <div className="p-1.5 bg-primaryBlue rounded-full">
                              <img
                                src={`/images/${fileEntry.fileIcon}.svg`}
                                alt="Selected icon"
                                className="w-4 h-4"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-gray-500">
                      Size: {(fileEntry.file.size / 1024).toFixed(1)} KB • Type:{" "}
                      {fileEntry.file.type || "Unknown"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {loading.uploadProgress > 0 && (
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${loading.uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Upload progress: {loading.uploadProgress}%
            </p>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={
              uploading || loading.categories || selectedFiles.length === 0
            }
            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
              uploading || loading.categories || selectedFiles.length === 0
                ? "opacity-70 cursor-not-allowed"
                : ""
            }`}
          >
            {uploading
              ? "Uploading..."
              : `Upload ${
                  selectedFiles.length > 0 ? selectedFiles.length : ""
                } File${selectedFiles.length !== 1 ? "s" : ""}`}
          </button>

          {selectedFiles.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedFiles([])}
              disabled={uploading}
              className={`px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 ${
                uploading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              Clear All
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default FileUploader;
