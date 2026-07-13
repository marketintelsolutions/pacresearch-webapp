import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import {
  fetchReports,
  fetchReportCategories,
  addReport,
  updateReport,
  setReportStatus,
  deleteReport,
} from "../../../store/reportsAdminSlice";
import { Report, ReportStatus } from "../../../types";

const emptyForm: Partial<Report> = {
  title: "",
  categoryId: "",
  summary: "",
  description: "",
  tags: [],
  status: "draft",
};

const statusBadge: Record<ReportStatus, string> = {
  draft: "bg-gray-200 text-gray-700",
  published: "bg-green-100 text-green-700",
  archived: "bg-yellow-100 text-yellow-700",
};

const ReportManager: React.FC = () => {
  const dispatch = useAppDispatch();
  const { reports, categories, loading } = useAppSelector((state) => ({
    reports: state.reportsAdmin.reports,
    categories: state.reportsAdmin.categories,
    loading: state.reportsAdmin.loading,
  }));

  const [form, setForm] = useState<Partial<Report>>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [tagsInput, setTagsInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchReports());
    if (categories.length === 0) dispatch(fetchReportCategories());
  }, [dispatch, categories.length]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setCoverFile(null);
    setTagsInput("");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title?.trim() || !form.categoryId) return;
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    setSaving(true);
    try {
      if (editingId) {
        const existing = reports.find((r) => r.id === editingId);
        if (existing) {
          await dispatch(
            updateReport({
              report: { ...existing, ...form, tags } as Report,
              coverFile,
            })
          ).unwrap();
        }
      } else {
        await dispatch(
          addReport({ data: { ...form, tags }, coverFile })
        ).unwrap();
      }
      resetForm();
    } catch {
      /* error surfaced via slice state */
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (report: Report) => {
    setEditingId(report.id);
    setForm({
      title: report.title,
      categoryId: report.categoryId,
      summary: report.summary,
      description: report.description,
      status: report.status,
      slug: report.slug,
    });
    setTagsInput((report.tags || []).join(", "));
    setCoverFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cycleStatus = (report: Report) => {
    const next: ReportStatus =
      report.status === "published" ? "archived" : "published";
    dispatch(setReportStatus({ reportId: report.id, status: next }));
  };

  const handleDelete = (report: Report) => {
    if (
      window.confirm(
        `Delete "${report.title}" and ALL its editions and files? This cannot be undone.`
      )
    ) {
      dispatch(deleteReport(report.id));
    }
  };

  const categoryName = (id: string) =>
    categories.find((c) => c.id === id)?.name || "—";

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">
        {editingId ? "Edit Report" : "Add Report"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              name="title"
              value={form.title || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              name="categoryId"
              value={form.categoryId || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Summary (catalogue blurb)
          </label>
          <input
            name="summary"
            value={form.summary || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description (details page)
          </label>
          <textarea
            name="description"
            value={form.description || ""}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags (comma-separated)
            </label>
            <input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={form.status || "draft"}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cover image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
              className="w-full text-sm"
            />
          </div>
        </div>

        {loading.uploadProgress > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-secondaryBlue h-2 rounded-full"
              style={{ width: `${loading.uploadProgress}%` }}
            />
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-primaryBlue text-white rounded-md hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "Saving…" : editingId ? "Update Report" : "Add Report"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border border-gray-300 rounded-md"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <h3 className="text-lg font-medium mb-3">
        All Reports ({reports.length})
      </h3>

      {loading.reports ? (
        <p className="text-sm text-gray-500">Loading reports…</p>
      ) : reports.length === 0 ? (
        <p className="text-sm text-gray-500">No reports yet.</p>
      ) : (
        <div className="border rounded-md divide-y">
          {reports.map((report) => (
            <div
              key={report.id}
              className="flex flex-wrap items-center justify-between gap-3 p-4"
            >
              <div className="flex items-center gap-3 min-w-[240px]">
                {report.coverImageUrl ? (
                  <img
                    src={report.coverImageUrl}
                    alt=""
                    className="w-12 h-12 object-cover rounded"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">
                    N/A
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">{report.title}</p>
                  <p className="text-xs text-gray-500">
                    {categoryName(report.categoryId)}
                    {report.currentEditionId ? " • has editions" : " • no edition yet"}
                  </p>
                </div>
              </div>

              <span
                className={`text-xs px-2 py-1 rounded-full ${statusBadge[report.status]}`}
              >
                {report.status}
              </span>

              <div className="flex gap-3 text-sm">
                <Link
                  to={`/admin/report-archive/${report.id}/editions`}
                  className="text-secondaryBlue hover:underline"
                >
                  Editions
                </Link>
                <button
                  onClick={() => startEdit(report)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Edit
                </button>
                <button
                  onClick={() => cycleStatus(report)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  {report.status === "published" ? "Archive" : "Publish"}
                </button>
                <button
                  onClick={() => handleDelete(report)}
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

export default ReportManager;
