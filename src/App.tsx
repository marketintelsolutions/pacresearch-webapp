import { RouterProvider, createBrowserRouter } from "react-router-dom";
import React from "react";
import MainLayout from "./components/Layout/MainLayout";
import Landing from "./pages/Landing";
import About from "./pages/About";
import Directors from "./pages/Directors";
import Contact from "./pages/Contact";
import Services from "./pages/Services";
import Resources from "./pages/Resources";
import AdminLogin from "./pages/Admin/AdminLogin";
import AdminLayout from "./components/Layout/AdminLayout";
import Macroeconomics from "./pages/Admin/Macroeconomics";
import EquityMarket from "./pages/Admin/EquityMarket";
import AdminResources from "./pages/Admin/AdminResources";
import Director from "./pages/Director";
import NewsCommentary from "./pages/Admin/NewsCommentary";
import AdminReportArchive from "./pages/Admin/AdminReportArchive";
import AdminReportEditions from "./pages/Admin/AdminReportEditions";
import AdminCustomers from "./pages/Admin/AdminCustomers";
import AdminTransactions from "./pages/Admin/AdminTransactions";
import AdminLoyalty from "./pages/Admin/AdminLoyalty";
import ReportArchive from "./pages/ReportArchive";
import ReportDetails from "./pages/ReportDetails";
import CustomerAuthListener from "./components/Layout/CustomerAuthListener";
import CustomerAuthGuard from "./components/Layout/CustomerAuthGuard";
import Login from "./pages/Account/Login";
import Signup from "./pages/Account/Signup";
import Account from "./pages/Account/Account";
import AcceptInvite from "./pages/Account/AcceptInvite";
import Checkout from "./pages/Account/Checkout";
import PaymentCallback from "./pages/Account/PaymentCallback";
import SecureViewer from "./pages/Account/SecureViewer";
import ProfileSettings from "./pages/Account/ProfileSettings";
import ForgotPassword from "./pages/Account/ForgotPassword";
import ResetPassword from "./pages/Account/ResetPassword";
import Invoices from "./pages/Account/Invoices";
import NewInvoice from "./pages/Account/NewInvoice";
import AdminInvoices from "./pages/Admin/AdminInvoices";

// Lazy-loaded so recharts is split into its own chunk and kept out of the
// bundle that public visitors download.
const AdminAnalytics = React.lazy(() => import("./pages/Admin/AdminAnalytics"));

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <MainLayout>
          <Landing />
        </MainLayout>
      ),
    },
    {
      path: "/about",
      element: (
        <MainLayout>
          <About />
        </MainLayout>
      ),
    },
    {
      path: "/about/directors",
      element: (
        <MainLayout>
          <Directors />
        </MainLayout>
      ),
    },
    {
      path: "/about/director/:id",
      element: (
        <MainLayout>
          <Director />
        </MainLayout>
      ),
    },
    {
      path: "/services",
      element: (
        <MainLayout>
          <Services />
        </MainLayout>
      ),
    },
    {
      path: "/resources",
      element: (
        <MainLayout>
          <Resources />
        </MainLayout>
      ),
    },
    {
      path: "/contact",
      element: (
        <MainLayout>
          <Contact />
        </MainLayout>
      ),
    },
    {
      path: "/report-archive",
      element: (
        <MainLayout>
          <ReportArchive />
        </MainLayout>
      ),
    },
    {
      path: "/report-archive/payment-callback",
      element: (
        <MainLayout>
          <CustomerAuthGuard>
            <PaymentCallback />
          </CustomerAuthGuard>
        </MainLayout>
      ),
    },
    {
      path: "/report-archive/:reportId",
      element: (
        <MainLayout>
          <ReportDetails />
        </MainLayout>
      ),
    },
    {
      path: "/report-archive/:reportId/checkout",
      element: (
        <MainLayout>
          <CustomerAuthGuard>
            <Checkout />
          </CustomerAuthGuard>
        </MainLayout>
      ),
    },
    {
      path: "/account/login",
      element: (
        <MainLayout>
          <Login />
        </MainLayout>
      ),
    },
    {
      path: "/account/signup",
      element: (
        <MainLayout>
          <Signup />
        </MainLayout>
      ),
    },
    {
      path: "/account/forgot-password",
      element: (
        <MainLayout>
          <ForgotPassword />
        </MainLayout>
      ),
    },
    {
      path: "/account/reset-password",
      element: (
        <MainLayout>
          <ResetPassword />
        </MainLayout>
      ),
    },
    {
      path: "/account/accept-invite",
      element: (
        <MainLayout>
          <AcceptInvite />
        </MainLayout>
      ),
    },
    {
      path: "/account",
      element: (
        <MainLayout>
          <CustomerAuthGuard>
            <Account />
          </CustomerAuthGuard>
        </MainLayout>
      ),
    },
    {
      path: "/account/profile",
      element: (
        <MainLayout>
          <CustomerAuthGuard>
            <ProfileSettings />
          </CustomerAuthGuard>
        </MainLayout>
      ),
    },
    {
      path: "/account/invoices",
      element: (
        <MainLayout>
          <CustomerAuthGuard>
            <Invoices />
          </CustomerAuthGuard>
        </MainLayout>
      ),
    },
    {
      path: "/account/invoices/new",
      element: (
        <MainLayout>
          <CustomerAuthGuard>
            <NewInvoice />
          </CustomerAuthGuard>
        </MainLayout>
      ),
    },
    {
      path: "/account/report/:editionId/view",
      element: (
        <MainLayout>
          <CustomerAuthGuard requireEntitlement>
            <SecureViewer />
          </CustomerAuthGuard>
        </MainLayout>
      ),
    },
    {
      path: "/admin/login",
      element: (
        <MainLayout>
          <AdminLogin />
        </MainLayout>
      ),
    },
    {
      path: "/admin/macroeconomics",
      element: (
        <MainLayout>
          <AdminLayout>
            <Macroeconomics />
          </AdminLayout>
        </MainLayout>
      ),
    },
    {
      path: "/admin/equity-market",
      element: (
        <MainLayout>
          <AdminLayout>
            <EquityMarket />
          </AdminLayout>
        </MainLayout>
      ),
    },
    {
      path: "/admin/resources",
      element: (
        <MainLayout>
          <AdminLayout>
            <AdminResources />
          </AdminLayout>
        </MainLayout>
      ),
    },
    {
      path: "/admin/news",
      element: (
        <MainLayout>
          <AdminLayout>
            <NewsCommentary />
          </AdminLayout>
        </MainLayout>
      ),
    },
    {
      path: "/admin/report-archive",
      element: (
        <MainLayout>
          <AdminLayout>
            <AdminReportArchive />
          </AdminLayout>
        </MainLayout>
      ),
    },
    {
      path: "/admin/report-archive/:reportId/editions",
      element: (
        <MainLayout>
          <AdminLayout>
            <AdminReportEditions />
          </AdminLayout>
        </MainLayout>
      ),
    },
    {
      path: "/admin/customers",
      element: (
        <MainLayout>
          <AdminLayout>
            <AdminCustomers />
          </AdminLayout>
        </MainLayout>
      ),
    },
    {
      path: "/admin/transactions",
      element: (
        <MainLayout>
          <AdminLayout>
            <AdminTransactions />
          </AdminLayout>
        </MainLayout>
      ),
    },
    {
      path: "/admin/loyalty",
      element: (
        <MainLayout>
          <AdminLayout>
            <AdminLoyalty />
          </AdminLayout>
        </MainLayout>
      ),
    },
    {
      path: "/admin/invoices",
      element: (
        <MainLayout>
          <AdminLayout>
            <AdminInvoices />
          </AdminLayout>
        </MainLayout>
      ),
    },
    {
      path: "/admin/analytics",
      element: (
        <MainLayout>
          <AdminLayout>
            <React.Suspense
              fallback={
                <div className="container mx-auto px-4 py-16 text-center text-gray-500">
                  Loading analytics…
                </div>
              }
            >
              <AdminAnalytics />
            </React.Suspense>
          </AdminLayout>
        </MainLayout>
      ),
    },
  ]);
  return (
    <>
      <CustomerAuthListener />
      <RouterProvider router={router} />
    </>
  );
}

export default App;
