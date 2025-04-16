import {
  Facebook,
  Instagram,
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
        text: "Resources",
        path: "/resources",
        icon: null,
      },
      {
        text: "News",
        path: "/news",
        icon: null,
      },
    ],
  },
  {
    heading: "Resources",
    links: [
      {
        text: "Services",
        path: "/services",
        icon: null,
      },
      {
        text: "Resources",
        path: "/resources",
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
      <footer className="w-full max-w-max mx-auto bg-primaryBlue rounded-[30px] pt-[113px] pb-[115px] mt-10">
        <div className="w-full max-w-[1050px] mx-auto flex gap-40">
          <div>
            <img src="/logowhite.svg" alt="logowhite" />
          </div>
          <div className="w-full max-w-[65%] flex gap-10 justify-between">
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
      <div className="bg-[#FAFAFA] flex justify-between w-full max-w-[1050px] mx-auto -translate-y-[50%] py-[25px] px-[45px] rounded-[30px]">
        <p className="justify-start text-neutral-500 text-sm font-semibold font-['Montserrat'] leading-normal tracking-tight">
          © PAC Research Nigeria Copyright 2025
        </p>
        <div className="flex gap-[22px] text-[#23A6F0]">
          <span>
            <Facebook size={20} />
          </span>
          <span>
            <Instagram size={20} />
          </span>
          <span>
            <Twitter size={20} />
          </span>
        </div>
      </div>
    </>
  );
};

export default Footer;
