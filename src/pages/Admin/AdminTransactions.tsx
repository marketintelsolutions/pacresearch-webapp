import React, { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  fetchTransactions,
  fetchCustomers,
  refundTransaction,
  setPurchaseStatus,
  clearError,
  clearSuccess,
} from "../../store/adminManageSlice";
import { formatNaira } from "../../utils/format";
import { TransactionStatus } from "../../types";

const fmtDate = (ts?: { seconds: number } | null) =>
  ts
    ? new Date(ts.seconds * 1000).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const statusStyle: Record<string, string> = {
  success: "bg-green-100 text-green-700",
  pending: "bg-gray-100 text-gray-600",
  failed: "bg-red-100 text-red-700",
  abandoned: "bg-yellow-100 text-yellow-700",
  refunded: "bg-purple-100 text-purple-700",
};

const AdminTransactions = () => {
  const dispatch = useAppDispatch();
  const {
    transactions,
    purchases,
    customers,
    organizations,
    loading,
    error,
    success,
  } = useAppSelector((state) => ({
    transactions: state.adminManage.transactions,
    purchases: state.adminManage.purchases,
    customers: state.adminManage.customers,
    organizations: state.adminManage.organizations,
    loading: state.adminManage.loading,
    error: state.adminManage.error,
    success: state.adminManage.success,
  }));

  const [filter, setFilter] = useState<TransactionStatus | "all">("all");
  const [refunding, setRefunding] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchTransactions());
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
  const orgNameOf = (orgId: string | null) =>
    organizations.find((o) => o.id === orgId)?.orgName || "";

  const visible = useMemo(
    () =>
      filter === "all"
        ? transactions
        : transactions.filter((t) => t.status === filter),
    [transactions, filter]
  );

  const handleRefund = async (reference: string) => {
    const reason = window.prompt(
      "Refund reason (the customer will lose access to the report):"
    );
    if (reason === null) return;
    setRefunding(reference);
    await dispatch(refundTransaction({ reference, reason }));
    setRefunding(null);
  };

  const handleRevoke = (purchaseId: string, status: "active" | "revoked") => {
    const reason =
      status === "revoked"
        ? window.prompt("Reason for revoking access?") ?? undefined
        : undefined;
    if (status === "revoked" && reason === undefined) return;
    dispatch(setPurchaseStatus({ purchaseId, status, reason }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Transactions</h1>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{success}</div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-wrap gap-2 mb-6">
          {(["all", "success", "pending", "failed", "abandoned", "refunded"] as const).map(
            (s) => (
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
            )
          )}
        </div>

        {loading.transactions ? (
          <p className="text-sm text-gray-500">Loading transactions…</p>
        ) : visible.length === 0 ? (
          <p className="text-sm text-gray-500">No transactions.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-gray-500 border-b">
                  <th className="py-2 pr-3">Reference</th>
                  <th className="py-2 pr-3">Date</th>
                  <th className="py-2 pr-3">Customer</th>
                  <th className="py-2 pr-3">Amount</th>
                  <th className="py-2 pr-3">Fee</th>
                  <th className="py-2 pr-3">PAC / Ziltch1</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((t) => {
                  const purchase = purchases.find((p) => p.transactionId === t.id);
                  return (
                    <tr key={t.id} className="border-b last:border-b-0">
                      <td className="py-3 pr-3">
                        <p className="font-mono text-xs">{t.paystackReference}</p>
                        <p className="text-xs text-gray-500">
                          {t.purchaseKind === "seatAddon"
                            ? `seat add-on${
                                orgNameOf(t.organizationId)
                                  ? ` • ${orgNameOf(t.organizationId)}`
                                  : ""
                              }`
                            : "report"}
                          {t.loyaltyDiscountApplied && (
                            <span className="ml-1 text-green-700">
                              −{t.loyaltyDiscountPercent}%
                            </span>
                          )}
                        </p>
                      </td>
                      <td className="py-3 pr-3 text-xs text-gray-500 whitespace-nowrap">
                        {fmtDate(t.verifiedAt || t.initiatedAt)}
                      </td>
                      <td className="py-3 pr-3 text-xs">{emailOf(t.customerUid)}</td>
                      <td className="py-3 pr-3 font-medium">
                        {formatNaira(t.amount)}
                      </td>
                      <td className="py-3 pr-3 text-xs text-gray-500">
                        {formatNaira(t.paystackFee)}
                        {t.status === "success" &&
                          t.paystackFeeActual === false && (
                            <span
                              title="Paystack did not return an actual fee; this is the estimate."
                              className="ml-1 text-amber-500"
                            >
                              est.
                            </span>
                          )}
                      </td>
                      <td className="py-3 pr-3 text-xs text-gray-500">
                        {formatNaira(t.splitPacResearch)} /{" "}
                        {formatNaira(t.splitZiltch1)}
                      </td>
                      <td className="py-3 pr-3">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            statusStyle[t.status] || "bg-gray-100"
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3 pr-3">
                        <div className="flex gap-2 text-xs">
                          {t.status === "success" && (
                            <button
                              onClick={() => handleRefund(t.paystackReference)}
                              disabled={refunding === t.paystackReference}
                              className="text-red-600 hover:text-red-800 disabled:opacity-50"
                            >
                              {refunding === t.paystackReference
                                ? "Refunding…"
                                : "Refund"}
                            </button>
                          )}
                          {purchase && (
                            <button
                              onClick={() =>
                                handleRevoke(
                                  purchase.id,
                                  purchase.status === "revoked" ? "active" : "revoked"
                                )
                              }
                              className="text-gray-600 hover:text-gray-800"
                            >
                              {purchase.status === "revoked"
                                ? "Restore access"
                                : "Revoke access"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTransactions;
