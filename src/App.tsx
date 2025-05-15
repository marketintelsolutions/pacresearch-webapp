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
  ]);
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
