import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  fetchCatalog,
  setSelectedCategory,
} from "../../store/reportArchiveSlice";
import { formatNaira } from "../../utils/format";
import { Report } from "../../types";

const ReportArchiveBottom: React.FC = () => {
  const dispatch = useAppDispatch();
  const { categories, reports, editionsById, selectedCategory, loading } =
    useAppSelector((state) => ({
      categories: state.reportArchive.categories,
      reports: state.reportArchive.reports,
      editionsById: state.reportArchive.editionsById,
      selectedCategory: state.reportArchive.selectedCategory,
      loading: state.reportArchive.loading,
    }));

  useEffect(() => {
    dispatch(fetchCatalog());
  }, [dispatch]);

  const visibleReports = selectedCategory
    ? reports.filter((r) => r.categoryId === selectedCategory)
    : reports;

  const priceOf = (report: Report): number | null => {
    if (!report.currentEditionId) return null;
    const edition = editionsById[report.currentEditionId];
    return edition ? edition.price : null;
  };

  return (
    <section className="w-full px-6 xl:px-0 max-w-max mx-auto mt-[60px]">
      {/* Category filter */}
      <div className="flex flex-wrap gap-3 mb-10">
        <button
          onClick={() => dispatch(setSelectedCategory(null))}
          className={`px-5 py-2 rounded-full text-sm font-semibold font-['Inter'] transition ${
            selectedCategory === null
              ? "bg-primaryBlue text-white"
              : "bg-white text-primaryBlue border border-primaryBlue/20 hover:border-primaryBlue"
          }`}
        >
          All Reports
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => dispatch(setSelectedCategory(cat.id))}
            className={`px-5 py-2 rounded-full text-sm font-semibold font-['Inter'] transition ${
              selectedCategory === cat.id
                ? "bg-primaryBlue text-white"
                : "bg-white text-primaryBlue border border-primaryBlue/20 hover:border-primaryBlue"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Report grid */}
      {loading.catalog ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[25px]">
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className="h-[360px] bg-white rounded-[10px] animate-pulse"
            />
          ))}
        </div>
      ) : visibleReports.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-gray-500">No reports available in this category yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[25px] pb-10">
          {visibleReports.map((report) => {
            const price = priceOf(report);
            return (
              <div
                key={report.id}
                className="relative p-[1px] w-full overflow-hidden rounded-[10px]"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-[#15BFFD] to-[#9C37FD] rounded-[10px]" />
                <div className="relative z-[1] bg-white rounded-[9px] h-full flex flex-col">
                  {/* Cover */}
                  <div className="h-[180px] w-full rounded-t-[9px] overflow-hidden bg-primaryBlue/5 flex items-center justify-center">
                    {report.coverImageUrl ? (
                      <img
                        src={report.coverImageUrl}
                        alt={report.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src="/images/pdf.svg"
                        alt=""
                        className="w-[56px] opacity-60"
                      />
                    )}
                  </div>

                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="text-primaryBlue text-lg font-bold font-['Inter'] leading-snug capitalize">
                      {report.title}
                    </h3>
                    {report.summary && (
                      <p className="mt-2 text-sm text-gray-600 font-['Inter'] line-clamp-3">
                        {report.summary}
                      </p>
                    )}

                    <div className="mt-auto pt-5 flex items-center justify-between">
                      <span className="text-primaryBlue font-bold font-['Inter']">
                        {price !== null ? formatNaira(price) : "Coming soon"}
                      </span>
                      <Link
                        to={`/report-archive/${report.id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-primaryBlue text-white rounded-full text-sm font-semibold hover:opacity-90"
                      >
                        <Lock size={14} /> View
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default ReportArchiveBottom;
