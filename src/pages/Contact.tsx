import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";
import React from "react";
import PageBanner from "../components/Layout/PageBanner";
import { Helmet } from "react-helmet-async";

const Contact = () => {
  return (
    <>
      {/* <Helmet>
        <title>contactdd</title>
        <meta name="description" content="test content" data-rh="true" />
        <link rel="canonical" href="/about" />
      </Helmet> */}

      <PageBanner text="CONTACT US" />

      <section className="px-6 xl:px-0">
        <div className="w-full max-w-[1222px] mt-[60px] mx-auto">
          <div className="relative">
            <img
              src="/images/contactbanner.png"
              alt="contactbanner"
              className="w-full"
            />
            <h2 className="absolute left-[30px] sm:left-[50px] md:left-[70px] lg:left-[85px] bottom-[20px] sm:bottom-[80px] md:bottom-[100px] lg:bottom-[131px] w-56 justify-start text-primaryBlue text-2xl md:text-4xl font-extrabold font-['Montserrat'] leading-[58px] tracking-tight">
              Contact Us
            </h2>
          </div>

          <div className="lg:-translate-y-20 w-full max-w-[1063px] my-10 lg:my-0 mx-auto flex flex-wrap justify-center lg:flex-nowrap gap-[50px]">
            <div
              style={{
                backgroundImage: "url(/images/whiteBg.svg)",
                backgroundRepeat: "no-repeat",
              }}
              className="w-full max-w-[480px] h-[320px] lg:h-[310px] flex flex-col justify-center items-center"
            >
              <span>
                <Phone size={50} />
              </span>
              <p className=" mt-3 mb-6 justify-start text-center text-primaryBlue text-lg md:text-xl lg:text-2xl font-bold font-['Montserrat'] leading-normal tracking-tight">
                +234 (1) 2716892, <br />
                +234 (1) 2718630
              </p>
              <span>
                <Mail size={50} />
              </span>
              <p className=" mt-2.5 justify-start text-primaryBlue text-lg md:text-xl lg:text-2xl font-bold font-['Montserrat'] leading-normal tracking-tight">
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
              <p className="lg:w-96 h-28 mt-3 px-3 text-center justify-start text-primaryBlue text-base md:text-xl font-bold font-['Montserrat'] leading-normal tracking-tight">
                Plot 8A, Elsie Femi Pearse Street, Off Adeola Odeku, Victoria
                Island Lagos P.O. Box 70823, Victoria Island, Lagos, Nigeria.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-[52px] justify-center flex gap-5 w-full max-w-max mx-auto">
          <div className="relative h-full">
            <img src="/images/woman.png" alt="woman" className="h-full" />
            <div className="absolute top-0 left-0 w-full h-full bg-[#15bffd72] rounded-[30px]"></div>
          </div>

          <div
            className="flex flex-col gap-10 justify-between py-10 px-[54px] w-full max-w-[50%] rounded-[20px] h-max"
            style={{
              backgroundImage: `url(/images/onlinecontact.png)`,
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
              backgroundPosition: "20% 0%",
            }}
          >
            <p className="max-w-[356px] h-[78px] text-[#f8f8f8] text-lg font-medium font-light font-['Inter'] leading-relaxed">
              Fill out our online contact form, and our team will respond within
              24 hours.
            </p>

            <div className="w-[100%]  bg-[#D9D5D5] py-8 px-[34px] rounded-[30px] flex flex-col gap-2.5 ">
              <input
                type="text"
                name="name"
                id="name"
                className="bg-white p-[15px]"
                placeholder="Your Name"
              />
              <input
                type="email"
                name="email"
                id="email"
                className="bg-white p-[15px]"
                placeholder="Your Email"
              />
              <input
                type="text"
                name="ssubject"
                id="subject"
                className="bg-white p-[15px]"
                placeholder="Subject"
              />
              <textarea
                name=""
                id=""
                className="h-[200px] p-[15px]"
                placeholder="Message"
              ></textarea>

              <button className="mt-[14px] w-[120px] h-14 relative rounded-[35px] bg-primaryBlue ">
                <p className="left-[18px] top-[18px] absolute text-white text-base font-normal font-['Sans'] leading-tight tracking-tight">
                  Send
                </p>
                <div className="w-[42px] h-[42px] left-[71px] top-[7px] absolute">
                  <div className="w-[42px] h-[42px] left-0 top-0 absolute flex justify-center items-center bg-[#fefdff] rounded-full">
                    <span className="text-primaryBlue text-[30px]">
                      <ArrowRight />
                    </span>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
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
