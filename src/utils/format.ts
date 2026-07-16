/** Format a naira amount, e.g. 100000 → "₦100,000". */
export const formatNaira = (amount: number): string =>
  `₦${Number(amount || 0).toLocaleString("en-NG", {
    maximumFractionDigits: 2,
  })}`;

/** Compact naira for axis ticks, e.g. 120000 → "₦120k", 2500000 → "₦2.5m". */
export const formatNairaCompact = (amount: number): string => {
  const n = Number(amount || 0);
  if (Math.abs(n) >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}m`;
  if (Math.abs(n) >= 1_000) return `₦${Math.round(n / 1_000)}k`;
  return `₦${n}`;
};
