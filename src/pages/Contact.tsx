import { Mail, MapPin, Phone } from "lucide-react";
import React from "react";

const Contact = () => {
  return (
    <section>
      <div className="w-full max-w-[1222px] mt-[60px] mx-auto">
        <div className="relative">
          <img
            src="/images/contactbanner.png"
            alt="contactbanner"
            className="w-full"
          />
          <h2 className="absolute left-[85px] bottom-[131px] w-56 justify-start text-PAC-Blue text-4xl font-extrabold font-['Montserrat'] leading-[58px] tracking-tight">
            Contact Us
          </h2>
        </div>

        <div className="-translate-y-20 w-full max-w-[1063px] mx-auto flex gap-[50px]">
          <div
            style={{
              backgroundImage: "url(/images/whiteBg.svg)",
              backgroundRepeat: "no-repeat",
            }}
            className="w-full max-w-[480px] h-[310px] flex flex-col justify-center items-center"
          >
            <span>
              <Phone size={50} />
            </span>
            <p className=" mt-3 mb-6 justify-start text-center text-PAC-Blue text-2xl font-bold font-['Montserrat'] leading-normal tracking-tight">
              +234 (1) 2716892, <br />
              +234 (1) 2718630
            </p>
            <span>
              <Mail size={50} />
            </span>
            <p className=" mt-2.5 justify-start text-PAC-Blue text-2xl font-bold font-['Montserrat'] leading-normal tracking-tight">
              info@pacresearch.org
            </p>
          </div>
          <div
            style={{
              backgroundImage: "url(/images/whiteBg.svg)",
              backgroundRepeat: "no-repeat",
            }}
            className="w-full max-w-[480px] h-[310px] flex flex-col justify-center items-center"
          >
            <span>
              <MapPin size={50} />
            </span>
            <p className="w-96 h-28 mt-3 text-center justify-start text-PAC-Blue text-xl font-bold font-['Montserrat'] leading-normal tracking-tight">
              Plot 8A, Elsie Femi Pearse Street, Off Adeola Odeku, Victoria
              Island Lagos P.O. Box 70823, Victoria Island, Lagos, Nigeria.
            </p>
          </div>
        </div>
      </div>
      <div className="w-full  bg-primaryBlue py-10 mx-auto">
        <img
          src="/images/map.png"
          alt="map"
          className="w-full max-w-[1341px] mx-auto"
        />
      </div>
    </section>
  );
};

export default Contact;
