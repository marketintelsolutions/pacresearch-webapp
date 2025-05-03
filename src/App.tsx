import { RouterProvider, createBrowserRouter } from "react-router-dom";
import React from "react";
import MainLayout from "./components/Layout/MainLayout";
import Landing from "./pages/Landing";
import About from "./pages/About";
import Directors from "./pages/Directors";
import Contact from "./pages/Contact";
import Services from "./pages/Services";
import Resources from "./pages/Resources";

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
  ]);
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
