import React, { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  fetchCustomers,
  fetchTransactions,
  setCustomerStatus,
  sendPasswordReset,
  clearError,
  clearSuccess,
} from "../../store/adminManageSlice";
import { formatNaira } from "../../utils/format";
import { Customer } from "../../types";

type Filter = "all" | "individual" | "corporate";

const AdminCustomers = () => {
  const dispatch = useAppDispatch();
  const {
    customers,
    organizations,
    purchases,
    loading,
    error,
    success,
  } = useAppSelector((state) => ({
    customers: state.adminManage.customers,
    organizations: state.adminManage.organizations,
    purchases: state.adminManage.purchases,
    loading: state.adminManage.loading,
    error: state.adminManage.error,
    success: state.adminManage.success,
  }));

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchCustomers());
    dispatch(fetchTransactions());
  }, [dispatch]);

  useEffect(() => {
    if (!error && !success) return;
    const t = setTimeout(() => {
      dispatch(clearError());
      dispatch(clearSuccess());
    }, 4000);
    return () => clearTimeout(t);
  }, [error, success, dispatch]);

  const orgName = (id: string | null) =>
    organizations.find((o) => o.id === id)?.orgName || "—";

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return customers
      .filter((c) => (filter === "all" ? true : c.type === filter))
      .filter((c) =>
        term
          ? [c.name, c.email, c.phone, orgName(c.organizationId)]
              .filter(Boolean)
              .some((v) => String(v).toLowerCase().includes(term))
          : true
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customers, organizations, search, filter]);

  const purchasesFor = (uid: string) =>
    purchases.filter((p) => p.customerUid === uid);

  const toggleSuspend = (c: Customer) => {
    const next = c.status === "suspended" ? "active" : "suspended";
    if (
      window.confirm(
        next === "suspended"
          ? `Suspend ${c.email}? They will be signed out and lose report access.`
          : `Reactivate ${c.email}?`
      )
    ) {
      dispatch(setCustomerStatus({ customerUid: c.uid, status: next }));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Customers</h1>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{success}</div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-wrap gap-3 mb-6">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, phone, organisation…"
            className="flex-grow min-w-[240px] px-3 py-2 border border-gray-300 rounded-md"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as Filter)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="all">All customers</option>
            <option value="individual">Individual</option>
            <option value="corporate">Corporate</option>
          </select>
        </div>

        {loading.customers ? (
          <p className="text-sm text-gray-500">Loading customers…</p>
        ) : visible.length === 0 ? (
          <p className="text-sm text-gray-500">No customers found.</p>
        ) : (
          <div className="border rounded-md divide-y">
            {visible.map((c) => {
              const theirPurchases = purchasesFor(c.uid);
              const isOpen = expanded === c.uid;
              return (
                <div key={c.uid} className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-[220px]">
                      <p className="font-medium text-gray-900">
                        {c.type === "corporate"
                          ? orgName(c.organizationId)
                          : c.name || "—"}{" "}
                        <span
                          className={`ml-1 text-xs px-2 py-0.5 rounded-full ${
                            c.type === "corporate"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {c.type}
                        </span>
                        {c.status === "suspended" && (
                          <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                            suspended
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        {c.email} • {c.phone || "no phone"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {c.type === "corporate"
                          ? `Contact: ${c.name || "—"}`
                          : c.location || "—"}
                      </p>
                    </div>

                    <div className="text-sm text-gray-600">
                      <p>{theirPurchases.length} reports</p>
                      <p className="text-xs">
                        {formatNaira(c.totalSpend || 0)} spent
                      </p>
                    </div>

                    <div className="flex gap-3 text-sm">
                      <button
                        onClick={() => setExpanded(isOpen ? null : c.uid)}
                        className="text-secondaryBlue hover:underline"
                      >
                        {isOpen ? "Hide" : "History"}
                      </button>
                      <button
                        onClick={() => dispatch(sendPasswordReset(c.uid))}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Reset password
                      </button>
                      <button
                        onClick={() => toggleSuspend(c)}
                        className={
                          c.status === "suspended"
                            ? "text-green-600 hover:text-green-800"
                            : "text-red-600 hover:text-red-800"
                        }
                      >
                        {c.status === "suspended" ? "Reactivate" : "Suspend"}
                      </button>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="mt-3 pl-1 border-l-2 border-gray-100">
                      {theirPurchases.length === 0 ? (
                        <p className="pl-3 text-xs text-gray-500">
                          No purchases yet.
                        </p>
                      ) : (
                        theirPurchases.map((p) => (
                          <div
                            key={p.id}
                            className="pl-3 py-1 text-xs text-gray-600 flex justify-between"
                          >
                            <span>
                              {p.editionId}
                              {p.loyaltyDiscountApplied && (
                                <span className="ml-2 text-green-700">
                                  −{p.loyaltyDiscountPercent}% loyalty
                                </span>
                              )}
                            </span>
                            <span>
                              {formatNaira(p.price)}
                              {p.status === "revoked" && (
                                <span className="ml-2 text-red-600">revoked</span>
                              )}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCustomers;
