import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { clearError, clearSuccess } from "../../store/reportsAdminSlice";
import EditionsManager from "../../components/Admin/ReportArchive/EditionsManager";

const AdminReportEditions = () => {
  const { reportId } = useParams<{ reportId: string }>();
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

  if (!reportId) return null;

  return (
    <>
      {(error || success) && (
        <div className="container mx-auto px-4 pt-6">
          {error && (
            <div className="mb-2 p-3 bg-red-100 text-red-700 rounded">{error}</div>
          )}
          {success && (
            <div className="mb-2 p-3 bg-green-100 text-green-700 rounded">
              {success}
            </div>
          )}
        </div>
      )}
      <EditionsManager reportId={reportId} />
    </>
  );
};

export default AdminReportEditions;
