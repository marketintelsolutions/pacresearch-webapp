import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

interface Props {
  reportId: string;
}

const EditionsManager: React.FC<Props> = ({ reportId }) => {
  const dispatch = useAppDispatch();
  const { editions, reports, loading } = useAppSelector((state) => ({
    editions: state.reportsAdmin.editions,
    reports: state.reportsAdmin.reports,
    loading: state.reportsAdmin.loading,
  }));

  const report = reports.find((r) => r.id === reportId);
  const hasCurrentEdition = !!report?.currentEditionId;

  // ---- new update form ----
  const [file, setFile] = useState<File | null>(null);
  const [updateType, setUpdateType] = useState<EditionType>("major");
  const [label, setLabel] = useState("");
  const [price, setPrice] = useState<string>("");
  const [status, setStatus] = useState<ReportStatus>("published");
  const [changeNotes, setChangeNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchEditions(reportId));
    if (reports.length === 0) dispatch(fetchReports());
  }, [dispatch, reportId, reports.length]);

  // The very first edition must be major (there's nothing to update in place).
  const effectiveType: EditionType = hasCurrentEdition ? updateType : "major";

  const currentEdition = editions.find(
    (e) => e.id === report?.currentEditionId
  );

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
      const input = document.getElementById("editionFile") as HTMLInputElement;
      if (input) input.value = "";
    } catch {
      /* surfaced via slice */
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link
          to="/admin/report-archive"
          className="text-secondaryBlue hover:underline text-sm"
        >
          ← Back to reports
        </Link>
        <h1 className="text-2xl font-bold">
          Editions{report ? ` — ${report.title}` : ""}
        </h1>
      </div>

      {/* Add update */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Publish an Update</h2>

        <div className="mb-4 flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="updateType"
              checked={effectiveType === "major"}
              onChange={() => setUpdateType("major")}
            />
            <span>
              <strong>Major</strong> — new edition, customers repurchase (loyalty
              discount applies)
            </span>
          </label>
          <label
            className={`flex items-center gap-2 ${
              hasCurrentEdition ? "" : "opacity-40 cursor-not-allowed"
            }`}
          >
            <input
              type="radio"
              name="updateType"
              disabled={!hasCurrentEdition}
              checked={effectiveType === "minor"}
              onChange={() => setUpdateType("minor")}
            />
            <span>
              <strong>Minor</strong> — replace current file, existing purchasers
              keep free access
            </span>
          </label>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Report file (PDF)
            </label>
            <input
              id="editionFile"
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-sm"
              required
            />
          </div>

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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Change notes
            </label>
            <input
              value={changeNotes}
              onChange={(e) => setChangeNotes(e.target.value)}
              placeholder="What changed in this update?"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          {loading.uploadProgress > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-secondaryBlue h-2 rounded-full"
                style={{ width: `${loading.uploadProgress}%` }}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={saving || !file}
            className="px-4 py-2 bg-primaryBlue text-white rounded-md hover:opacity-90 disabled:opacity-60"
          >
            {saving
              ? "Uploading…"
              : effectiveType === "minor"
              ? "Upload Minor Update"
              : "Create New Edition"}
          </button>
        </form>
      </div>

      {/* Existing editions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          Editions ({editions.length})
        </h2>
        {loading.editions ? (
          <p className="text-sm text-gray-500">Loading editions…</p>
        ) : editions.length === 0 ? (
          <p className="text-sm text-gray-500">No editions yet.</p>
        ) : (
          <div className="space-y-3">
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

// ---- single edition row (inline metadata edit + minor-update + delete) ----
const EditionRow: React.FC<{ edition: ReportEdition; isCurrent: boolean }> = ({
  edition,
  isCurrent,
}) => {
  const dispatch = useAppDispatch();
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
  };

  const replaceFile = (file: File | null) => {
    if (!file) return;
    dispatch(
      replaceEditionFile({ edition, file, changeNotes: "File replaced (minor update)" })
    );
  };

  const remove = () => {
    if (window.confirm(`Delete edition "${edition.editionLabel}"?`)) {
      dispatch(deleteEdition({ edition }));
    }
  };

  return (
    <div className="border rounded-md p-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="px-2 py-1 border border-gray-300 rounded text-sm w-40"
        />
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="px-2 py-1 border border-gray-300 rounded text-sm w-28"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as ReportStatus)}
          className="px-2 py-1 border border-gray-300 rounded text-sm"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
          {edition.editionType}
        </span>
        {isCurrent && (
          <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
            current
          </span>
        )}
        <span className="text-xs text-gray-500">
          {edition.purchaseCount} purchases
        </span>

        <div className="flex gap-3 text-sm ml-auto">
          <button onClick={save} className="text-blue-600 hover:text-blue-800">
            Save
          </button>
          <label className="text-gray-600 hover:text-gray-800 cursor-pointer">
            Replace file
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => replaceFile(e.target.files?.[0] || null)}
            />
          </label>
          <button onClick={remove} className="text-red-600 hover:text-red-800">
            Delete
          </button>
        </div>
      </div>
      {edition.changeNotes && (
        <p className="mt-2 text-xs text-gray-500">Notes: {edition.changeNotes}</p>
      )}
    </div>
  );
};

export default EditionsManager;
