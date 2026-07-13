/** Format a naira amount, e.g. 100000 → "₦100,000". */
export const formatNaira = (amount: number): string =>
  `₦${Number(amount || 0).toLocaleString("en-NG", {
    maximumFractionDigits: 2,
  })}`;
