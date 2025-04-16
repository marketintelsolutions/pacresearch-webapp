import React, { JSX, useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import SendMessage from "./SendMessage";

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
    <div className="bg-[#D7DFFF] pb-20">
      <Navbar />
      {children}
      <SendMessage />
      <Footer />
    </div>
  );
};

export default MainLayout;
