import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const links = [
  {
    text: "MacroEconomics",
    path: "/admin/macroeconomics",
  },
  {
    text: "Equity Market",
    path: "/admin/equity-market",
  },
  {
    text: "Resources",
    path: "/admin/resources",
  },
  // {
  //   text: "News",
  //   path: "/admin/news",
  // },
];

const AdminSidebar = () => {
  const [path, setPath] = useState("");

  const { pathname } = window.location;

  useEffect(() => setPath(pathname), [pathname]);

  return (
    <div className=" w-full max-w-[350px] ">
      <div className="bg-primaryBlue rounded-[30px] min-h-[700px] w-full pt-40 flex flex-col gap-10 px-10">
        {links.map((item, index) => (
          <Link
            to={item.path}
            key={index}
            className="flex gap-2 items-center text-white"
          >
            <span
              className={`inline-flex w-3 h-3  rounded-full ${
                item.path === path ? "bg-secondaryBlue" : "bg-white"
              }`}
            ></span>
            <p
              className={`font-semibold text-lg  ${
                item.path === path ? "text-secondaryBlue" : "text-white"
              }`}
            >
              {item.text}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminSidebar;
