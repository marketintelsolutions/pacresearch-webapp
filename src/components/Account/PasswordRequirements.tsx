import React from "react";
import { Check, Circle } from "lucide-react";
import { PASSWORD_RULES } from "../../utils/passwordPolicy";

/**
 * Live checklist of the password policy. Rules stay muted until met, so the
 * user sees exactly what's outstanding instead of a rejection after submit.
 */
const PasswordRequirements: React.FC<{ value: string }> = ({ value }) => (
  <ul className="mt-2 space-y-1">
    {PASSWORD_RULES.map((rule) => {
      const met = rule.test(value);
      return (
        <li
          key={rule.id}
          className={`flex items-center gap-1.5 text-xs transition ${
            met ? "text-green-600" : "text-gray-400"
          }`}
        >
          {met ? <Check size={13} /> : <Circle size={13} />}
          {rule.label}
        </li>
      );
    })}
  </ul>
);

export default PasswordRequirements;
