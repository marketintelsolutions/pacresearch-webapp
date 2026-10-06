import React from "react";
import { Navigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import { useAppSelector } from "../../hooks/redux";

/**
 * Admin route guard. Requires an active adminUsers/{uid} document — being
 * signed in is NOT enough, since customers share the same Firebase session.
 * Anyone else (signed out, or signed in as a customer) is sent to the admin
 * login page.
 */
const AdminLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const { user, isAdmin, authReady } = useAppSelector((state) => ({
    user: state.customerAuth.user,
    isAdmin: state.customerAuth.isAdmin,
    authReady: state.customerAuth.authReady,
  }));

  // Wait for auth and, when signed in, the adminUsers lookup to resolve.
  if (!authReady || (user && isAdmin === null)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="flex w-full max-w-[1350px] mx-auto mt-20 gap-12">
      <AdminSidebar />
      {children}
    </div>
  );
};

export default AdminLayout;
