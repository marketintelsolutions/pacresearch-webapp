import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import {
  fetchReportCategories,
  addReportCategory,
  updateReportCategory,
  deleteReportCategory,
} from "../../../store/reportsAdminSlice";
import { ReportCategory } from "../../../types";

const ReportCategoryManager: React.FC = () => {
  const dispatch = useAppDispatch();
  const { categories, loading } = useAppSelector((state) => ({
    categories: state.reportsAdmin.categories,
    loading: state.reportsAdmin.loading,
  }));

  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (categories.length === 0) dispatch(fetchReportCategories());
  }, [dispatch, categories.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (editingId) {
      const existing = categories.find((c) => c.id === editingId);
      if (existing) {
        await dispatch(updateReportCategory({ ...existing, name })).unwrap().catch(() => {});
      }
      setEditingId(null);
    } else {
      await dispatch(
        addReportCategory({ name, displayOrder: categories.length })
      ).unwrap().catch(() => {});
    }
    setName("");
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this category?")) {
      dispatch(deleteReportCategory(id));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Report Categories</h2>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Category name"
          className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          required
        />
        <button
          type="submit"
          className="px-4 py-2 bg-primaryBlue text-white rounded-md hover:opacity-90"
          disabled={loading.categories}
        >
          {editingId ? "Update" : "Add"}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setName("");
            }}
            className="px-4 py-2 border border-gray-300 rounded-md"
          >
            Cancel
          </button>
        )}
      </form>

      {loading.categories ? (
        <p className="text-sm text-gray-500">Loading categories…</p>
      ) : categories.length === 0 ? (
        <p className="text-sm text-gray-500">No categories yet.</p>
      ) : (
        <div className="border rounded-md divide-y">
          {categories.map((cat: ReportCategory) => (
            <div
              key={cat.id}
              className="flex items-center justify-between p-3"
            >
              <span className="font-medium text-gray-800">{cat.name}</span>
              <div className="flex gap-3 text-sm">
                <button
                  onClick={() => {
                    setEditingId(cat.id);
                    setName(cat.name);
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="text-red-600 hover:text-red-800"
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

export default ReportCategoryManager;
