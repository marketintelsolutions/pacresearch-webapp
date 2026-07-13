import React from "react";
import PageBanner from "../components/Layout/PageBanner";
import ReportArchiveTop from "../components/ReportArchive/ReportArchiveTop";
import ReportArchiveBottom from "../components/ReportArchive/ReportArchiveBottom";

const ReportArchive = () => {
  return (
    <>
      <PageBanner text="REPORT ARCHIVE" />
      <ReportArchiveTop />
      <ReportArchiveBottom />
    </>
  );
};

export default ReportArchive;
