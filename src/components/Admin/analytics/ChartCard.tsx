import React from "react";

interface Props {
  title: string;
  subtitle?: string;
  /** Optional right-aligned header slot (e.g. a total). */
  aside?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/** Consistent surface + header for every analytics chart. */
const ChartCard: React.FC<Props> = ({
  title,
  subtitle,
  aside,
  children,
  className = "",
}) => (
  <div
    className={`bg-white rounded-xl border border-black/[0.06] shadow-sm p-5 ${className}`}
  >
    <div className="flex items-start justify-between gap-3 mb-4">
      <div>
        <h3 className="text-sm font-semibold text-primaryBlue">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {aside && <div className="text-right">{aside}</div>}
    </div>
    {children}
  </div>
);

export default ChartCard;
