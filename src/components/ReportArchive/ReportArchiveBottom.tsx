import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Lock, Tag as TagIcon, X } from "lucide-react";
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

  // Tag sub-filter, applied on top of the category filter.
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchCatalog());
  }, [dispatch]);

  // Changing category resets the tag so the two filters never combine into an
  // empty result set.
  const handleSelectCategory = (categoryId: string | null) => {
    dispatch(setSelectedCategory(categoryId));
    setSelectedTag(null);
  };

  const categoryFiltered = selectedCategory
    ? reports.filter((r) => r.categoryId === selectedCategory)
    : reports;

  // Tags (with counts) available within the current category selection.
  const tagCounts = new Map<string, number>();
  categoryFiltered.forEach((r) =>
    (r.tags || []).forEach((t) => tagCounts.set(t, (tagCounts.get(t) || 0) + 1))
  );
  const availableTags = Array.from(tagCounts.entries()).sort((a, b) =>
    a[0].localeCompare(b[0])
  );
  const hasTags = availableTags.length > 0;

  const visibleReports = selectedTag
    ? categoryFiltered.filter((r) => (r.tags || []).includes(selectedTag))
    : categoryFiltered;

  const priceOf = (report: Report): number | null => {
    if (!report.currentEditionId) return null;
    const edition = editionsById[report.currentEditionId];
    return edition ? edition.price : null;
  };

  const gridInner = (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-[25px] pb-10">
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
                  <img src="/images/pdf.svg" alt="" className="w-[56px] opacity-60" />
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

                {/* Tags on the card, clickable to filter */}
                {report.tags?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {report.tags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() =>
                          setSelectedTag((cur) => (cur === tag ? null : tag))
                        }
                        className={`text-[11px] px-2 py-0.5 rounded-full transition ${
                          selectedTag === tag
                            ? "bg-primaryBlue text-white"
                            : "bg-primaryBlue/5 text-primaryBlue hover:bg-primaryBlue/10"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
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
  );

  return (
    <section className="w-full px-6 xl:px-0 max-w-max mx-auto mt-[60px]">
      {/* Category filter */}
      <div className="flex flex-wrap gap-3 mb-10">
        <button
          onClick={() => handleSelectCategory(null)}
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
            onClick={() => handleSelectCategory(cat.id)}
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

      {loading.catalog ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[25px]">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="h-[360px] bg-white rounded-[10px] animate-pulse" />
          ))}
        </div>
      ) : (
        <div
          className={
            hasTags
              ? "grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-[25px] lg:gap-10"
              : ""
          }
        >
          {/* Reports */}
          <div>
            {visibleReports.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-gray-500">
                  {selectedTag
                    ? `No reports tagged “${selectedTag}”.`
                    : "No reports available in this category yet."}
                </p>
                {selectedTag && (
                  <button
                    onClick={() => setSelectedTag(null)}
                    className="mt-3 text-secondaryBlue hover:underline text-sm"
                  >
                    Clear tag filter
                  </button>
                )}
              </div>
            ) : (
              gridInner
            )}
          </div>

          {/* Tags rail */}
          {hasTags && (
            <aside className="lg:order-last order-first">
              <div className="bg-white rounded-xl border border-primaryBlue/10 p-5 lg:sticky lg:top-24">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="flex items-center gap-2 text-primaryBlue font-bold text-sm font-['Inter']">
                    <TagIcon size={16} /> Filter by tag
                  </h3>
                  {selectedTag && (
                    <button
                      onClick={() => setSelectedTag(null)}
                      className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-primaryBlue"
                    >
                      <X size={12} /> Clear
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap lg:flex-col gap-2">
                  {availableTags.map(([tag, count]) => {
                    const active = selectedTag === tag;
                    return (
                      <button
                        key={tag}
                        onClick={() =>
                          setSelectedTag((cur) => (cur === tag ? null : tag))
                        }
                        className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm font-medium transition text-left ${
                          active
                            ? "bg-primaryBlue text-white"
                            : "bg-primaryBlue/[0.04] text-primaryBlue hover:bg-primaryBlue/10"
                        }`}
                      >
                        <span className="capitalize truncate">{tag}</span>
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded-full ${
                            active
                              ? "bg-white/20 text-white"
                              : "bg-primaryBlue/10 text-primaryBlue"
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </aside>
          )}
        </div>
      )}
    </section>
  );
};

export default ReportArchiveBottom;
