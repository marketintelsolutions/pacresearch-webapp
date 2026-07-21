import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface Props {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  autoFocus?: boolean;
  name?: string;
  autoComplete?: string;
  /** Override the input styling. Include `pr-10` so text clears the eye icon. */
  inputClassName?: string;
}

const DEFAULT_INPUT =
  "w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondaryBlue/40 focus:border-secondaryBlue";

/** Password field with an eye toggle for showing/hiding the value. */
const PasswordInput: React.FC<Props> = ({
  label,
  value,
  onChange,
  placeholder,
  required,
  autoFocus,
  name,
  autoComplete,
  inputClassName,
}) => {
  const [show, setShow] = useState(false);

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          autoFocus={autoFocus}
          name={name}
          autoComplete={autoComplete}
          className={inputClassName ?? DEFAULT_INPUT}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          title={show ? "Hide password" : "Show password"}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
};

export default PasswordInput;
