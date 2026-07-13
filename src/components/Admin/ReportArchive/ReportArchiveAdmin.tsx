import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import { clearError, clearSuccess } from "../../../store/reportsAdminSlice";
import ReportCategoryManager from "./ReportCategoryManager";
import ReportManager from "./ReportManager";

const ReportArchiveAdmin: React.FC = () => {
  const dispatch = useAppDispatch();
  const { error, success } = useAppSelector((state) => ({
    error: state.reportsAdmin.error,
    success: state.reportsAdmin.success,
  }));

  useEffect(() => {
    if (!success && !error) return;
    const t = setTimeout(() => {
      dispatch(clearSuccess());
      dispatch(clearError());
    }, 4000);
    return () => clearTimeout(t);
  }, [success, error, dispatch]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Report Archive Management</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {success}
        </div>
      )}

      <div className="space-y-8">
        <ReportManager />
        <ReportCategoryManager />
      </div>
    </div>
  );
};

export default ReportArchiveAdmin;
