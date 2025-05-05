import { Mail, MapPin, Phone } from "lucide-react";
import React from "react";
import PageBanner from "../components/Layout/PageBanner";

const Contact = () => {
  return (
    <>
      <PageBanner text="CONTACT US" />

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
        {/* <div className="w-full  bg-primaryBlue py-10 mx-auto">
          <img
            src="/images/map.png"
            alt="map"
            className="w-full max-w-[1341px] mx-auto"
          />
        </div> */}
        <div className="w-full mb-32">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.7037020698344!2d3.409201775240221!3d6.432094793559022!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b8ad0e16842f3%3A0x3d9a06e8b5a2c72a!2s8A%20Elsie%20Femi%20Pearse%20St%2C%20Victoria%20Island%2C%20Lagos%20106104%2C%20Lagos!5e0!3m2!1sen!2sng!4v1746313983366!5m2!1sen!2sng"
            width="100%"
            height="450"
            style={{ border: 0 }}
            loading="lazy"
          ></iframe>
        </div>
      </section>
    </>
  );
};

export default Contact;
