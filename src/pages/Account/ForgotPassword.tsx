import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { MailCheck, KeyRound, ArrowLeft } from "lucide-react";
import { callSendPasswordResetLink } from "../../firebase/functions";
import PageBanner from "../../components/Layout/PageBanner";

type Step = "email" | "sent";

const RESEND_COOLDOWN = 30;

const ForgotPassword = () => {
  const location = useLocation();
  const prefill = (location.state as { email?: string })?.email || "";

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState(prefill);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const send = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const address = email.trim();
    if (!address) return;

    setSending(true);
    setError("");
    try {
      // The function always reports success and never discloses whether an
      // account exists, so there's no user-not-found case to handle here.
      await callSendPasswordResetLink({ email: address });
      setStep("sent");
      setCooldown(RESEND_COOLDOWN);
    } catch (err) {
      const code = (err as { code?: string })?.code || "";
      setError(
        code === "functions/invalid-argument"
          ? "Enter a valid email address."
          : "Could not send the reset email. Please try again."
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <PageBanner text="ACCOUNT" />
      <section className="w-full px-6 max-w-[460px] mx-auto mt-[60px] mb-20">
        {step === "email" ? (
          <>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 rounded-full bg-primaryBlue/5 text-primaryBlue">
                <KeyRound size={18} />
              </span>
              <h1 className="text-2xl font-bold text-primaryBlue">
                Forgot your password?
              </h1>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Enter the email address on your account and we'll send you a link
              to set a new password.
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
                {error}
              </div>
            )}

            <form onSubmit={send} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                  placeholder="you@company.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondaryBlue/40 focus:border-secondaryBlue"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={sending || !email.trim()}
                className="w-full px-4 py-3 bg-primaryBlue text-white rounded-full font-semibold hover:opacity-90 disabled:opacity-60"
              >
                {sending ? "Sending…" : "Send reset link"}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <span className="inline-flex p-4 rounded-full bg-green-50 text-green-600 mb-4">
              <MailCheck size={28} />
            </span>
            <h1 className="text-2xl font-bold text-primaryBlue mb-2">
              Check your email
            </h1>
            <p className="text-sm text-gray-600">
              If an account exists for{" "}
              <strong className="text-primaryBlue">{email}</strong>, we've sent a
              link to reset your password.
            </p>
            <p className="mt-3 text-xs text-gray-500">
              The link expires shortly. Can't find it? Check your spam or
              promotions folder.
            </p>

            <div className="mt-8 space-y-3">
              <button
                onClick={() => send()}
                disabled={cooldown > 0 || sending}
                className="w-full px-4 py-2.5 border border-primaryBlue text-primaryBlue rounded-full font-semibold hover:bg-primaryBlue hover:text-white transition disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-primaryBlue"
              >
                {cooldown > 0
                  ? `Resend in ${cooldown}s`
                  : sending
                  ? "Sending…"
                  : "Resend email"}
              </button>
              <button
                onClick={() => {
                  setStep("email");
                  setError("");
                }}
                className="w-full text-sm text-gray-500 hover:text-primaryBlue"
              >
                Use a different email address
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            to="/account/login"
            className="inline-flex items-center gap-1.5 text-sm text-secondaryBlue hover:underline"
          >
            <ArrowLeft size={14} /> Back to sign in
          </Link>
        </div>
      </section>
    </>
  );
};

export default ForgotPassword;
