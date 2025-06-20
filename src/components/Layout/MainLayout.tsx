import React, { JSX, useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import MainBackgroundStyles from "./MainBackgroundStyles";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";
import NewsletterForm from "../Landing/NewsletterForm";

// Telephone: +234 (1) 2716892, +234 (1) 2718630
// Website: https://pacresearch.org/
// Email: info@pacresearch.org

const metadata = {
  home: {
    title: "PAC Research | Research companies in Nigeria",
    description: "Research companies in Nigeria | Innovative research products",
  },
  about: {
    title: "About Research organization",
    description:
      "PAC Research focuses on value creation across diverse sectors in Africa and beyond.",
  },
  services: {
    title: "Services rendered by research organization",
    description:
      "At PAC Research, we specialize in providing comprehensive and tailored solutions to support businesses and organizations in navigating today’s dynamic financial and economic landscape.",
  },
  resources: {
    title: "Research Resource",
    description:
      "Daily Market Summary, Earning Report, Economic Report, Monthly Sectorial Report, Price List, Weekly Market summary.",
  },
  contact: {
    title: "Contact for Research Agencies",
    description:
      "Plot 8A, Elsie Femi Pearse Street, Off Adeola Odeku, Victoria Island, Lagos P.O. Box 70823, Victoria Island, Lagos, Nigeria.",
  },
  admin: {
    title: "",
    description: "",
  },
};

type PageName =
  | "home"
  | "about"
  | "services"
  | "resources"
  | "contact"
  | "admin";

const MainLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const { pathname } = window.location;
  const params = useParams();

  useEffect(() => {
    window.scroll(0, 0);
  }, [pathname, params]);

  const pageName =
    pathname === "/" ? "home" : (pathname.split("/")[1] as PageName);

  return (
    <>
      <Helmet>
        <title>{metadata[pageName].title}</title>
        <meta name="description" content={metadata[pageName].description} />
        <link rel="canonical" href={pathname} />
        {/* do not crawl for admin pages */}
        {/* {pageName === "admin" && <meta name="robots" content="noindex" />} */}
      </Helmet>

      <div className=" bg-[#eef5fe]  pb-20">
        <Navbar />
        <div className="relative z-[2]">{children}</div>
        <Footer />
        <NewsletterForm />
        <MainBackgroundStyles />
      </div>
    </>
  );
};

export default MainLayout;
