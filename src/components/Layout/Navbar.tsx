import React from "react";
import { IconBaseProps } from "react-icons";
import { FiPhone } from "react-icons/fi";
import { Link } from "react-router-dom";
import PreNav from "./PreNav";

const links = [
  {
    path: "/about",
    text: "About",
  },
  {
    path: "/services",
    text: "Services",
  },
  {
    path: "/resources",
    text: "Resources",
  },
  {
    path: "/contact",
    text: "Contact",
  },
];

const Navbar = () => {
  return (
    <>
      <PreNav />
      <nav className="sticky z-[999] w-full max-w-[1063px] mx-auto bg-[#FFFFFF] rounded-[30px] mt-[74px] top-[0px] py-5 px-[37px] flex justify-between items-center">
        <Link to={"/"}>
          <div className="w-full max-w-[181px] ">
            <img src="/logo.svg" alt="logo" className="w-full h-full" />
          </div>
        </Link>
        <div className="flex gap-12">
          {links.map((item) => (
            <Link
              to={item.path}
              className="text-center justify-start text-neutral-500 text-sm font-semibold font-['Montserrat'] underline leading-normal tracking-tight"
            >
              {item.text}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
