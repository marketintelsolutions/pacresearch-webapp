import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import { ref, deleteObject, listAll } from "firebase/storage";
import { ResourceCategory, ResourceFile } from "../../types";
import { db, storage } from "../../firebase/firebaseConfig";

const ResourceCategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<ResourceCategory[]>([]);
  const [newCategory, setNewCategory] = useState<Partial<ResourceCategory>>({
    name: "",
    displayOrder: 0,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
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
      setError("Failed to load categories. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (editingId) {
      const updatedCategories = categories.map((category) => {
        if (category.id === editingId) {
          return {
            ...category,
            [name]: name === "displayOrder" ? parseInt(value, 10) : value,
          };
        }
        return category;
      });
      setCategories(updatedCategories);
    } else {
      setNewCategory({
        ...newCategory,
        [name]: name === "displayOrder" ? parseInt(value, 10) : value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        // Update existing category
        const categoryToUpdate = categories.find((cat) => cat.id === editingId);
        if (categoryToUpdate) {
          await setDoc(
            doc(db, "resourceCategories", editingId),
            categoryToUpdate
          );
          setSuccess("Category updated successfully!");
          setEditingId(null);
        }
      } else {
        // Add new category
        const newCategoryId = `cat_${Date.now()}`;
        const categoryData = {
          ...newCategory,
          id: newCategoryId,
        };

        await setDoc(
          doc(db, "resourceCategories", newCategoryId),
          categoryData
        );
        setCategories([...categories, categoryData as ResourceCategory]);
        setNewCategory({
          name: "",
          displayOrder: categories.length,
        });
        setSuccess("Category added successfully!");
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error saving category:", err);
      setError("Failed to save category. Please try again.");

      // Clear error message after 3 seconds
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleEdit = (categoryId: string) => {
    setEditingId(categoryId);
  };

  const handleCancel = () => {
    setEditingId(null);
    fetchCategories(); // Reset to original data
  };

  const handleDelete = async (categoryId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this category? All files in this category will also be deleted. This action cannot be undone."
      )
    ) {
      setIsDeleting(true);
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

        // Update local state
        setCategories(categories.filter((cat) => cat.id !== categoryId));
        setSuccess("Category and all associated files deleted successfully!");

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(""), 3000);
      } catch (err) {
        console.error("Error deleting category and files:", err);
        setError("Failed to delete category. Please try again.");

        // Clear error message after 3 seconds
        setTimeout(() => setError(""), 3000);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Manage Resource Categories</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category Name
            </label>
            <input
              type="text"
              name="name"
              value={
                editingId
                  ? categories.find((c) => c.id === editingId)?.name || ""
                  : newCategory.name
              }
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Order
            </label>
            <input
              type="number"
              name="displayOrder"
              value={
                editingId
                  ? categories.find((c) => c.id === editingId)?.displayOrder ||
                    0
                  : newCategory.displayOrder
              }
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              min="0"
              required
            />
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {editingId ? "Update Category" : "Add Category"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Display Order
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : isDeleting ? (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center">
                  Deleting category and files... This may take a moment.
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center">
                  No categories found. Add your first category above.
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr
                  key={category.id}
                  className={category.id === editingId ? "bg-blue-50" : ""}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {category.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {category.displayOrder}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(category.id)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                      disabled={isDeleting}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="text-red-600 hover:text-red-900"
                      disabled={isDeleting}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResourceCategoryManager;
