import React, { useEffect, useMemo, useState } from "react";
import { Download, Ban } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  fetchInvoices,
  cancelInvoice,
  fetchCustomers,
  clearError,
  clearSuccess,
} from "../../store/adminManageSlice";
import { downloadInvoicePdf } from "../../firebase/functions";
import { formatNaira } from "../../utils/format";
import { Invoice } from "../../types";

const fmtDate = (ts?: { seconds: number } | null) =>
  ts ? new Date(ts.seconds * 1000).toLocaleDateString("en-GB") : "—";

const AdminInvoices = () => {
  const dispatch = useAppDispatch();
  const { invoices, customers, loading, error, success } = useAppSelector(
    (s) => ({
      invoices: s.adminManage.invoices,
      customers: s.adminManage.customers,
      loading: s.adminManage.loading,
      error: s.adminManage.error,
      success: s.adminManage.success,
    })
  );

  const [filter, setFilter] = useState<"all" | "issued" | "cancelled">("all");
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchInvoices());
    dispatch(fetchCustomers());
  }, [dispatch]);

  useEffect(() => {
    if (!error && !success) return;
    const t = setTimeout(() => {
      dispatch(clearError());
      dispatch(clearSuccess());
    }, 4000);
    return () => clearTimeout(t);
  }, [error, success, dispatch]);

  const emailOf = (uid: string) =>
    customers.find((c) => c.uid === uid)?.email || uid;

  const visible = useMemo(
    () =>
      filter === "all" ? invoices : invoices.filter((i) => i.status === filter),
    [invoices, filter]
  );

  const download = async (inv: Invoice) => {
    setDownloading(inv.id);
    try {
      await downloadInvoicePdf(inv.id, inv.invoiceNumber);
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Download failed.");
    } finally {
      setDownloading(null);
    }
  };

  const cancel = (inv: Invoice) => {
    if (window.confirm(`Cancel invoice ${inv.invoiceNumber}?`)) {
      dispatch(cancelInvoice(inv.id));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-primaryBlue mb-6">Invoices</h1>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{success}</div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-wrap gap-2 mb-6">
          {(["all", "issued", "cancelled"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-full text-sm ${
                filter === s
                  ? "bg-primaryBlue text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {loading.invoices ? (
          <p className="text-sm text-gray-500">Loading invoices…</p>
        ) : visible.length === 0 ? (
          <p className="text-sm text-gray-500">No invoices.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-gray-500 border-b">
                  <th className="py-2 pr-3">Invoice</th>
                  <th className="py-2 pr-3">Customer</th>
                  <th className="py-2 pr-3">Date</th>
                  <th className="py-2 pr-3">Items</th>
                  <th className="py-2 pr-3">Total</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((inv) => (
                  <tr key={inv.id} className="border-b last:border-b-0">
                    <td className="py-3 pr-3 font-medium text-primaryBlue">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 pr-3 text-xs">
                      {inv.billTo?.organizationName || emailOf(inv.customerUid)}
                    </td>
                    <td className="py-3 pr-3 text-xs text-gray-500">
                      {fmtDate(inv.createdAt)}
                    </td>
                    <td className="py-3 pr-3 tabular-nums">
                      {inv.lineItems.length}
                    </td>
                    <td className="py-3 pr-3 font-medium">
                      {formatNaira(inv.total)}
                    </td>
                    <td className="py-3 pr-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          inv.status === "cancelled"
                            ? "bg-red-50 text-red-600"
                            : "bg-green-50 text-green-700"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => download(inv)}
                          disabled={downloading === inv.id}
                          title="Download PDF"
                          className="inline-flex items-center gap-1 text-secondaryBlue hover:underline text-xs disabled:opacity-50"
                        >
                          <Download size={13} /> PDF
                        </button>
                        {inv.status !== "cancelled" && (
                          <button
                            onClick={() => cancel(inv)}
                            title="Cancel invoice"
                            className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 text-xs"
                          >
                            <Ban size={13} /> Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminInvoices;
