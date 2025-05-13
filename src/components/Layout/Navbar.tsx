import React, { useState } from "react";
import { IconBaseProps } from "react-icons";
import { FiPhone } from "react-icons/fi";
import { Link } from "react-router-dom";
import PreNav from "./PreNav";
import { Menu } from "lucide-react";

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
  const [isMenu, setIsMenu] = useState(false);

  return (
    <>
      <PreNav />
      <nav
        className={`sticky z-[999] w-full max-w-[1063px] mx-auto bg-[#FFFFFF] rounded-[30px] mt-[74px] top-0 md:top-[20px] py-5 px-[37px] flex justify-between items-center ${
          isMenu && "rounded-b-none"
        }`}
      >
        <Link to={"/"}>
          <div className="w-full max-w-[181px] ">
            <img src="/logo.svg" alt="logo" className="w-full h-full" />
          </div>
        </Link>
        <div
          className={`absolute md:relative top-full left-0  flex-col md:flex-row px-6 md:px-0 bg-white w-full md:w-fit py-10 md:py-0 gap-12 rounded-b-[30px] ${
            isMenu ? "flex" : "zr:hidden md:flex"
          }`}
        >
          {links.map((item) => (
            <Link
              to={item.path}
              onClick={() => setIsMenu(false)}
              className="text-center justify-start text-neutral-500 text-sm font-semibold font-['Montserrat'] underline leading-normal tracking-tight"
            >
              {item.text}
            </Link>
          ))}
        </div>
        <button
          onClick={() => setIsMenu((prev) => !prev)}
          className="zr:flex md:hidden cursor-pointer"
        >
          <Menu />
        </button>
      </nav>
    </>
  );
};

export default Navbar;
