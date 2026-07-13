import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { fetchReportDetails } from "../../store/reportArchiveSlice";
import { callInitializeTransaction } from "../../firebase/functions";
import { formatNaira } from "../../utils/format";
import PageBanner from "../../components/Layout/PageBanner";

const TERMS = [
  "Reports are licensed, not sold.",
  "No redistribution, reproduction, or resale.",
  "No public sharing or commercial redistribution.",
  "Access is for your account (or organisation) only.",
  "Access may be revoked for violations of these terms.",
];

const Checkout = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const dispatch = useAppDispatch();

  const { activeReport, activeReportEditions, loading } = useAppSelector(
    (state) => ({
      activeReport: state.reportArchive.activeReport,
      activeReportEditions: state.reportArchive.activeReportEditions,
      loading: state.reportArchive.loading,
    })
  );

  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (reportId) dispatch(fetchReportDetails(reportId));
  }, [dispatch, reportId]);

  const edition =
    activeReport?.currentEditionId != null
      ? activeReportEditions.find((e) => e.id === activeReport.currentEditionId)
      : undefined;

  const pay = async () => {
    if (!edition || !accepted) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await callInitializeTransaction({
        purchaseKind: "report",
        editionId: edition.id,
        termsAccepted: true,
      });
      window.location.href = res.data.authorizationUrl;
    } catch (e) {
      setError((e as { message?: string })?.message || "Could not start payment.");
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageBanner text="CHECKOUT" />
      <section className="w-full px-6 max-w-[640px] mx-auto mt-[60px] mb-20">
        {loading.details ? (
          <div className="h-[400px] bg-white rounded-2xl animate-pulse" />
        ) : !activeReport || !edition ? (
          <div className="py-16 text-center">
            <p className="text-gray-500 mb-3">This report isn't available for purchase.</p>
            <Link to="/report-archive" className="text-secondaryBlue hover:underline">
              Back to Report Archive
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-primaryBlue mb-6">Checkout</h1>

            {/* Order summary */}
            <div className="p-6 bg-white rounded-xl border mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-primaryBlue">
                    {activeReport.title}
                  </p>
                  <p className="text-sm text-gray-500">{edition.editionLabel}</p>
                </div>
                <p className="text-xl font-bold text-primaryBlue">
                  {formatNaira(edition.price)}
                </p>
              </div>
              <p className="mt-4 text-xs text-gray-500">
                If you own an earlier edition, your loyalty discount is applied
                automatically on the payment step.
              </p>
            </div>

            {/* Terms */}
            <div className="p-6 bg-white rounded-xl border mb-6">
              <h2 className="font-semibold text-primaryBlue mb-3">
                Terms of Use
              </h2>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600 mb-4">
                {TERMS.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                />
                I have read and accept the Terms of Use.
              </label>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
                {error}
              </div>
            )}

            <button
              onClick={pay}
              disabled={!accepted || submitting}
              className="w-full px-5 py-3 bg-primaryBlue text-white rounded-full font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {submitting
                ? "Redirecting to Paystack…"
                : `Pay ${formatNaira(edition.price)} with Paystack`}
            </button>
          </>
        )}
      </section>
    </>
  );
};

export default Checkout;
