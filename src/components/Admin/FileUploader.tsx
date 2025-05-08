import React, { useState, useEffect } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { ResourceCategory } from "../../types";
import { fileIcons, getFileIconByType } from "../../utils/fileIcons";
import { db, storage } from "../../firebase/firebaseConfig";

const FileUploader: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [fileIcon, setFileIcon] = useState<string>("file");
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploading, setUploading] = useState<boolean>(false);
  const [categories, setCategories] = useState<ResourceCategory[]>([]);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  useEffect(() => {
    fetchCategories();
  }, []);

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

      // Set default category if available
      if (fetchedCategories.length > 0 && !category) {
        setCategory(fetchedCategories[0].id);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Failed to load categories. Please try again.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      // Set default file name from file
      if (!fileName) {
        setFileName(selectedFile.name.split(".")[0]);
      }

      // Auto-detect file icon based on type
      const fileType = selectedFile.type;
      setFileIcon(getFileIconByType(fileType));
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "fileName") {
      setFileName(value);
    } else if (name === "category") {
      setCategory(value);
    } else if (name === "fileIcon") {
      setFileIcon(value);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    if (!fileName.trim()) {
      setError("Please enter a file name.");
      return;
    }

    if (!category) {
      setError("Please select a category.");
      return;
    }

    setUploading(true);
    setError("");

    try {
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

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Track upload progress
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Upload error:", error);
          setError("Failed to upload file. Please try again.");
          setUploading(false);
        },
        async () => {
          // Upload completed successfully
          // Get the download URL
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          // Save file metadata to Firestore
          const fileId = `file_${Date.now()}`;
          const fileData = {
            id: fileId,
            name: fileName,
            url: downloadURL,
            fileType: fileType,
            uploadDate: new Date().toISOString(),
            category: category,
            path: storageFilePath,
            icon: fileIcon, // Store the selected icon
          };

          await setDoc(doc(db, "resourceFiles", fileId), fileData);

          // Reset form
          setFile(null);
          setFileName("");
          setFileIcon("file");
          setUploadProgress(0);
          setUploading(false);
          setSuccess("File uploaded successfully!");

          // Clear success message after 5 seconds
          setTimeout(() => setSuccess(""), 5000);

          // Reset file input
          const fileInput = document.getElementById(
            "fileInput"
          ) as HTMLInputElement;
          if (fileInput) {
            fileInput.value = "";
          }
        }
      );
    } catch (err) {
      console.error("Error during upload:", err);
      setError("Failed to upload file. Please try again.");
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Upload Resource File</h2>

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
              Select File
            </label>
            <input
              id="fileInput"
              type="file"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              File Name (Display Name)
            </label>
            <input
              type="text"
              name="fileName"
              value={fileName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter display name for the file"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                name="category"
                value={category}
                onChange={handleInputChange}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                File Icon
              </label>
              <select
                name="fileIcon"
                value={fileIcon}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {fileIcons.map((icon) => (
                  <option key={icon.value} value={icon.value}>
                    {icon.label}
                  </option>
                ))}
              </select>
              <div className="mt-2 flex items-center">
                <div className="p-2 bg-primaryBlue rounded-full mr-2">
                  <img
                    src={`/images/${fileIcon}.svg`}
                    alt="Selected icon"
                    className="w-5 h-5"
                  />
                </div>
                <span className="text-sm text-gray-500">
                  Preview: {fileIcon}.svg
                </span>
              </div>
            </div>
          </div>
        </div>

        {uploading && (
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Upload progress: {uploadProgress}%
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={uploading}
          className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
            uploading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {uploading ? "Uploading..." : "Upload File"}
        </button>
      </form>
    </div>
  );
};

export default FileUploader;
