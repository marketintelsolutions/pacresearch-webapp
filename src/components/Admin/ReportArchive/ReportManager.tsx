import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Layers,
  Pencil,
  Trash2,
  Archive,
  Send,
  Plus,
  ChevronDown,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import {
  fetchReports,
  fetchReportCategories,
  addReport,
  updateReport,
  setReportStatus,
  deleteReport,
  addReportCategory,
  updateReportCategory,
  deleteReportCategory,
} from "../../../store/reportsAdminSlice";
import { Report, ReportCategory, ReportStatus } from "../../../types";
import CoverImagePicker from "./CoverImagePicker";
import CategorySelect from "./CategorySelect";
import CategoryFormModal from "./CategoryFormModal";
import IconBtn from "./IconBtn";

const emptyForm: Partial<Report> = {
  title: "",
  categoryId: "",
  summary: "",
  description: "",
  tags: [],
  status: "draft",
};

const statusBadge: Record<ReportStatus, string> = {
  draft: "bg-gray-100 text-gray-600 ring-gray-200",
  published: "bg-green-50 text-green-700 ring-green-200",
  archived: "bg-amber-50 text-amber-700 ring-amber-200",
};

const inputCls =
  "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondaryBlue/40 focus:border-secondaryBlue";

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
  const [existingCover, setExistingCover] = useState<string | undefined>();
  const [tagsInput, setTagsInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  // Category add/rename modal.
  const [catModal, setCatModal] = useState<{
    mode: "add" | "rename";
    cat?: ReportCategory;
  } | null>(null);

  useEffect(() => {
    dispatch(fetchReports());
    if (categories.length === 0) dispatch(fetchReportCategories());
  }, [dispatch, categories.length]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setCoverFile(null);
    setExistingCover(undefined);
    setTagsInput("");
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
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
        await dispatch(addReport({ data: { ...form, tags }, coverFile })).unwrap();
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
    setFormOpen(true);
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
    setExistingCover(report.coverImageUrl || undefined);
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
    categories.find((c) => c.id === id)?.name || "Uncategorised";

  const categoryCount = (id: string) =>
    reports.filter((r) => r.categoryId === id).length;

  const noCategories = categories.length === 0;

  const submitCategory = async (name: string) => {
    if (!catModal) return;
    if (catModal.mode === "add") {
      const created = await dispatch(
        addReportCategory({ name, displayOrder: categories.length })
      ).unwrap();
      // Auto-select the newly created category.
      setForm((f) => ({ ...f, categoryId: created.id }));
    } else if (catModal.cat) {
      await dispatch(updateReportCategory({ ...catModal.cat, name })).unwrap();
    }
    setCatModal(null);
  };

  const removeCategory = (cat: ReportCategory) => {
    if (categoryCount(cat.id) > 0) {
      window.alert(
        `"${cat.name}" still has reports. Reassign or delete them first.`
      );
      return;
    }
    if (window.confirm(`Delete category "${cat.name}"?`)) {
      dispatch(deleteReportCategory(cat.id));
      if (form.categoryId === cat.id) {
        setForm((f) => ({ ...f, categoryId: "" }));
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* ---- Form card (collapsible) ---- */}
      <div className="bg-white rounded-xl border border-black/[0.06] shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setFormOpen((o) => !o)}
          aria-expanded={formOpen}
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50/60 transition"
        >
          <span className="inline-flex items-center gap-2 text-lg font-semibold text-primaryBlue">
            {editingId ? <Pencil size={18} /> : <Plus size={18} />}
            {editingId ? "Edit report" : "Add a report"}
          </span>
          <ChevronDown
            size={18}
            className={`text-gray-400 transition-transform ${
              formOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {formOpen && (
          <div className="px-6 pb-6">
            {noCategories && (
              <div className="mb-5 p-3 rounded-lg bg-amber-50 text-amber-700 text-sm">
                Add a category first — use the “Add new category” option in the
                Category field below.
              </div>
            )}

            <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
            {/* Left: text fields */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    name="title"
                    value={form.title || ""}
                    onChange={handleChange}
                    className={inputCls}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <CategorySelect
                    categories={categories}
                    value={form.categoryId || ""}
                    onChange={(id) => setForm((f) => ({ ...f, categoryId: id }))}
                    onAddNew={() => setCatModal({ mode: "add" })}
                    onRename={(cat) => setCatModal({ mode: "rename", cat })}
                    onDelete={removeCategory}
                    countFor={categoryCount}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Summary <span className="text-gray-400">(catalogue blurb)</span>
                </label>
                <input
                  name="summary"
                  value={form.summary || ""}
                  onChange={handleChange}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-gray-400">(details page)</span>
                </label>
                <textarea
                  name="description"
                  value={form.description || ""}
                  onChange={handleChange}
                  rows={4}
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags <span className="text-gray-400">(comma-separated)</span>
                  </label>
                  <input
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="equities, macro, 2026"
                    className={inputCls}
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
                    className={inputCls}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Right: cover */}
            <CoverImagePicker
              file={coverFile}
              existingUrl={existingCover}
              onChange={setCoverFile}
            />
          </div>

          {loading.uploadProgress > 0 && (
            <div className="mt-5 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-secondaryBlue h-2 rounded-full transition-all"
                style={{ width: `${loading.uploadProgress}%` }}
              />
            </div>
          )}

          <div className="mt-6 flex gap-2">
            <button
              type="submit"
              disabled={saving || noCategories}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primaryBlue text-white rounded-full font-semibold hover:opacity-90 disabled:opacity-50"
            >
              <Plus size={16} />
              {saving ? "Saving…" : editingId ? "Update report" : "Add report"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2.5 border border-gray-300 rounded-full text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
          </div>
            </form>
          </div>
        )}
      </div>

      {/* ---- List card ---- */}
      <div className="bg-white rounded-xl border border-black/[0.06] shadow-sm p-6">
        <h3 className="text-lg font-semibold text-primaryBlue mb-4">
          All reports{" "}
          <span className="text-sm font-normal text-gray-400">
            ({reports.length})
          </span>
        </h3>

        {loading.reports ? (
          <p className="text-sm text-gray-500">Loading reports…</p>
        ) : reports.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-500">
            No reports yet. Create your first one above.
          </div>
        ) : (
          <div className="space-y-2">
            {reports.map((report) => (
              <div
                key={report.id}
                className="flex flex-wrap items-center gap-4 p-3 rounded-xl border border-transparent hover:border-black/[0.06] hover:bg-gray-50/60 transition"
              >
                {/* Cover */}
                {report.coverImageUrl ? (
                  <img
                    src={report.coverImageUrl}
                    alt=""
                    className="w-14 h-14 object-cover rounded-lg shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300 shrink-0">
                    <Layers size={20} />
                  </div>
                )}

                {/* Title + meta */}
                <div className="min-w-[180px] flex-1">
                  <p className="font-medium text-gray-900 leading-tight">
                    {report.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {categoryName(report.categoryId)}
                    <span className="mx-1.5 text-gray-300">•</span>
                    {report.currentEditionId ? (
                      <span className="text-green-600">has editions</span>
                    ) : (
                      <span className="text-amber-600">no edition yet</span>
                    )}
                  </p>
                </div>

                {/* Status */}
                <span
                  className={`text-xs px-2.5 py-1 rounded-full ring-1 ring-inset capitalize ${statusBadge[report.status]}`}
                >
                  {report.status}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <Link
                    to={`/admin/report-archive/${report.id}/editions`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondaryBlue/10 text-secondaryBlue text-sm font-medium hover:bg-secondaryBlue/20 transition"
                  >
                    <Layers size={15} /> Editions
                  </Link>

                  <IconBtn title="Edit report" onClick={() => startEdit(report)}>
                    <Pencil size={16} />
                  </IconBtn>

                  <IconBtn
                    title={
                      report.status === "published"
                        ? "Archive report"
                        : "Publish report"
                    }
                    onClick={() => cycleStatus(report)}
                  >
                    {report.status === "published" ? (
                      <Archive size={16} />
                    ) : (
                      <Send size={16} />
                    )}
                  </IconBtn>

                  <IconBtn
                    title="Delete report"
                    danger
                    onClick={() => handleDelete(report)}
                  >
                    <Trash2 size={16} />
                  </IconBtn>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / rename category modal */}
      <CategoryFormModal
        open={catModal !== null}
        title={catModal?.mode === "rename" ? "Rename category" : "New category"}
        initialName={catModal?.cat?.name || ""}
        submitLabel={catModal?.mode === "rename" ? "Save" : "Add category"}
        onClose={() => setCatModal(null)}
        onSubmit={submitCategory}
      />
    </div>
  );
};

export default ReportManager;
