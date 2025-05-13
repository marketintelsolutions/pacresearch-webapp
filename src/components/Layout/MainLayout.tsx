import React, { JSX, useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import SendMessage from "./SendMessage";
import MainBackgroundStyles from "./MainBackgroundStyles";
import { Helmet } from "react-helmet-async";

// Telephone: +234 (1) 2716892, +234 (1) 2718630
// Website: https://pacresearch.org/
// Email: info@pacresearch.org

const metadata = {
  home: {
    title: "Research companies in Nigeria",
    description: "Innovative research products",
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
};

type PageName = "home" | "about" | "services" | "resources" | "contact";

const MainLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const { pathname } = window.location;

  useEffect(() => {
    window.scroll(0, 0);
  }, [pathname]);

  const pageName =
    pathname === "/" ? "home" : (pathname.split("/")[1] as PageName);

  return (
    <>
      <Helmet>
        <title>{metadata[pageName].title}</title>
        <meta name="description" content={metadata[pageName].description} />
        <link rel="canonical" href={pathname} />
      </Helmet>

      <div className=" bg-[#eef5fe]  pb-20">
        <Navbar />
        <div className="relative z-[2]">{children}</div>
        <Footer />
        <MainBackgroundStyles />
      </div>
    </>
  );
};

export default MainLayout;
