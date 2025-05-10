import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  fetchCategories,
  fetchFiles,
  deleteFile,
  batchDeleteFiles,
  setSelectedCategory,
  clearError,
  clearSuccess,
} from "../../store/resourcesSlice";

const ResourceFileManager: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    categories,
    files,
    selectedCategory,
    loading,
    error,
    success,
  } = useAppSelector((state) => ({
    categories: state.resources.categories,
    files: state.resources.files,
    selectedCategory: state.resources.selectedCategory,
    loading: state.resources.loading,
    error: state.resources.error,
    success: state.resources.success,
  }));

  // State for batch operations
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [filesPerPage, setFilesPerPage] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    // Fetch categories if not already loaded
    if (categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categories]);

  useEffect(() => {
    // Fetch files when selected category changes
    if (selectedCategory) {
      dispatch(fetchFiles(selectedCategory));
      setCurrentPage(1); // Reset to first page
    }
  }, [dispatch, selectedCategory]);

  // Reset selection when files change
  useEffect(() => {
    setSelectedFiles(new Set());
    setSelectAll(false);
  }, [files]);

  // Clear success message after 3 seconds
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (success) {
      timer = setTimeout(() => {
        dispatch(clearSuccess());
      }, 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [success, dispatch]);

  // Clear error message after 3 seconds
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (error) {
      timer = setTimeout(() => {
        dispatch(clearError());
      }, 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [error, dispatch]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(
      setSelectedCategory(e.target.value === "all" ? "all" : e.target.value)
    );
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when search changes
  };

  const handleFilesPerPageChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setFilesPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page
  };

  // Handle selection of a single file
  const handleFileSelect = (fileId: string) => {
    const newSelectedFiles = new Set(selectedFiles);

    if (newSelectedFiles.has(fileId)) {
      newSelectedFiles.delete(fileId);
    } else {
      newSelectedFiles.add(fileId);
    }

    setSelectedFiles(newSelectedFiles);

    // Update "select all" checkbox state
    setSelectAll(newSelectedFiles.size === filteredFiles.length);
  };

  // Handle "select all" checkbox
  const handleSelectAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setSelectAll(checked);

    if (checked) {
      // Select all files on the current page
      const newSelectedFiles = new Set<string>();
      paginatedFiles.forEach((file) => newSelectedFiles.add(file.id));
      setSelectedFiles(newSelectedFiles);
    } else {
      // Deselect all files
      setSelectedFiles(new Set());
    }
  };

  // Handle delete single file
  const handleDeleteFile = async (fileId: string, filePath: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this file? This action cannot be undone."
      )
    ) {
      setIsDeleting(true);
      try {
        await dispatch(deleteFile({ fileId, filePath })).unwrap();
      } catch (err) {
        console.error("Error deleting file:", err);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Handle batch delete
  const handleBatchDelete = async () => {
    if (selectedFiles.size === 0) {
      dispatch({
        type: "resources/setError",
        payload: "No files selected for deletion",
      });
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to delete ${selectedFiles.size} files? This action cannot be undone.`
      )
    ) {
      setIsDeleting(true);
      try {
        // Prepare files for batch deletion
        const filesToDelete = files
          .filter((file) => selectedFiles.has(file.id))
          .map((file) => ({ fileId: file.id, filePath: file.path }));

        await dispatch(batchDeleteFiles(filesToDelete)).unwrap();

        // Clear selection after deletion
        setSelectedFiles(new Set());
        setSelectAll(false);
      } catch (err) {
        console.error("Error deleting files:", err);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const getCategoryName = (categoryId: string): string => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "Unknown Category";
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Filter files based on search query
  const filteredFiles = searchQuery.trim()
    ? files.filter(
        (file) =>
          file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          getCategoryName(file.category)
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      )
    : files;

  // Pagination logic
  const indexOfLastFile = currentPage * filesPerPage;
  const indexOfFirstFile = indexOfLastFile - filesPerPage;
  const paginatedFiles = filteredFiles.slice(indexOfFirstFile, indexOfLastFile);
  const totalPages = Math.ceil(filteredFiles.length / filesPerPage);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Manage Resource Files</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {success}
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Category
          </label>
          <select
            value={selectedCategory || ""}
            onChange={handleCategoryChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={loading.files || loading.categories}
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search Files
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search by name..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={loading.files || loading.categories}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Files Per Page
          </label>
          <select
            value={filesPerPage}
            onChange={handleFilesPerPageChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={loading.files || loading.categories}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Batch Actions */}
      <div className="mb-4 flex justify-between items-center">
        <div>
          <span className="text-sm text-gray-600">
            {selectedFiles.size > 0
              ? `${selectedFiles.size} file(s) selected`
              : "No files selected"}
          </span>
        </div>

        <div>
          <button
            onClick={handleBatchDelete}
            disabled={selectedFiles.size === 0 || loading.files || isDeleting}
            className={`px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 ${
              selectedFiles.size === 0 || loading.files || isDeleting
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            {isDeleting
              ? "Deleting..."
              : `Delete Selected (${selectedFiles.size})`}
          </button>
        </div>
      </div>

      {loading.files || loading.categories ? (
        <div className="text-center py-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Loading files...</p>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">
            {files.length === 0
              ? "No files found. Upload your first file using the File Uploader."
              : "No files match your search criteria. Try adjusting your filters."}
          </p>
        </div>
      ) : (
        <>
          {/* Files Table */}
          <div className="overflow-x-auto border rounded-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAllChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      disabled={loading.files || isDeleting}
                    />
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    File
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uploaded
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedFiles.map((file) => (
                  <tr
                    key={file.id}
                    className={selectedFiles.has(file.id) ? "bg-blue-50" : ""}
                  >
                    <td className="px-3 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedFiles.has(file.id)}
                        onChange={() => handleFileSelect(file.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        disabled={isDeleting}
                      />
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-primaryBlue rounded-full">
                          <img
                            src={`/images/${file.icon}.svg`}
                            alt="File"
                            className="h-5 w-5"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm text-wrap break-words  max-w-[500px] font-medium text-gray-900">
                            {file.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {file.fileType}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {getCategoryName(file.category)}
                      </span>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(file.uploadDate)}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        View
                      </a>
                      <button
                        onClick={() => handleDeleteFile(file.id, file.path)}
                        className="text-red-600 hover:text-red-900"
                        disabled={isDeleting}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex  items-center justify-between mt-4">
              <div className="flex-1 flex  justify-between ">
                <button
                  onClick={() => paginate(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${
                    currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    paginate(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${
                    currentPage === totalPages
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{" "}
                    <span className="font-medium">{indexOfFirstFile + 1}</span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(indexOfLastFile, filteredFiles.length)}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium">{filteredFiles.length}</span>{" "}
                    results
                  </p>
                </div>
                <div>
                  <nav
                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={() => paginate(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${
                        currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>

                    {/* Page Numbers */}
                    {Array.from({ length: totalPages }).map((_, index) => {
                      const pageNumber = index + 1;

                      // Show limited number of page buttons to avoid overwhelming the UI
                      if (
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        (pageNumber >= currentPage - 1 &&
                          pageNumber <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => paginate(pageNumber)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === pageNumber
                                ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      }

                      // Show ellipsis for skipped pages
                      if (
                        (pageNumber === 2 && currentPage > 3) ||
                        (pageNumber === totalPages - 1 &&
                          currentPage < totalPages - 2)
                      ) {
                        return (
                          <span
                            key={pageNumber}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                          >
                            ...
                          </span>
                        );
                      }

                      return null;
                    })}

                    <button
                      onClick={() =>
                        paginate(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${
                        currentPage === totalPages
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ResourceFileManager;
