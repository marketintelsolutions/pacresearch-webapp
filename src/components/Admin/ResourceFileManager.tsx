import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { ResourceFile, ResourceCategory } from "../../types";
import { fileIcons } from "../../utils/fileIcons";
import { db, storage } from "../../firebase/firebaseConfig";

const ResourceFileManager: React.FC = () => {
  const [files, setFiles] = useState<ResourceFile[]>([]);
  const [categories, setCategories] = useState<ResourceCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  useEffect(() => {
    fetchCategories();
    fetchFiles();
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [selectedCategory]);

  const fetchCategories = async () => {
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
      setCategories(fetchedCategories);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Failed to load categories.");
    }
  };

  const fetchFiles = async () => {
    setLoading(true);
    try {
      let filesQuery;

      if (selectedCategory === "all") {
        filesQuery = collection(db, "resourceFiles");
      } else {
        filesQuery = query(
          collection(db, "resourceFiles"),
          where("category", "==", selectedCategory)
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

      setFiles(fetchedFiles);
    } catch (err) {
      console.error("Error fetching files:", err);
      setError("Failed to load files.");
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };

  const handleDeleteFile = async (fileId: string, filePath: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this file? This action cannot be undone."
      )
    ) {
      try {
        // Delete from Storage
        const storageRef = ref(storage, filePath);
        await deleteObject(storageRef);

        // Delete from Firestore
        await deleteDoc(doc(db, "resourceFiles", fileId));

        // Update state
        setFiles(files.filter((file) => file.id !== fileId));
        setSuccess("File deleted successfully!");

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(""), 3000);
      } catch (err) {
        console.error("Error deleting file:", err);
        setError("Failed to delete file. Please try again.");

        // Clear error message after 3 seconds
        setTimeout(() => setError(""), 3000);
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

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Filter by Category
        </label>
        <select
          value={selectedCategory}
          onChange={handleCategoryChange}
          className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Loading files...</p>
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">
            {selectedCategory === "all"
              ? "No files found. Upload your first file using the File Uploader."
              : "No files found in this category. Try selecting a different category or upload a file to this category."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {files.map((file) => (
            <div
              key={file.id}
              className="bg-gray-50 rounded-md p-4 border border-gray-200 flex"
            >
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-primaryBlue rounded-full mr-4">
                <img
                  src={`/images/${file.icon}.svg`}
                  alt="File"
                  className="w-6 h-6"
                />
              </div>

              <div className="flex-grow">
                <h3 className="text-base font-medium text-gray-900 mb-1">
                  {file.name}
                </h3>
                <div className="flex flex-col space-y-1 text-sm text-gray-600">
                  <p>Category: {getCategoryName(file.category)}</p>
                  <p>Uploaded: {formatDate(file.uploadDate)}</p>
                  <div className="flex space-x-4 mt-2">
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </a>
                    <button
                      onClick={() => handleDeleteFile(file.id, file.path)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResourceFileManager;
