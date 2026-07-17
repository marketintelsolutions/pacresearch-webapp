import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const links = [
  {
    text: "MacroEconomics",
    path: "/admin/macroeconomics",
    icon: "macroeconomics",
  },
  {
    text: "Equity Market",
    path: "/admin/equity-market",
    icon: "equity",
  },
  {
    text: "Resources",
    path: "/admin/resources",
    icon: "resources",
  },
  {
    text: "News",
    path: "/admin/news",
    icon: "news",
  },
  {
    text: "Report Archive",
    path: "/admin/report-archive",
    icon: "archive",
  },
  {
    text: "Customers",
    path: "/admin/customers",
    icon: "customer",
  },
  {
    text: "Transactions",
    path: "/admin/transactions",
    icon: "transactions",
  },
  {
    text: "Invoices",
    path: "/admin/invoices",
    // Reuses the transactions icon; drop an invoices.png in public/images and
    // change this to "invoices" for a distinct icon.
    icon: "transactions",
  },
  {
    text: "Loyalty",
    path: "/admin/loyalty",
    icon: "loyalty",
  },
  {
    text: "Analytics",
    path: "/admin/analytics",
    icon: "analytics",
  },
];

const AdminSidebar = () => {
  const [path, setPath] = useState("");

  const { pathname } = window.location;

  useEffect(() => setPath(pathname), [pathname]);

  return (
    <div className=" w-full max-w-[350px] ">
      <div className="bg-primaryBlue rounded-[30px] min-h-[900px] w-full pt-40 flex flex-col gap-10 px-10">
        {links.map((item, index) => (
          <Link
            to={item.path}
            key={index}
            className="flex gap-2 items-center text-white"
          >
            <span
            // className={`inline-flex w-3 h-3  rounded-full ${
            //   item.path === path ? "bg-secondaryBlue" : "bg-white"
            // }`}
            >
              <img
                src={`/images/${item.icon}.png`}
                alt={item.text}
                className="w-8"
              />
            </span>
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
