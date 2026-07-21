import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { CheckCircle2, KeyRound, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { auth } from "../../firebase/firebaseConfig";
import PageBanner from "../../components/Layout/PageBanner";
import PasswordRequirements from "../../components/Account/PasswordRequirements";
import { isPasswordValid, passwordError } from "../../utils/passwordPolicy";

type Stage = "verifying" | "form" | "success" | "invalid";

/**
 * Handles the password-reset link from email. Requires Firebase Auth's password
 * reset template to use a custom action URL pointing at this page; otherwise
 * Firebase's own hosted page handles the reset instead.
 */
const ResetPassword = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const oobCode = params.get("oobCode") || "";

  const [stage, setStage] = useState<Stage>("verifying");
  const [accountEmail, setAccountEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const verify = useCallback(async () => {
    if (!oobCode) {
      setStage("invalid");
      return;
    }
    try {
      const mail = await verifyPasswordResetCode(auth, oobCode);
      setAccountEmail(mail);
      setStage("form");
    } catch {
      setStage("invalid");
    }
  }, [oobCode]);

  useEffect(() => {
    verify();
  }, [verify]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const policyError = passwordError(password);
    if (policyError) {
      setError(policyError);
      return;
    }
    if (password !== confirm) {
      setError("The two passwords don't match.");
      return;
    }
    setSaving(true);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      setStage("success");
    } catch (err) {
      const code = (err as { code?: string })?.code || "";
      if (code === "auth/weak-password") {
        setError("That password is too weak. Try a longer one.");
      } else if (
        code === "auth/expired-action-code" ||
        code === "auth/invalid-action-code"
      ) {
        setStage("invalid");
      } else {
        setError("Could not reset your password. Please try again.");
      }
      setSaving(false);
    }
  };

  return (
    <>
      <PageBanner text="ACCOUNT" />
      <section className="w-full px-6 max-w-[460px] mx-auto mt-[60px] mb-20">
        {stage === "verifying" && (
          <div className="py-16 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primaryBlue border-r-transparent" />
            <p className="mt-3 text-sm text-gray-500">Checking your link…</p>
          </div>
        )}

        {stage === "invalid" && (
          <div className="text-center">
            <span className="inline-flex p-4 rounded-full bg-amber-50 text-amber-600 mb-4">
              <AlertTriangle size={28} />
            </span>
            <h1 className="text-2xl font-bold text-primaryBlue mb-2">
              This link has expired
            </h1>
            <p className="text-sm text-gray-600">
              Password reset links can only be used once and expire after a
              short time. Request a fresh one to continue.
            </p>
            <Link
              to="/account/forgot-password"
              className="mt-6 inline-block px-6 py-3 bg-primaryBlue text-white rounded-full font-semibold hover:opacity-90"
            >
              Request a new link
            </Link>
          </div>
        )}

        {stage === "form" && (
          <>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 rounded-full bg-primaryBlue/5 text-primaryBlue">
                <KeyRound size={18} />
              </span>
              <h1 className="text-2xl font-bold text-primaryBlue">
                Set a new password
              </h1>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              For <strong className="text-primaryBlue">{accountEmail}</strong>
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
                {error}
              </div>
            )}

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New password
                </label>
                <div className="relative">
                  <input
                    type={show ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondaryBlue/40 focus:border-secondaryBlue"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    aria-label={show ? "Hide password" : "Show password"}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <PasswordRequirements value={password} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm new password
                </label>
                <input
                  type={show ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondaryBlue/40 focus:border-secondaryBlue"
                  required
                />
                {confirm.length > 0 && confirm !== password && (
                  <p className="mt-1 text-xs text-red-600">
                    Passwords don't match yet.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={
                  saving || !isPasswordValid(password) || password !== confirm
                }
                className="w-full px-4 py-3 bg-primaryBlue text-white rounded-full font-semibold hover:opacity-90 disabled:opacity-60"
              >
                {saving ? "Updating…" : "Update password"}
              </button>
            </form>
          </>
        )}

        {stage === "success" && (
          <div className="text-center">
            <span className="inline-flex p-4 rounded-full bg-green-50 text-green-600 mb-4">
              <CheckCircle2 size={28} />
            </span>
            <h1 className="text-2xl font-bold text-primaryBlue mb-2">
              Password updated
            </h1>
            <p className="text-sm text-gray-600">
              You can now sign in with your new password.
            </p>
            <button
              onClick={() => navigate("/account/login", { replace: true })}
              className="mt-6 px-6 py-3 bg-primaryBlue text-white rounded-full font-semibold hover:opacity-90"
            >
              Go to sign in
            </button>
          </div>
        )}
      </section>
    </>
  );
};

export default ResetPassword;
