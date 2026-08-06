import React, { useEffect, useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { fetchCustomers, fetchTransactions } from "../../store/adminManageSlice";
import { fetchReports, fetchReportCategories } from "../../store/reportsAdminSlice";
import { formatNaira, formatNairaCompact } from "../../utils/format";
import {
  CHART,
  CATEGORICAL,
  ZILTCH1_COLOR,
  axisTick,
  gridProps,
} from "../../utils/chartTheme";
import ChartCard from "../../components/Admin/analytics/ChartCard";

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
    const repeat = Array.from(purchasesByCustomer.values()).filter((n) => n > 1)
      .length;
    const retentionRate = buyers > 0 ? Math.round((repeat / buyers) * 100) : 0;
    const purchaseFrequency =
      buyers > 0 ? (purchases.length / buyers).toFixed(1) : "0";
    const conversionRate =
      customers.length > 0 ? Math.round((buyers / customers.length) * 100) : 0;

    const geoMap = new Map<string, number>();
    customers.forEach((c) => {
      const key = (c.location || "").trim() || "Unspecified";
      geoMap.set(key, (geoMap.get(key) || 0) + 1);
    });
    const geo = Array.from(geoMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    const monthMap = new Map<string, number>();
    paid.forEach((t) => {
      const secs = t.verifiedAt?.seconds || t.initiatedAt?.seconds;
      if (!secs) return;
      const d = new Date(secs * 1000);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthMap.set(key, (monthMap.get(key) || 0) + t.amount);
    });
    const months = Array.from(monthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, value]) => ({ month, value }));
    const revenueGrowth =
      months.length >= 2
        ? Math.round(
            ((months[months.length - 1].value - months[months.length - 2].value) /
              (months[months.length - 2].value || 1)) *
              100
          )
        : 0;

    const perReport = reports
      .map((r) => {
        const rp = purchases.filter((p) => p.reportId === r.id);
        return {
          id: r.id,
          title: r.title,
          purchases: rp.length,
          revenue: rp.reduce((s, p) => s + p.price, 0),
        };
      })
      .sort((a, b) => b.revenue - a.revenue);

    const loyaltyRedeemed = purchases.filter((p) => p.loyaltyDiscountApplied)
      .length;
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
      geo,
      months,
      revenueGrowth,
      perReport,
      loyaltyUtilization,
      loyaltyRedeemed,
    };
  }, [customers, transactions, purchases, reports]);

  const busy = loading.customers || loading.transactions;

  const revenueSplit = [
    { name: "PAC Research (75%)", value: stats.pacShare },
    { name: "Ziltch1 (25%)", value: stats.ziltchShare },
  ];
  const customerMix = [
    { name: "Individual", value: stats.individual },
    { name: "Corporate", value: stats.corporate },
  ];
  const topReports = stats.perReport.slice(0, 8).map((r) => ({
    name: r.title.length > 22 ? `${r.title.slice(0, 22)}…` : r.title,
    value: r.revenue,
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-primaryBlue">Analytics</h1>
        {busy && <span className="text-sm text-gray-500">Loading data…</span>}
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-6">
        <Kpi label="Total sales" value={formatNaira(stats.totalSales)} />
        <Kpi label="PAC Research" value={formatNaira(stats.pacShare)} accent={CHART.blue} />
        <Kpi label="Ziltch1" value={formatNaira(stats.ziltchShare)} accent={ZILTCH1_COLOR} />
        <Kpi
          label="Revenue growth"
          value={`${stats.revenueGrowth > 0 ? "+" : ""}${stats.revenueGrowth}%`}
          accent={stats.revenueGrowth >= 0 ? "#0ca30c" : "#d03b3b"}
        />
        <Kpi label="Retention" value={`${stats.retentionRate}%`} />
        <Kpi label="Conversion" value={`${stats.conversionRate}%`} />
      </div>

      {/* Sales over time + revenue split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <ChartCard
          title="Sales by month"
          subtitle="Gross revenue collected"
          className="lg:col-span-2"
          aside={
            <span className="text-lg font-bold text-primaryBlue">
              {formatNaira(stats.totalSales)}
            </span>
          }
        >
          {stats.months.length === 0 ? (
            <Empty />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={stats.months} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART.blue} stopOpacity={0.28} />
                    <stop offset="100%" stopColor={CHART.blue} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...gridProps} />
                <XAxis
                  dataKey="month"
                  tick={axisTick}
                  tickLine={false}
                  axisLine={{ stroke: CHART.axis }}
                />
                <YAxis
                  tick={axisTick}
                  tickLine={false}
                  axisLine={false}
                  width={54}
                  tickFormatter={(v) => formatNairaCompact(Number(v))}
                />
                <Tooltip content={<MoneyTip money />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  name="Revenue"
                  stroke={CHART.blue}
                  strokeWidth={2}
                  fill="url(#salesFill)"
                  dot={{ r: 3, fill: CHART.blue, strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Revenue split" subtitle="After Paystack fees">
          <Donut
            data={revenueSplit}
            money
            total={stats.pacShare + stats.ziltchShare}
            colors={[CHART.blue, ZILTCH1_COLOR]}
          />
        </ChartCard>
      </div>

      {/* Customer mix + geography */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <ChartCard
          title="Customer composition"
          subtitle={`${customers.length} total customers`}
        >
          <Donut data={customerMix} total={customers.length} />
        </ChartCard>

        <ChartCard title="Geographic distribution" subtitle="Customers by location">
          {stats.geo.length === 0 ? (
            <Empty />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={stats.geo}
                layout="vertical"
                margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
              >
                <CartesianGrid {...gridProps} horizontal={false} vertical />
                <XAxis type="number" tick={axisTick} tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={axisTick}
                  tickLine={false}
                  axisLine={false}
                  width={100}
                />
                <Tooltip content={<MoneyTip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
                <Bar dataKey="value" name="Customers" fill={CHART.blue} radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Top reports */}
      <ChartCard
        title="Top reports by revenue"
        subtitle="Highest-earning reports"
        className="mb-5"
      >
        {topReports.length === 0 ? (
          <Empty />
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(180, topReports.length * 44)}>
            <BarChart
              data={topReports}
              layout="vertical"
              margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
            >
              <CartesianGrid {...gridProps} horizontal={false} vertical />
              <XAxis
                type="number"
                tick={axisTick}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => formatNairaCompact(Number(v))}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={axisTick}
                tickLine={false}
                axisLine={false}
                width={160}
              />
              <Tooltip content={<MoneyTip money />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
              <Bar dataKey="value" name="Revenue" fill={CHART.blue} radius={[0, 4, 4, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      {/* Secondary metrics + full report table */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Kpi label="Transaction fees" value={formatNaira(stats.totalFees)} />
        <Kpi
          label="Loyalty utilization"
          value={`${stats.loyaltyUtilization}%`}
          sub={`${stats.loyaltyRedeemed} redeemed`}
        />
        <Kpi label="Repeat customers" value={String(stats.repeat)} />
        <Kpi label="Refunds" value={String(stats.refundedCount)} />
      </div>

      <ChartCard title="All reports" subtitle="Purchases and revenue per report">
        {stats.perReport.length === 0 ? (
          <Empty />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-gray-500 border-b">
                  <th className="py-2 pr-3">Report</th>
                  <th className="py-2 pr-3 text-right">Purchases</th>
                  <th className="py-2 pr-3 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {stats.perReport.map((r) => (
                  <tr key={r.id} className="border-b last:border-b-0">
                    <td className="py-3 pr-3 font-medium text-gray-800">{r.title}</td>
                    <td className="py-3 pr-3 text-right tabular-nums">{r.purchases}</td>
                    <td className="py-3 pr-3 text-right tabular-nums">
                      {formatNaira(r.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ChartCard>
    </div>
  );
};

// ---- small building blocks --------------------------------------------------

const Kpi: React.FC<{
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}> = ({ label, value, sub, accent }) => (
  <div className="bg-white rounded-xl border border-black/[0.06] shadow-sm p-4">
    <div className="flex items-center gap-1.5">
      {accent && (
        <span
          className="inline-block w-2 h-2 rounded-full"
          style={{ background: accent }}
        />
      )}
      <p className="text-xs text-gray-500">{label}</p>
    </div>
    <p className="text-lg font-bold text-primaryBlue mt-1 tabular-nums">{value}</p>
    {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
  </div>
);

const Empty = () => (
  <div className="h-[220px] flex items-center justify-center text-sm text-gray-400">
    No data yet
  </div>
);

// Donut with an explicit legend (values + %) — satisfies the relief rule so
// identity never rests on color alone.
const Donut: React.FC<{
  data: { name: string; value: number }[];
  money?: boolean;
  total: number;
  colors?: string[];
}> = ({ data, money, total, colors }) => {
  const safeTotal = total || data.reduce((s, d) => s + d.value, 0);
  const hasData = data.some((d) => d.value > 0);
  const fmt = (v: number) => (money ? formatNaira(v) : String(v));
  const colorAt = (i: number) =>
    (colors && colors[i]) || CATEGORICAL[i % CATEGORICAL.length];

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <ResponsiveContainer width={190} height={190}>
          <PieChart>
            <Pie
              data={hasData ? data : [{ name: "none", value: 1 }]}
              dataKey="value"
              innerRadius={58}
              outerRadius={82}
              paddingAngle={hasData ? 2 : 0}
              stroke={CHART.surface}
              strokeWidth={2}
              startAngle={90}
              endAngle={-270}
            >
              {(hasData ? data : [{ name: "none", value: 1 }]).map((_, i) => (
                <Cell key={i} fill={hasData ? colorAt(i) : "#e6e8ee"} />
              ))}
            </Pie>
            {hasData && <Tooltip content={<MoneyTip money={money} />} />}
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[11px] text-gray-400">Total</span>
          <span className="text-base font-bold text-primaryBlue tabular-nums">
            {fmt(safeTotal)}
          </span>
        </div>
      </div>

      <div className="w-full mt-4 space-y-2">
        {data.map((d, i) => {
          const pct = safeTotal > 0 ? Math.round((d.value / safeTotal) * 100) : 0;
          return (
            <div key={d.name} className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-gray-600">
                <span
                  className="inline-block w-2.5 h-2.5 rounded-sm"
                  style={{ background: colorAt(i) }}
                />
                {d.name}
              </span>
              <span className="text-gray-800 font-medium tabular-nums">
                {fmt(d.value)} · {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Shared tooltip; formats values as naira when `money` is set. recharts injects
// active/payload/label at render time via cloneElement, so a local prop type is
// simpler than fighting the library's context-driven TooltipProps.
interface TipItem {
  name?: string;
  value?: number | string;
}
interface TipProps {
  active?: boolean;
  label?: string | number;
  payload?: TipItem[];
  money?: boolean;
}

const MoneyTip = ({ active, payload, label, money }: TipProps) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg bg-white shadow-lg border border-black/10 px-3 py-2 text-xs">
      {label !== undefined && label !== "" && (
        <p className="font-medium text-primaryBlue mb-1">{label}</p>
      )}
      {payload.map((p, i) => (
        <p key={i} className="text-gray-600">
          {p.name}:{" "}
          <span className="font-semibold text-gray-900">
            {money ? formatNaira(Number(p.value)) : p.value}
          </span>
        </p>
      ))}
    </div>
  );
};

export default AdminAnalytics;
