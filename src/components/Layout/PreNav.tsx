import React from "react";
import {
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Twitter,
} from "lucide-react";

const PreNav = () => {
  return (
    <div className="zr:hidden md:flex w-full max-w-max mx-auto px-6 xl:px-0 pt-[35px] flex justify-between">
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
        <div className="flex gap-2.5 items-center">
          <span className=" text-primaryBlue ">
            <MapPin size={20} />
          </span>
          <p className="max-w-96 justify-start text-PAC-Blue text-xs font-semibold font-['Montserrat'] leading-none tracking-tight">
            Plot 8A, Elsie Femi Pearse Street, Off Adeola Odeku, Victoria Island
            Lagos P.O. Box 70823, Victoria Island, Lagos, Nigeria.
          </p>
        </div>
      </div>
      <div className="zr:hidden lg:flex  gap-[22px] text-[#15BFFD]">
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
  );
};

export default PreNav;
