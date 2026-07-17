import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import { clearError, clearSuccess } from "../../../store/reportsAdminSlice";
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
      <h1 className="text-2xl font-bold text-primaryBlue mb-6">
        Report Archive
      </h1>

      {/* Toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2 w-[320px]">
        {error && (
          <div className="p-3 rounded-lg bg-red-600 text-white text-sm shadow-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 rounded-lg bg-green-600 text-white text-sm shadow-lg">
            {success}
          </div>
        )}
      </div>

      <div className="max-w-[1000px]">
        <ReportManager />
      </div>
    </div>
  );
};

export default ReportArchiveAdmin;
