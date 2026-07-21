/**
 * Password policy for customer accounts. Applied at signup and on password
 * reset. Edit this list to change the rules in both places at once.
 */
export interface PasswordRule {
  id: string;
  label: string;
  test: (value: string) => boolean;
}

export const PASSWORD_RULES: PasswordRule[] = [
  {
    id: "length",
    label: "At least 8 characters",
    test: (v) => v.length >= 8,
  },
  {
    id: "upper",
    label: "One uppercase letter (A–Z)",
    test: (v) => /[A-Z]/.test(v),
  },
  {
    id: "lower",
    label: "One lowercase letter (a–z)",
    test: (v) => /[a-z]/.test(v),
  },
  {
    id: "number",
    label: "One number (0–9)",
    test: (v) => /\d/.test(v),
  },
  {
    id: "symbol",
    label: "One symbol (! ? @ # $ …)",
    test: (v) => /[^A-Za-z0-9]/.test(v),
  },
];

/** Rules the given password does NOT yet satisfy. */
export const failedPasswordRules = (value: string): PasswordRule[] =>
  PASSWORD_RULES.filter((r) => !r.test(value));

export const isPasswordValid = (value: string): boolean =>
  PASSWORD_RULES.every((r) => r.test(value));

/** First unmet rule, phrased for an error message. */
export const passwordError = (value: string): string | null => {
  const failed = PASSWORD_RULES.filter((r) => !r.test(value));
  if (failed.length === 0) return null;
  return `Password needs: ${failed.map((r) => r.label.toLowerCase()).join(", ")}.`;
};
