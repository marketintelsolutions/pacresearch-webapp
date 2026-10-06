import React from "react";

/** Compact ghost icon button with a tooltip, used across the admin tables. */
const IconBtn: React.FC<{
  title: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}> = ({ title, onClick, danger, disabled, children }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    aria-label={title}
    disabled={disabled}
    className={`w-9 h-9 inline-flex items-center justify-center rounded-lg transition disabled:opacity-40 ${
      danger
        ? "text-red-500 hover:bg-red-50 hover:text-red-700"
        : "text-gray-500 hover:bg-gray-100 hover:text-primaryBlue"
    }`}
  >
    {children}
  </button>
);

export default IconBtn;
