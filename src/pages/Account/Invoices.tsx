import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Download, Plus, ChevronDown } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { fetchMyInvoices } from "../../store/invoicesSlice";
import { downloadInvoicePdf } from "../../firebase/functions";
import { formatNaira } from "../../utils/format";
import { Invoice } from "../../types";
import PageBanner from "../../components/Layout/PageBanner";

const fmtDate = (ts?: { seconds: number } | null) =>
  ts ? new Date(ts.seconds * 1000).toLocaleDateString("en-GB") : "—";

const Invoices = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => ({ user: s.customerAuth.user }));
  const { myInvoices, loading, error } = useAppSelector((s) => ({
    myInvoices: s.invoices.myInvoices,
    loading: s.invoices.loading,
    error: s.invoices.error,
  }));

  const [expanded, setExpanded] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    if (user) dispatch(fetchMyInvoices(user.uid));
  }, [dispatch, user]);

  const handleDownload = async (inv: Invoice) => {
    setDownloading(inv.id);
    try {
      await downloadInvoicePdf(inv.id, inv.invoiceNumber);
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Download failed.");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <>
      <PageBanner text="MY INVOICES" />
      <section className="w-full px-6 xl:px-0 max-w-[900px] mx-auto mt-[60px] mb-20">
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/account"
            className="text-secondaryBlue hover:underline text-sm font-['Inter']"
          >
            ← Back to my account
          </Link>
          <Link
            to="/account/invoices/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primaryBlue text-white rounded-full text-sm font-semibold hover:opacity-90"
          >
            <Plus size={16} /> Request invoice
          </Link>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
        )}

        {loading ? (
          <p className="text-sm text-gray-500">Loading invoices…</p>
        ) : myInvoices.length === 0 ? (
          <div className="p-10 bg-white rounded-xl border text-center">
            <FileText className="mx-auto text-gray-300 mb-3" size={32} />
            <p className="text-gray-500 mb-4">
              You haven't requested any invoices yet.
            </p>
            <Link
              to="/account/invoices/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primaryBlue text-white rounded-full text-sm font-semibold hover:opacity-90"
            >
              <Plus size={16} /> Request an invoice
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {myInvoices.map((inv) => {
              const open = expanded === inv.id;
              return (
                <div
                  key={inv.id}
                  className="bg-white rounded-xl border border-black/[0.06]"
                >
                  <div className="flex flex-wrap items-center gap-4 p-4">
                    <div className="flex-1 min-w-[180px]">
                      <p className="font-semibold text-primaryBlue">
                        {inv.invoiceNumber}
                      </p>
                      <p className="text-xs text-gray-500">
                        {fmtDate(inv.createdAt)} • {inv.lineItems.length} item
                        {inv.lineItems.length > 1 ? "s" : ""}
                      </p>
                    </div>

                    <span className="font-bold text-primaryBlue">
                      {formatNaira(inv.total)}
                    </span>

                    <span
                      className={`text-xs px-2.5 py-1 rounded-full ${
                        inv.status === "cancelled"
                          ? "bg-red-50 text-red-600"
                          : "bg-green-50 text-green-700"
                      }`}
                    >
                      {inv.status}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownload(inv)}
                        disabled={downloading === inv.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-primaryBlue text-primaryBlue rounded-lg text-sm hover:bg-primaryBlue hover:text-white transition disabled:opacity-50"
                      >
                        <Download size={14} />
                        {downloading === inv.id ? "…" : "PDF"}
                      </button>
                      <button
                        onClick={() => setExpanded(open ? null : inv.id)}
                        className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100"
                        aria-label="Toggle details"
                      >
                        <ChevronDown
                          size={16}
                          className={`transition-transform ${
                            open ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {open && (
                    <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                      <div className="space-y-1.5">
                        {inv.lineItems.map((li) => (
                          <div
                            key={li.editionId}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-gray-700">
                              {li.reportTitle}
                              <span className="text-gray-400">
                                {" "}
                                · {li.editionLabel}
                              </span>
                              {li.loyaltyDiscountPercent > 0 && (
                                <span className="ml-2 text-green-700 text-xs">
                                  −{li.loyaltyDiscountPercent}% loyalty
                                </span>
                              )}
                            </span>
                            <span className="text-gray-800 tabular-nums">
                              {formatNaira(li.lineTotal)}
                            </span>
                          </div>
                        ))}
                      </div>
                      {inv.notes && (
                        <p className="mt-3 text-xs text-gray-500">
                          Note: {inv.notes}
                        </p>
                      )}
                      <div className="mt-3 flex justify-between text-sm border-t border-gray-100 pt-2">
                        <span className="text-gray-500">
                          Valid until {fmtDate(inv.expiresAt)}
                        </span>
                        <span className="font-semibold text-primaryBlue">
                          Total {formatNaira(inv.total)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
};

export default Invoices;
