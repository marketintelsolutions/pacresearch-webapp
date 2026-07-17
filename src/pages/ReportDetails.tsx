import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Lock, Eye, BadgePercent, ShieldCheck, FileText } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { fetchReportDetails } from "../store/reportArchiveSlice";
import { formatNaira } from "../utils/format";
import PageBanner from "../components/Layout/PageBanner";
import ReportPreviewModal from "../components/ReportArchive/ReportPreviewModal";

const ReportDetails = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { activeReport, activeReportEditions, loading, error } = useAppSelector(
    (state) => ({
      activeReport: state.reportArchive.activeReport,
      activeReportEditions: state.reportArchive.activeReportEditions,
      loading: state.reportArchive.loading,
      error: state.reportArchive.error,
    })
  );

  useEffect(() => {
    if (reportId) dispatch(fetchReportDetails(reportId));
  }, [dispatch, reportId]);

  const [showPreview, setShowPreview] = useState(false);

  const currentEdition =
    activeReport?.currentEditionId != null
      ? activeReportEditions.find((e) => e.id === activeReport.currentEditionId)
      : undefined;

  const purchasable = !!currentEdition;

  return (
    <>
      <PageBanner text="REPORT ARCHIVE" />

      <section className="w-full px-6 xl:px-0 max-w-max mx-auto mt-[60px] mb-16">
        <Link
          to="/report-archive"
          className="text-secondaryBlue border border-secondaryBlue px-4 py-2 rounded-[16px] hover:underline text-sm font-['Inter']"
        >
          ← Back to all reports
        </Link>

        {loading.details ? (
          <div className="mt-8 h-[400px] bg-white rounded-2xl animate-pulse" />
        ) : error || !activeReport ? (
          <div className="mt-8 py-16 text-center">
            <p className="text-gray-500">{error || "Report not found."}</p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-10">
            {/* Cover + purchase card */}
            <div>
              <div className="relative p-[1px] rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[#15BFFD] to-[#9C37FD]" />
                <div className="relative z-[1] bg-white rounded-[15px] overflow-hidden">
                  <div className="h-[300px] bg-primaryBlue/50 flex items-center justify-center">
                    {activeReport.coverImageUrl ? (
                      <img
                        src={activeReport.coverImageUrl}
                        alt={activeReport.title}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <img
                        src="/images/pdf.svg"
                        alt=""
                        className="w-[72px] opacity-60 object-contain"
                      />
                    )}
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-gray-500 font-['Inter']">
                      Price
                    </p>
                    <p className="text-3xl font-bold text-primaryBlue font-['Inter']">
                      {purchasable
                        ? formatNaira(currentEdition!.price)
                        : "Coming soon"}
                    </p>
                    {currentEdition && (
                      <p className="mt-1 text-xs text-gray-500">
                        {currentEdition.editionLabel}
                      </p>
                    )}

                    <button
                      disabled={!purchasable}
                      onClick={() =>
                        navigate(`/report-archive/${activeReport.id}/checkout`)
                      }
                      className="mt-5 w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-primaryBlue text-white rounded-full font-semibold hover:opacity-90 disabled:opacity-50"
                    >
                      <Lock size={16} />
                      {purchasable
                        ? "Buy & Read Securely"
                        : "Not available yet"}
                    </button>

                    {purchasable && (
                      <button
                        onClick={() => setShowPreview(true)}
                        className="mt-2 w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-primaryBlue text-primaryBlue rounded-full font-semibold hover:bg-primaryBlue hover:text-white transition"
                      >
                        <Eye size={16} /> Preview first pages
                      </button>
                    )}

                    {purchasable && (
                      <Link
                        to={`/account/invoices/new?edition=${currentEdition!.id}`}
                        className="mt-2 w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm text-gray-600 hover:text-primaryBlue"
                      >
                        <FileText size={15} /> Request an invoice
                      </Link>
                    )}

                    <p className="mt-3 text-xs text-gray-500 text-center">
                      You'll accept the Terms of Use before payment.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Details */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-primaryBlue font-['Inter'] capitalize">
                {activeReport.title}
              </h1>
              {activeReport.tags?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {activeReport.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-3 py-1 rounded-full bg-primaryBlue/5 text-primaryBlue"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {activeReport.description && (
                <p className="mt-6 text-gray-700 leading-relaxed font-['Inter'] whitespace-pre-line">
                  {activeReport.description}
                </p>
              )}

              {/* What you get */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Feature
                  icon={<Eye size={18} />}
                  title="Secure online reader"
                  text="Read in-browser, view-only. Reports are not downloadable."
                />
                <Feature
                  icon={<ShieldCheck size={18} />}
                  title="Licensed access"
                  text="Unlimited access to your purchased edition within your account."
                />
                <Feature
                  icon={<BadgePercent size={18} />}
                  title="Loyalty discount"
                  text="Own an earlier edition? A discount is applied automatically to the successor edition."
                />
                <Feature
                  icon={<Lock size={18} />}
                  title="Paystack checkout"
                  text="Pay securely by card or bank transfer."
                />
              </div>

              {/* Editions */}
              {activeReportEditions.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-primaryBlue mb-3">
                    Editions
                  </h3>
                  <div className="border rounded-lg divide-y">
                    {activeReportEditions.map((edition) => (
                      <div
                        key={edition.id}
                        className="flex items-center justify-between p-3 text-sm"
                      >
                        <span className="font-medium text-gray-800">
                          {edition.editionLabel}
                          {edition.id === activeReport.currentEditionId && (
                            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                              latest
                            </span>
                          )}
                        </span>
                        <span className="text-primaryBlue font-semibold">
                          {formatNaira(edition.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {activeReport && currentEdition && (
        <ReportPreviewModal
          open={showPreview}
          editionId={currentEdition.id}
          title={activeReport.title}
          onClose={() => setShowPreview(false)}
          onBuy={() => {
            setShowPreview(false);
            navigate(`/report-archive/${activeReport.id}/checkout`);
          }}
        />
      )}
    </>
  );
};

const Feature: React.FC<{
  icon: React.ReactNode;
  title: string;
  text: string;
}> = ({ icon, title, text }) => (
  <div className="flex gap-3 p-4 rounded-xl bg-primaryBlue/[0.03] border border-primaryBlue/10">
    <span className="text-secondaryBlue mt-0.5">{icon}</span>
    <div>
      <p className="font-semibold text-primaryBlue text-sm">{title}</p>
      <p className="text-xs text-gray-600 mt-0.5">{text}</p>
    </div>
  </div>
);

export default ReportDetails;
