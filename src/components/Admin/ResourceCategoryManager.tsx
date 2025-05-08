import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  fetchCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
  clearError,
  clearSuccess,
} from "../../store/resourcesSlice";
import { ResourceCategory } from "../../types";

const ResourceCategoryManager: React.FC = () => {
  const dispatch = useAppDispatch();
  const { categories, loading, error, success } = useAppSelector((state) => ({
    categories: state.resources.categories,
    loading: state.resources.loading,
    error: state.resources.error,
    success: state.resources.success,
  }));

  const [newCategory, setNewCategory] = useState<Partial<ResourceCategory>>({
    name: "",
    displayOrder: 0,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draggedCategory, setDraggedCategory] = useState<string | null>(null);
  const [dragOverCategory, setDragOverCategory] = useState<string | null>(null);
  const [dragPosition, setDragPosition] = useState<"before" | "after" | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (editingId) {
      // Only update local state for editing, we'll dispatch when saving
      const categoryToEdit = categories.find((cat) => cat.id === editingId);
      if (categoryToEdit) {
        const updatedCategory = {
          ...categoryToEdit,
          [name]: name === "displayOrder" ? parseInt(value, 10) : value,
        };
        setNewCategory(updatedCategory);
      }
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
          const updatedCategory = {
            ...categoryToUpdate,
            ...newCategory,
          } as ResourceCategory;

          await dispatch(updateCategory(updatedCategory)).unwrap();
          setEditingId(null);
        }
      } else {
        // Add new category
        await dispatch(
          addCategory({
            ...newCategory,
            displayOrder: categories.length, // Set display order to the end
          })
        ).unwrap();

        // Reset form
        setNewCategory({
          name: "",
          displayOrder: categories.length + 1,
        });
      }
    } catch (err) {
      console.error("Error saving category:", err);
    }
  };

  const handleEdit = (categoryId: string) => {
    const categoryToEdit = categories.find((cat) => cat.id === categoryId);
    if (categoryToEdit) {
      setNewCategory(categoryToEdit);
      setEditingId(categoryId);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setNewCategory({
      name: "",
      displayOrder: categories.length,
    });
  };

  const handleDelete = async (categoryId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this category? All files in this category will also be deleted. This action cannot be undone."
      )
    ) {
      setIsDeleting(true);
      try {
        await dispatch(deleteCategory(categoryId)).unwrap();
      } catch (err) {
        console.error("Error deleting category:", err);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Handle drag start
  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    categoryId: string
  ) => {
    // Prevent dragging during editing
    if (editingId) {
      e.preventDefault();
      return;
    }

    // Set data transfer properties
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", categoryId);

    // Set dragged category state
    setDraggedCategory(categoryId);

    // Make the drag image more translucent
    if (e.currentTarget) {
      e.currentTarget.style.opacity = "0.4";
    }
  };

  // Handle drag end
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    // Reset styles
    if (e.currentTarget) {
      e.currentTarget.style.opacity = "1";
    }

    // Reset state
    setDraggedCategory(null);
    setDragOverCategory(null);
    setDragPosition(null);
  };

  // Handle drag over
  const handleDragOver = (
    e: React.DragEvent<HTMLDivElement>,
    categoryId: string
  ) => {
    // Prevent default to allow drop
    e.preventDefault();

    // Skip if dragging over self or during editing
    if (categoryId === draggedCategory || editingId) {
      setDragOverCategory(null);
      setDragPosition(null);
      return;
    }

    // Set drop effect
    e.dataTransfer.dropEffect = "move";

    // Determine if we're dragging before or after the target
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;

    // If we're in the top half, we're dropping before
    // Otherwise, we're dropping after
    const position = y < rect.height / 2 ? "before" : "after";

    setDragOverCategory(categoryId);
    setDragPosition(position);
  };

  // Handle drag leave
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    // Only clear if we're leaving the element, not entering a child
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverCategory(null);
      setDragPosition(null);
    }
  };

  // Handle drop
  const handleDrop = async (
    e: React.DragEvent<HTMLDivElement>,
    categoryId: string
  ) => {
    // Prevent default behavior
    e.preventDefault();

    // Get the dragged category ID
    const draggedId = e.dataTransfer.getData("text/plain");

    // Skip if dropping on self or during editing
    if (draggedId === categoryId || editingId) {
      return;
    }

    // Find indices
    const draggedIndex = categories.findIndex((cat) => cat.id === draggedId);
    const targetIndex = categories.findIndex((cat) => cat.id === categoryId);

    if (draggedIndex === -1 || targetIndex === -1) {
      return;
    }

    // Clone the categories array
    const reorderedCategories = [...categories];

    // Remove the dragged category
    const [draggedCategory] = reorderedCategories.splice(draggedIndex, 1);

    // Calculate new index based on drop position
    let newIndex = targetIndex;
    if (dragPosition === "after") {
      newIndex = targetIndex;
    } else if (dragPosition === "before") {
      newIndex = targetIndex;
      // If we're dragging from above to below, we need to adjust the index
      if (draggedIndex < targetIndex) {
        newIndex--;
      }
    }

    // Insert the dragged category at the new index
    reorderedCategories.splice(newIndex, 0, draggedCategory);

    // Update display orders
    const updatedCategories = reorderedCategories.map((category, index) => ({
      ...category,
      displayOrder: index,
    }));

    setIsSaving(true);
    try {
      // Save the new order to Firestore via Redux
      await dispatch(reorderCategories(updatedCategories)).unwrap();
    } catch (err) {
      console.error("Error reordering categories:", err);
    } finally {
      setIsSaving(false);
    }

    // Reset state
    setDraggedCategory(null);
    setDragOverCategory(null);
    setDragPosition(null);
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
              value={newCategory.name || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            disabled={loading.categories || isSaving || isDeleting}
          >
            {editingId ? "Update Category" : "Add Category"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              disabled={loading.categories || isSaving || isDeleting}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-700 mb-2">
          Category Order
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Drag and drop categories to change their display order. Changes are
          saved automatically.
        </p>
      </div>

      {loading.categories ? (
        <div className="py-4 text-center">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-600">Loading categories...</p>
        </div>
      ) : isDeleting ? (
        <div className="py-4 text-center">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-red-600 border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-600">
            Deleting category and files...
          </p>
        </div>
      ) : isSaving ? (
        <div className="py-4 text-center">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-600">Saving category order...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="py-4 text-center bg-gray-50 rounded">
          <p className="text-gray-600">
            No categories found. Add your first category above.
          </p>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          {categories.map((category) => (
            <div
              key={category.id}
              draggable={!editingId}
              onDragStart={(e) => handleDragStart(e, category.id)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, category.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, category.id)}
              className={`flex items-center justify-between p-4 border-b last:border-b-0 relative ${
                category.id === editingId
                  ? "bg-blue-50"
                  : category.id === draggedCategory
                  ? "opacity-40"
                  : "bg-white hover:bg-gray-50"
              }`}
            >
              {/* Drop indicator */}
              {dragOverCategory === category.id &&
                dragPosition === "before" && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500 z-10"></div>
                )}
              {dragOverCategory === category.id && dragPosition === "after" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 z-10"></div>
              )}

              <div className="flex items-center">
                <div
                  className={`cursor-move mr-3 text-gray-500 hover:text-gray-700 ${
                    editingId ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="8" cy="6" r="1" />
                    <circle cx="15" cy="6" r="1" />
                    <circle cx="8" cy="12" r="1" />
                    <circle cx="15" cy="12" r="1" />
                    <circle cx="8" cy="18" r="1" />
                    <circle cx="15" cy="18" r="1" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{category.name}</h4>
                  <p className="text-sm text-gray-500">
                    Order: {category.displayOrder}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(category.id)}
                  className="text-blue-600 hover:text-blue-900"
                  disabled={isDeleting || isSaving}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="text-red-600 hover:text-red-900"
                  disabled={isDeleting || isSaving}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResourceCategoryManager;
