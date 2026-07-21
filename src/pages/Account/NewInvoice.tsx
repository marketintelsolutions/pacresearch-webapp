import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FileText, Check } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { fetchCatalog } from "../../store/reportArchiveSlice";
import { requestInvoice } from "../../store/invoicesSlice";
import { formatNaira } from "../../utils/format";
import PageBanner from "../../components/Layout/PageBanner";

const NewInvoice = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const { reports, editionsById, loading } = useAppSelector((s) => ({
    reports: s.reportArchive.reports,
    editionsById: s.reportArchive.editionsById,
    loading: s.reportArchive.loading,
  }));

  // Only reports with a published current edition can be invoiced.
  const invoiceable = useMemo(
    () =>
      reports
        .filter(
          (r) => r.currentEditionId && editionsById[r.currentEditionId]
        )
        .map((r) => ({
          report: r,
          edition: editionsById[r.currentEditionId as string],
        })),
    [reports, editionsById]
  );

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    dispatch(fetchCatalog());
  }, [dispatch]);

  // Pre-select an edition passed via ?edition= (from a report's details page).
  useEffect(() => {
    const pre = params.get("edition");
    if (pre) setSelected((s) => new Set(s).add(pre));
  }, [params]);

  const toggle = (editionId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(editionId) ? next.delete(editionId) : next.add(editionId);
      return next;
    });
  };

  const total = invoiceable
    .filter((x) => selected.has(x.edition.id))
    .reduce((s, x) => s + x.edition.price, 0);

  const submit = async () => {
    if (selected.size === 0) return;
    setSubmitting(true);
    setError("");
    try {
      await dispatch(
        requestInvoice({ editionIds: Array.from(selected), notes })
      ).unwrap();
      navigate("/account/invoices");
    } catch (e) {
      setError(typeof e === "string" ? e : "Could not generate the invoice.");
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageBanner text="REQUEST INVOICE" />
      <section className="w-full px-6 xl:px-0 max-w-[820px] mx-auto mt-[60px] mb-20">
        <Link
          to="/account/invoices"
          className="text-secondaryBlue hover:underline text-sm font-['Inter']"
        >
          ← Back to invoices
        </Link>

        <h1 className="mt-4 text-2xl font-bold text-primaryBlue">
          Request a pro-forma invoice
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Select the reports to include. Loyalty discounts are applied
          automatically where you own an earlier edition.
        </p>

        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        {/* Report picker */}
        <div className="mt-6 bg-white rounded-xl border border-black/[0.06] divide-y">
          {loading.catalog ? (
            <p className="p-6 text-sm text-gray-500">Loading reports…</p>
          ) : invoiceable.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">
              <FileText className="mx-auto text-gray-300 mb-2" size={28} />
              No reports are available to invoice yet.
            </div>
          ) : (
            invoiceable.map(({ report, edition }) => {
              const checked = selected.has(edition.id);
              return (
                <label
                  key={report.id}
                  className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50/60"
                >
                  <span
                    className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
                      checked
                        ? "bg-primaryBlue border-primaryBlue text-white"
                        : "border-gray-300"
                    }`}
                  >
                    {checked && <Check size={14} />}
                  </span>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={checked}
                    onChange={() => toggle(edition.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {report.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {edition.editionLabel}
                    </p>
                  </div>
                  <span className="text-primaryBlue font-semibold">
                    {formatNaira(edition.price)}
                  </span>
                </label>
              );
            })
          )}
        </div>

        {/* Notes */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Note / PO reference{" "}
            <span className="text-gray-400">(optional)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="e.g. For finance approval — PO #12345"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondaryBlue/40 focus:border-secondaryBlue"
          />
        </div>

        {/* Footer */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-xl border border-black/[0.06]">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{selected.size}</span> selected
            <span className="mx-2 text-gray-300">•</span>
            Total{" "}
            <span className="font-semibold text-primaryBlue">
              {formatNaira(total)}
            </span>
          </div>
          <button
            onClick={submit}
            disabled={selected.size === 0 || submitting}
            className="px-6 py-2.5 bg-primaryBlue text-white rounded-full font-semibold hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "Generating…" : "Generate invoice"}
          </button>
        </div>
      </section>
    </>
  );
};

export default NewInvoice;
