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
    <div className=" bg-[#eef5fe] pb-20">
      <Navbar />
      {children}
      <Footer />
      <div className="w-full max-w-[356px] absolute top-0 left-0">
        <img
          src="/images/eclipselightblue.svg"
          alt="eclipselightblue"
          className="w-full "
        />
      </div>
      <div className="w-full max-w-[356px] absolute top-0 right-0 rotate-90">
        <img
          src="/images/eclipselightblue.svg"
          alt="eclipselightblue"
          className="w-full "
        />
      </div>
    </div>
  );
};

export default MainLayout;
