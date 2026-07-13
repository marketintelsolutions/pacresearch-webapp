import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  fetchLoyaltyConfig,
  saveLoyaltyConfig,
  fetchTransactions,
  clearError,
  clearSuccess,
} from "../../store/adminManageSlice";
import { formatNaira } from "../../utils/format";

const AdminLoyalty = () => {
  const dispatch = useAppDispatch();
  const { loyalty, purchases, loading, error, success } = useAppSelector(
    (state) => ({
      loyalty: state.adminManage.loyalty,
      purchases: state.adminManage.purchases,
      loading: state.adminManage.loading,
      error: state.adminManage.error,
      success: state.adminManage.success,
    })
  );

  const [percent, setPercent] = useState<string>("30");
  const [enabled, setEnabled] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchLoyaltyConfig());
    dispatch(fetchTransactions());
  }, [dispatch]);

  useEffect(() => {
    setPercent(String(loyalty.discountPercent ?? 30));
    setEnabled(loyalty.enabled ?? true);
  }, [loyalty]);

  useEffect(() => {
    if (!error && !success) return;
    const t = setTimeout(() => {
      dispatch(clearError());
      dispatch(clearSuccess());
    }, 4000);
    return () => clearTimeout(t);
  }, [error, success, dispatch]);

  // Redemption tracking comes straight off the purchases that used the discount.
  const redeemed = purchases.filter((p) => p.loyaltyDiscountApplied);
  const discountGiven = redeemed.reduce((sum, p) => {
    const pct = p.loyaltyDiscountPercent || 0;
    // p.price is the discounted price; recover the nominal discount amount.
    const original = pct < 100 ? p.price / (1 - pct / 100) : p.price;
    return sum + (original - p.price);
  }, 0);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(percent);
    if (Number.isNaN(value) || value < 0 || value > 100) return;
    setSaving(true);
    await dispatch(saveLoyaltyConfig({ discountPercent: value, enabled }));
    setSaving(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Loyalty Programme</h1>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{success}</div>
      )}

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-1">Discount settings</h2>
        <p className="text-sm text-gray-500 mb-5">
          Applied automatically at checkout when a customer already owns the
          previous edition of the report they're buying.
        </p>

        {loading.loyalty ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="max-w-xs">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount on successor editions (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={percent}
                onChange={(e) => setPercent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
              />
              Loyalty discount enabled
            </label>

            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-primaryBlue text-white rounded-md hover:opacity-90 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save settings"}
            </button>
          </form>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Redemption</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Stat label="Discounted purchases" value={String(redeemed.length)} />
          <Stat label="Total discount given" value={formatNaira(discountGiven)} />
          <Stat
            label="Current rate"
            value={`${loyalty.discountPercent ?? 30}%${
              loyalty.enabled === false ? " (off)" : ""
            }`}
          />
        </div>
      </div>
    </div>
  );
};

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="p-4 rounded-lg bg-primaryBlue/[0.03] border border-primaryBlue/10">
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-xl font-bold text-primaryBlue mt-1">{value}</p>
  </div>
);

export default AdminLoyalty;
