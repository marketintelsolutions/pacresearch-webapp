import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Archive,
  Instagram,
  Linkedin,
  LogIn,
  LogOut,
  Mail,
  Phone,
  UserRound,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { logoutCustomer } from "../../store/customerAuthSlice";

const PreNav = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, authReady } = useAppSelector((state) => ({
    user: state.customerAuth.user,
    authReady: state.customerAuth.authReady,
  }));

  // Report Archive section = the catalogue/details/checkout pages and the
  // customer account/viewer pages.
  const onReportArchive =
    pathname.startsWith("/report-archive") || pathname.startsWith("/account");

  // Resolve the button's mode. Before auth resolves, show a safe public link.
  const mode: "login" | "logout" | "archive" = !authReady
    ? "archive"
    : !user
    ? "login"
    : onReportArchive
    ? "logout"
    : "archive";

  const handleClick = () => {
    if (mode === "login") {
      navigate("/account/login");
    } else if (mode === "logout") {
      dispatch(logoutCustomer()).finally(() => navigate("/report-archive"));
    } else {
      navigate("/report-archive");
    }
  };

  const button = {
    login: { label: "Login", icon: <LogIn size={15} /> },
    logout: { label: "Log out", icon: <LogOut size={15} /> },
    archive: { label: "Report Archive", icon: <Archive size={15} /> },
  }[mode];

  return (
    <div className="relative z-[4] zr:hidden md:flex w-full max-w-max mx-auto px-6 xl:px-0 pt-[35px] flex justify-between">
      <div className="flex flex-wrap gap-[50px]">
        <div className="flex gap-2.5 items-center">
          <span className=" text-primaryBlue">
            <Phone size={20} />
          </span>
          <p className=" justify-start text-primaryBlue text-xs font-semibold font-['Montserrat'] leading-normal tracking-tight">
            +234 (1) 2716892, +234 (1) 2718630
          </p>
        </div>
        <div className="flex gap-2.5 items-center">
          <span className=" text-primaryBlue ">
            <Mail size={20} />
          </span>
          <p className=" justify-start text-primaryBlue text-xs font-semibold font-['Montserrat'] leading-normal tracking-tight">
            info@pacresearch.org
          </p>
        </div>
        {/* <div className="flex gap-2.5 items-center">
          <span className=" text-primaryBlue ">
            <MapPin size={20} />
          </span>
          <p className="max-w-96 justify-start text-primaryBlue text-xs font-semibold font-['Montserrat'] leading-none tracking-tight">
            Plot 8A, Elsie Femi Pearse Street, Off Adeola Odeku, Victoria Island
            Lagos P.O. Box 70823, Victoria Island, Lagos, Nigeria.
          </p>
        </div> */}
      </div>
      <div className="flex items-center gap-6">
        <div className="zr:hidden lg:flex gap-[22px] text-[#15BFFD]">
          <a
            target="_blank"
            rel="noreferrer"
            href="https://www.instagram.com/pacresearchorg/"
          >
            <Instagram size={20} />
          </a>
          <a
            href="https://www.linkedin.com/company/pac-research-org/"
            target="_blank"
            rel="noreferrer"
          >
            <Linkedin size={20} />
          </a>
        </div>
        <div className="flex items-center gap-2">
          {mode === "logout" && (
            <button
              onClick={() => navigate("/account/profile")}
              title="My profile"
              aria-label="My profile"
              className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-primaryBlue text-primaryBlue hover:bg-primaryBlue hover:text-white transition"
            >
              <UserRound size={16} />
            </button>
          )}
          <button
            onClick={handleClick}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold font-['Montserrat'] whitespace-nowrap transition ${
              mode === "logout"
                ? "border border-primaryBlue text-primaryBlue hover:bg-primaryBlue hover:text-white"
                : "bg-primaryBlue text-white hover:opacity-90"
            }`}
          >
            {button.icon}
            {button.label}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreNav;
