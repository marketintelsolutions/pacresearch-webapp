import React, { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { callVerifyTransaction } from "../../firebase/functions";
import { useAppSelector } from "../../hooks/redux";
import PageBanner from "../../components/Layout/PageBanner";

type Status = "verifying" | "success" | "pending" | "failed";

const PaymentCallback = () => {
  const [params] = useSearchParams();
  // Paystack appends ?reference= (and ?trxref=) on redirect.
  const reference = params.get("reference") || params.get("trxref") || "";
  const authReady = useAppSelector((s) => s.customerAuth.authReady);
  const user = useAppSelector((s) => s.customerAuth.user);

  const [status, setStatus] = useState<Status>("verifying");
  const attempts = useRef(0);

  useEffect(() => {
    if (!authReady || !user || !reference) return;
    let timer: ReturnType<typeof setTimeout>;
    let cancelled = false;

    const check = async () => {
      try {
        const res = await callVerifyTransaction({ reference });
        if (cancelled) return;
        const s = res.data.status;
        if (s === "success") {
          setStatus("success");
        } else if (s === "failed" || s === "abandoned") {
          setStatus("failed");
        } else {
          // Still pending — the webhook may not have landed yet; poll a few times.
          attempts.current += 1;
          if (attempts.current < 5) {
            setStatus("pending");
            timer = setTimeout(check, 3000);
          } else {
            setStatus("pending");
          }
        }
      } catch {
        if (!cancelled) setStatus("failed");
      }
    };

    check();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [authReady, user, reference]);

  return (
    <>
      <PageBanner text="PAYMENT" />
      <section className="w-full px-6 max-w-[480px] mx-auto mt-[60px] mb-24 text-center">
        {!reference ? (
          <p className="text-gray-500">No payment reference found.</p>
        ) : status === "verifying" || status === "pending" ? (
          <div>
            <Loader2 className="mx-auto mb-4 animate-spin text-primaryBlue" size={40} />
            <h1 className="text-xl font-bold text-primaryBlue mb-2">
              Confirming your payment…
            </h1>
            <p className="text-sm text-gray-500">
              {status === "pending"
                ? "This can take a few seconds. You can also check your account shortly."
                : "Please wait."}
            </p>
          </div>
        ) : status === "success" ? (
          <div>
            <CheckCircle2 className="mx-auto mb-4 text-green-600" size={48} />
            <h1 className="text-xl font-bold text-primaryBlue mb-2">
              Payment confirmed
            </h1>
            <p className="text-sm text-gray-600 mb-6">
              Your report is now available in your account.
            </p>
            <Link
              to="/account"
              className="inline-block px-6 py-3 bg-primaryBlue text-white rounded-full font-semibold"
            >
              Go to my reports
            </Link>
          </div>
        ) : (
          <div>
            <XCircle className="mx-auto mb-4 text-red-600" size={48} />
            <h1 className="text-xl font-bold text-primaryBlue mb-2">
              Payment not completed
            </h1>
            <p className="text-sm text-gray-600 mb-6">
              We couldn't confirm this payment. If you were charged, contact
              support with your reference: <br />
              <span className="font-mono text-xs">{reference}</span>
            </p>
            <Link
              to="/report-archive"
              className="inline-block px-6 py-3 bg-primaryBlue text-white rounded-full font-semibold"
            >
              Back to Report Archive
            </Link>
          </div>
        )}
      </section>
    </>
  );
};

export default PaymentCallback;
