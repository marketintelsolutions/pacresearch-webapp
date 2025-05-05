import React, { JSX, useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import SendMessage from "./SendMessage";
import MainBackgroundStyles from "./MainBackgroundStyles";

const MainLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const { pathname } = window.location;

  useEffect(() => {
    window.scroll(0, 0);
  }, [pathname]);

  return (
    <div className="relative bg-[#eef5fe] pb-20 overflow-hidden">
      <Navbar />
      <div className="relative z-[2] ">{children}</div>
      <Footer />
      <MainBackgroundStyles />
    </div>
  );
};

export default MainLayout;
