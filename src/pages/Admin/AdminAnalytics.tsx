import React, { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  fetchCustomers,
  fetchTransactions,
} from "../../store/adminManageSlice";
import {
  fetchReports,
  fetchReportCategories,
} from "../../store/reportsAdminSlice";
import { formatNaira } from "../../utils/format";

/**
 * Analytics are aggregated client-side from the admin's full reads of
 * customers / transactions / purchases. At PAC Research's data volumes this is
 * far simpler than maintaining scheduled rollup functions; if the collections
 * ever grow large, swap these reducers for a precomputed analyticsRollups doc.
 */
const AdminAnalytics = () => {
  const dispatch = useAppDispatch();
  const { customers, transactions, purchases, loading } = useAppSelector(
    (state) => ({
      customers: state.adminManage.customers,
      transactions: state.adminManage.transactions,
      purchases: state.adminManage.purchases,
      loading: state.adminManage.loading,
    })
  );
  const { reports } = useAppSelector((state) => ({
    reports: state.reportsAdmin.reports,
  }));

  useEffect(() => {
    dispatch(fetchCustomers());
    dispatch(fetchTransactions());
    dispatch(fetchReports());
    dispatch(fetchReportCategories());
  }, [dispatch]);

  const stats = useMemo(() => {
    const paid = transactions.filter((t) => t.status === "success");
    const refunded = transactions.filter((t) => t.status === "refunded");

    const totalSales = paid.reduce((s, t) => s + t.amount, 0);
    const totalFees = paid.reduce((s, t) => s + t.paystackFee, 0);
    const pacShare = paid.reduce((s, t) => s + t.splitPacResearch, 0);
    const ziltchShare = paid.reduce((s, t) => s + t.splitZiltch1, 0);

    // Customers
    const individual = customers.filter((c) => c.type === "individual").length;
    const corporate = customers.filter((c) => c.type === "corporate").length;

    const purchasesByCustomer = new Map<string, number>();
    purchases.forEach((p) =>
      purchasesByCustomer.set(
        p.customerUid,
        (purchasesByCustomer.get(p.customerUid) || 0) + 1
      )
    );
    const buyers = purchasesByCustomer.size;
    const repeat = Array.from(purchasesByCustomer.values()).filter(
      (n) => n > 1
    ).length;
    const retentionRate = buyers > 0 ? Math.round((repeat / buyers) * 100) : 0;
    const purchaseFrequency =
      buyers > 0 ? (purchases.length / buyers).toFixed(1) : "0";

    // Conversion: buyers as a share of registered customers.
    const conversionRate =
      customers.length > 0 ? Math.round((buyers / customers.length) * 100) : 0;

    // Geography (individuals record a location).
    const geo = new Map<string, number>();
    customers.forEach((c) => {
      const key = (c.location || "").trim() || "Unspecified";
      geo.set(key, (geo.get(key) || 0) + 1);
    });

    // Sales by month.
    const byMonth = new Map<string, number>();
    paid.forEach((t) => {
      const secs = t.verifiedAt?.seconds || t.initiatedAt?.seconds;
      if (!secs) return;
      const d = new Date(secs * 1000);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      byMonth.set(key, (byMonth.get(key) || 0) + t.amount);
    });
    const months = Array.from(byMonth.entries()).sort(([a], [b]) =>
      a.localeCompare(b)
    );
    const revenueGrowth =
      months.length >= 2
        ? Math.round(
            ((months[months.length - 1][1] - months[months.length - 2][1]) /
              (months[months.length - 2][1] || 1)) *
              100
          )
        : 0;

    // Per-report performance.
    const perReport = reports.map((r) => {
      const rp = purchases.filter((p) => p.reportId === r.id);
      const revenue = rp.reduce((s, p) => s + p.price, 0);
      return {
        id: r.id,
        title: r.title,
        purchases: rp.length,
        revenue,
      };
    });
    perReport.sort((a, b) => b.revenue - a.revenue);

    const loyaltyRedeemed = purchases.filter((p) => p.loyaltyDiscountApplied).length;
    const loyaltyUtilization =
      purchases.length > 0
        ? Math.round((loyaltyRedeemed / purchases.length) * 100)
        : 0;

    return {
      totalSales,
      totalFees,
      pacShare,
      ziltchShare,
      refundedCount: refunded.length,
      individual,
      corporate,
      buyers,
      repeat,
      retentionRate,
      purchaseFrequency,
      conversionRate,
      geo: Array.from(geo.entries()).sort((a, b) => b[1] - a[1]),
      months,
      revenueGrowth,
      perReport,
      loyaltyUtilization,
      loyaltyRedeemed,
    };
  }, [customers, transactions, purchases, reports]);

  const busy = loading.customers || loading.transactions;
  const maxMonth = Math.max(1, ...stats.months.map(([, v]) => v));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>

      {busy && <p className="text-sm text-gray-500 mb-4">Loading data…</p>}

      {/* Financial */}
      <Section title="Financial">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat label="Total sales" value={formatNaira(stats.totalSales)} />
          <Stat label="Transaction fees" value={formatNaira(stats.totalFees)} />
          <Stat label="PAC Research (75%)" value={formatNaira(stats.pacShare)} />
          <Stat label="Ziltch1 (25%)" value={formatNaira(stats.ziltchShare)} />
          <Stat
            label="Revenue growth (MoM)"
            value={`${stats.revenueGrowth > 0 ? "+" : ""}${stats.revenueGrowth}%`}
          />
          <Stat
            label="Loyalty utilization"
            value={`${stats.loyaltyUtilization}% (${stats.loyaltyRedeemed})`}
          />
          <Stat label="Refunds" value={String(stats.refundedCount)} />
        </div>

        {stats.months.length > 0 && (
          <div className="mt-6">
            <p className="text-sm font-medium text-gray-700 mb-3">Sales by month</p>
            <div className="space-y-2">
              {stats.months.map(([month, value]) => (
                <div key={month} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-20">{month}</span>
                  <div className="flex-grow bg-gray-100 rounded-full h-3">
                    <div
                      className="bg-secondaryBlue h-3 rounded-full"
                      style={{ width: `${(value / maxMonth) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 w-28 text-right">
                    {formatNaira(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Section>

      {/* Customers */}
      <Section title="Customers">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat label="Total customers" value={String(customers.length)} />
          <Stat label="Individual" value={String(stats.individual)} />
          <Stat label="Corporate" value={String(stats.corporate)} />
          <Stat label="Paying customers" value={String(stats.buyers)} />
          <Stat label="Repeat customers" value={String(stats.repeat)} />
          <Stat label="Retention rate" value={`${stats.retentionRate}%`} />
          <Stat label="Purchase frequency" value={`${stats.purchaseFrequency}/customer`} />
          <Stat label="Conversion rate" value={`${stats.conversionRate}%`} />
        </div>

        {stats.geo.length > 0 && (
          <div className="mt-6">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Geographic distribution
            </p>
            <div className="flex flex-wrap gap-2">
              {stats.geo.map(([place, count]) => (
                <span
                  key={place}
                  className="text-xs px-3 py-1.5 rounded-full bg-primaryBlue/5 text-primaryBlue"
                >
                  {place}: {count}
                </span>
              ))}
            </div>
          </div>
        )}
      </Section>

      {/* Reports */}
      <Section title="Reports">
        {stats.perReport.length === 0 ? (
          <p className="text-sm text-gray-500">No reports yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-gray-500 border-b">
                  <th className="py-2 pr-3">Report</th>
                  <th className="py-2 pr-3">Purchases</th>
                  <th className="py-2 pr-3">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {stats.perReport.map((r) => (
                  <tr key={r.id} className="border-b last:border-b-0">
                    <td className="py-3 pr-3 font-medium text-gray-800">
                      {r.title}
                    </td>
                    <td className="py-3 pr-3">{r.purchases}</td>
                    <td className="py-3 pr-3">{formatNaira(r.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </div>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="bg-white rounded-lg shadow p-6 mb-8">
    <h2 className="text-xl font-semibold mb-4">{title}</h2>
    {children}
  </div>
);

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="p-4 rounded-lg bg-primaryBlue/[0.03] border border-primaryBlue/10">
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-lg font-bold text-primaryBlue mt-1">{value}</p>
  </div>
);

export default AdminAnalytics;
