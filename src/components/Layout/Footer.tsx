import {
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Twitter,
} from "lucide-react";
import React, { ReactElement } from "react";
import { Link } from "react-router-dom";

interface FooterItem {
  heading: string;
  links: {
    text: string;
    path: string;
    icon: ReactElement | null;
  }[];
}

const footerData: FooterItem[] = [
  {
    heading: "Quick Links",
    links: [
      {
        text: "About Us",
        path: "/about",
        icon: null,
      },
      {
        text: "Services",
        path: "/services",
        icon: null,
      },
      {
        text: "Contact",
        path: "/contact",
        icon: null,
      },
    ],
  },
  {
    heading: "Resources",
    links: [
      {
        text: "Resources",
        path: "/resources",
        icon: null,
      },
      {
        text: "News",
        path: "#",
        icon: null,
      },
    ],
  },
  {
    heading: "Get In Touch",
    links: [
      {
        text: "+234 (1) 2716892, +234 (1) 2718630",
        icon: <Phone />,
        path: "",
      },
      {
        text: "info@pacresearch.org",
        icon: <Mail />,
        path: "",
      },
      {
        text:
          "Plot 8A, Elsie Femi Pearse Street, Off Adeola Odeku, Victoria Island Lagos P.O. Box 70823, Victoria Island, Lagos, Nigeria.",
        icon: <MapPin />,
        path: "",
      },
    ],
  },
];

const Footer = () => {
  return (
    <>
      <footer className="relative z-[10] w-full max-w-max mx-auto px-6 xl:px-0 bg-primaryBlue rounded-[30px] pt-[113px] pb-[115px] mt-10">
        <div className="w-full max-w-[1050px] mx-auto flex flex-wrap md:flex-nowrap gap-10 md:gap-20 lg:gap-40">
          <div>
            <img src="/logowhite.svg" alt="logowhite" />
          </div>
          <div className="w-full lg:max-w-[65%] flex flex-wrap md:flex-nowrap gap-10 justify-between">
            {footerData.map((item, index) => (
              <div key={index} className="flex flex-col gap-5">
                <h3 className="justify-start text-secondaryBlue text-base font-bold font-['Montserrat'] leading-normal tracking-tight">
                  {item.heading}
                </h3>
                <div className="flex flex-col gap-2.5">
                  {item.links.map((item, index) => {
                    if (item.icon) {
                      return (
                        <div className="flex gap-2.5 text-white">
                          <span>{item.icon}</span>
                          <span className="w-full max-w-[316px] h-7 justify-start  text-sm font-semibold font-['Montserrat'] leading-normal tracking-tight">
                            {item.text}
                          </span>
                        </div>
                      );
                    }
                    return (
                      <Link
                        key={index}
                        to={item.path}
                        className="justify-start text-white text-sm font-semibold font-['Montserrat'] underline leading-normal tracking-tight"
                      >
                        {item.text}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </footer>
      <div className="relative z-[11] bg-[#A4A4A4] flex justify-between w-full max-w-[1050px] mx-auto -translate-y-[50%] py-[25px] px-[45px] rounded-[30px]">
        <p className="justify-start text-white text-sm font-semibold font-['Montserrat'] leading-normal tracking-tight">
          © PAC Research Nigeria Copyright 2025
        </p>
        <div className="flex gap-[22px] text-[#FFFFFF]">
          {/* <span>
            <Facebook size={20} />
          </span> */}
          <a target="_blank" href="https://www.instagram.com/pacresearchorg/">
            <Instagram size={20} />
          </a>
          <a
            href="https://www.linkedin.com/company/pac-research-org/"
            target="_blank"
          >
            <Linkedin size={20} />
          </a>
        </div>
      </div>
    </>
  );
};

export default Footer;
