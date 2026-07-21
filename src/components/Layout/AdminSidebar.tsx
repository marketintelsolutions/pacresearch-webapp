import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { LogOut } from "lucide-react";
import { auth } from "../../firebase/firebaseConfig";
import { useAppSelector } from "../../hooks/redux";

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
  const navigate = useNavigate();
  const email = useAppSelector((state) => state.customerAuth.user?.email);

  const { pathname } = window.location;

  useEffect(() => setPath(pathname), [pathname]);

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("user");
    localStorage.removeItem("isAuth");
    navigate("/admin/login", { replace: true });
  };

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

        {/* Signed-in admin + logout */}
        <div className="mt-auto pt-6 pb-10 border-t border-white/10">
          {email && (
            <p className="text-white/50 text-xs mb-3 truncate" title={email}>
              {email}
            </p>
          )}
          <button
            onClick={handleLogout}
            className="flex gap-2 items-center text-white/80 hover:text-white transition"
          >
            <LogOut size={18} />
            <span className="font-semibold text-lg">Log out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
