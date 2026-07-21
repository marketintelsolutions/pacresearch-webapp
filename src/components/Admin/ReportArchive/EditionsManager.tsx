import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ChevronDown,
  Layers,
  Pencil,
  Trash2,
  Upload,
  Plus,
  Check,
  X,
  RefreshCw,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import {
  fetchEditions,
  fetchReports,
  addEdition,
  replaceEditionFile,
  updateEditionMeta,
  deleteEdition,
} from "../../../store/reportsAdminSlice";
import { ReportEdition, ReportStatus, EditionType } from "../../../types";
import { formatNaira } from "../../../utils/format";
import PdfFilePicker from "./PdfFilePicker";
import IconBtn from "./IconBtn";

interface Props {
  reportId: string;
}

const statusBadge: Record<ReportStatus, string> = {
  draft: "bg-gray-100 text-gray-600 ring-gray-200",
  published: "bg-green-50 text-green-700 ring-green-200",
  archived: "bg-amber-50 text-amber-700 ring-amber-200",
};

const inputCls =
  "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondaryBlue/40 focus:border-secondaryBlue";

const EditionsManager: React.FC<Props> = ({ reportId }) => {
  const dispatch = useAppDispatch();
  const { editions, reports, loading } = useAppSelector((state) => ({
    editions: state.reportsAdmin.editions,
    reports: state.reportsAdmin.reports,
    loading: state.reportsAdmin.loading,
  }));

  const report = reports.find((r) => r.id === reportId);
  const hasCurrentEdition = !!report?.currentEditionId;

  const [formOpen, setFormOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [updateType, setUpdateType] = useState<EditionType>("major");
  const [label, setLabel] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState<ReportStatus>("published");
  const [changeNotes, setChangeNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchEditions(reportId));
    if (reports.length === 0) dispatch(fetchReports());
  }, [dispatch, reportId, reports.length]);

  // The first edition must be major — there's nothing to update in place yet.
  const effectiveType: EditionType = hasCurrentEdition ? updateType : "major";
  const currentEdition = editions.find((e) => e.id === report?.currentEditionId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setSaving(true);
    try {
      if (effectiveType === "minor") {
        if (!currentEdition) return;
        await dispatch(
          replaceEditionFile({ edition: currentEdition, file, changeNotes })
        ).unwrap();
      } else {
        await dispatch(
          addEdition({
            reportId,
            file,
            editionLabel: label || `Edition ${editions.length + 1}`,
            editionType: "major",
            price: Number(price) || 0,
            status,
            changeNotes,
            currentEditionId: report?.currentEditionId ?? null,
          })
        ).unwrap();
      }
      setFile(null);
      setLabel("");
      setPrice("");
      setChangeNotes("");
    } catch {
      /* surfaced via slice */
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-[1000px]">
      {/* Header */}
      <Link
        to="/admin/report-archive"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-secondaryBlue text-sm text-secondaryBlue hover:bg-secondaryBlue hover:text-white transition mb-4"
      >
        <ArrowLeft size={14} /> Back to reports
      </Link>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-primaryBlue">
          {report ? report.title : "Editions"}
        </h1>
        {report && (
          <span
            className={`text-xs px-2.5 py-1 rounded-full ring-1 ring-inset capitalize ${statusBadge[report.status]}`}
          >
            {report.status}
          </span>
        )}
        <span className="text-sm text-gray-400">
          {editions.length} edition{editions.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* ---- Publish an update (collapsible) ---- */}
      <div className="bg-white rounded-xl border border-black/[0.06] shadow-sm overflow-hidden mb-6">
        <button
          type="button"
          onClick={() => setFormOpen((o) => !o)}
          aria-expanded={formOpen}
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50/60 transition"
        >
          <span className="inline-flex items-center gap-2 text-lg font-semibold text-primaryBlue">
            <Upload size={18} /> Publish an update
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
            {/* Update type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              <TypeCard
                active={effectiveType === "major"}
                onClick={() => setUpdateType("major")}
                title="Major update"
                body="Creates a new edition. Customers must repurchase — loyalty discount applies. They keep the edition they already own."
              />
              <TypeCard
                active={effectiveType === "minor"}
                disabled={!hasCurrentEdition}
                onClick={() => setUpdateType("minor")}
                title="Minor update"
                body={
                  hasCurrentEdition
                    ? "Replaces the current edition's file. Existing purchasers keep access free of charge and are notified."
                    : "Available once this report has an edition to update."
                }
              />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <PdfFilePicker file={file} onChange={setFile} />

              {effectiveType === "major" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Edition label
                    </label>
                    <input
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                      placeholder="e.g. 2026 Edition"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price (₦)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className={inputCls}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as ReportStatus)}
                      className={inputCls}
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Change notes{" "}
                  <span className="text-gray-400">
                    (shown to customers in the update notice)
                  </span>
                </label>
                <input
                  value={changeNotes}
                  onChange={(e) => setChangeNotes(e.target.value)}
                  placeholder="What changed in this update?"
                  className={inputCls}
                />
              </div>

              {loading.uploadProgress > 0 && (
                <div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-secondaryBlue h-2 rounded-full transition-all"
                      style={{ width: `${loading.uploadProgress}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Uploading… {loading.uploadProgress}%
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={saving || !file}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primaryBlue text-white rounded-full font-semibold hover:opacity-90 disabled:opacity-50"
              >
                {effectiveType === "minor" ? (
                  <RefreshCw size={16} />
                ) : (
                  <Plus size={16} />
                )}
                {saving
                  ? "Uploading…"
                  : effectiveType === "minor"
                  ? "Upload minor update"
                  : "Create new edition"}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* ---- Editions list ---- */}
      <div className="bg-white rounded-xl border border-black/[0.06] shadow-sm p-6">
        <h2 className="text-lg font-semibold text-primaryBlue mb-4">
          Editions{" "}
          <span className="text-sm font-normal text-gray-400">
            ({editions.length})
          </span>
        </h2>

        {loading.editions ? (
          <p className="text-sm text-gray-500">Loading editions…</p>
        ) : editions.length === 0 ? (
          <div className="py-10 text-center">
            <Layers className="mx-auto text-gray-300 mb-2" size={28} />
            <p className="text-sm text-gray-500 mb-4">
              No editions yet — upload the first one to put this report on sale.
            </p>
            <button
              onClick={() => setFormOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primaryBlue text-white rounded-full text-sm font-semibold hover:opacity-90"
            >
              <Plus size={16} /> Add first edition
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {editions.map((edition) => (
              <EditionRow
                key={edition.id}
                edition={edition}
                isCurrent={edition.id === report?.currentEditionId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ---- update-type selector card ---------------------------------------------
const TypeCard: React.FC<{
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  title: string;
  body: string;
}> = ({ active, disabled, onClick, title, body }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`text-left p-4 rounded-xl border transition ${
      disabled
        ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
        : active
        ? "border-primaryBlue bg-primaryBlue/[0.04] ring-1 ring-primaryBlue"
        : "border-gray-200 hover:border-primaryBlue/40"
    }`}
  >
    <span className="flex items-center gap-2">
      <span
        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
          active ? "bg-primaryBlue border-primaryBlue text-white" : "border-gray-300"
        }`}
      >
        {active && <Check size={11} />}
      </span>
      <span className="font-semibold text-sm text-primaryBlue">{title}</span>
    </span>
    <p className="mt-1.5 text-xs text-gray-500 leading-relaxed">{body}</p>
  </button>
);

// ---- one edition ------------------------------------------------------------
const EditionRow: React.FC<{ edition: ReportEdition; isCurrent: boolean }> = ({
  edition,
  isCurrent,
}) => {
  const dispatch = useAppDispatch();
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(edition.editionLabel);
  const [price, setPrice] = useState(String(edition.price));
  const [status, setStatus] = useState<ReportStatus>(edition.status);

  const save = () => {
    dispatch(
      updateEditionMeta({
        ...edition,
        editionLabel: label,
        price: Number(price) || 0,
        status,
      })
    );
    setEditing(false);
  };

  const cancel = () => {
    setLabel(edition.editionLabel);
    setPrice(String(edition.price));
    setStatus(edition.status);
    setEditing(false);
  };

  const replaceFile = (file: File | null) => {
    if (!file) return;
    dispatch(
      replaceEditionFile({
        edition,
        file,
        changeNotes: "File replaced (minor update)",
      })
    );
  };

  const remove = () => {
    if (
      window.confirm(
        `Delete edition "${edition.editionLabel}"? Its file will be removed too.`
      )
    ) {
      dispatch(deleteEdition({ edition }));
    }
  };

  const updated = edition.updatedAt
    ? new Date(edition.updatedAt).toLocaleDateString("en-GB")
    : "";

  if (editing) {
    return (
      <div className="p-4 rounded-xl border border-primaryBlue/30 bg-primaryBlue/[0.02]">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Edition label"
            className={inputCls}
          />
          <input
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Price"
            className={inputCls}
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ReportStatus)}
            className={inputCls}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={save}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primaryBlue text-white rounded-full text-sm font-semibold hover:opacity-90"
          >
            <Check size={15} /> Save
          </button>
          <button
            onClick={cancel}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-300 text-gray-600 rounded-full text-sm hover:bg-gray-50"
          >
            <X size={15} /> Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-4 p-3 rounded-xl border border-transparent hover:border-black/[0.06] hover:bg-gray-50/60 transition">
      <span className="w-11 h-11 rounded-lg bg-primaryBlue/5 text-primaryBlue flex items-center justify-center shrink-0">
        <Layers size={18} />
      </span>

      <div className="min-w-[160px] flex-1">
        <p className="font-medium text-gray-900 leading-tight">
          {edition.editionLabel}
          {isCurrent && (
            <span className="ml-2 text-[11px] px-2 py-0.5 rounded-full bg-green-100 text-green-700">
              current
            </span>
          )}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          {formatNaira(edition.price)}
          <span className="mx-1.5 text-gray-300">•</span>
          {edition.purchaseCount || 0} purchase
          {(edition.purchaseCount || 0) === 1 ? "" : "s"}
          {updated && (
            <>
              <span className="mx-1.5 text-gray-300">•</span>
              updated {updated}
            </>
          )}
        </p>
      </div>

      <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize">
        {edition.editionType}
      </span>
      <span
        className={`text-xs px-2.5 py-1 rounded-full ring-1 ring-inset capitalize ${statusBadge[edition.status]}`}
      >
        {edition.status}
      </span>

      <div className="flex items-center gap-1">
        <IconBtn title="Edit edition" onClick={() => setEditing(true)}>
          <Pencil size={16} />
        </IconBtn>

        <label
          title="Replace file (minor update)"
          aria-label="Replace file"
          className="w-9 h-9 inline-flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-primaryBlue transition cursor-pointer"
        >
          <RefreshCw size={16} />
          <input
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => replaceFile(e.target.files?.[0] || null)}
          />
        </label>

        <IconBtn title="Delete edition" danger onClick={remove}>
          <Trash2 size={16} />
        </IconBtn>
      </div>

      {edition.changeNotes && (
        <p className="w-full text-xs text-gray-500 pl-[60px] -mt-1">
          {edition.changeNotes}
        </p>
      )}
    </div>
  );
};

export default EditionsManager;
