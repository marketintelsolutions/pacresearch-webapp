import React, { useEffect, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";
import { Navigate } from "react-router-dom";
import Layout from "../Admin/Layout";
import Dashboard from "../Admin/EquityMarketDashboard";

const AdminLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={"/admin/login"} />;
  }

  return (
    <div className="flex w-full max-w-[1350px] mx-auto mt-20 gap-12">
      <AdminSidebar />
      {children}
    </div>
    // <Layout>
    //   <Dashboard />
    // </Layout>
  );
};

export default AdminLayout;
