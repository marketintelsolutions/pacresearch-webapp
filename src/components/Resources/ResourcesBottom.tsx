import React from "react";

const ResourcesBottom = () => {
  return (
    <section className="w-full max-w-max mx-auto mt-[60px] flex gap-[25px] ">
      <div className="flex flex-col gap-[25px]  w-full max-w-[384px]">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            style={{
              backgroundImage: "url(/images/bluecutbg.svg)",
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
            }}
            className="flex  items-center justify-between w-full max-w-[384px] h-[94px] pl-[25px] pr-[50px] py-[19px]"
          >
            <div className="flex items-center gap-4">
              <div className="p-[15px] bg-[#15BFFD] rounded-full">
                <img src="/images/uploadwhite.svg" alt="upload" />
              </div>
              <p className=" justify-start text-white text-base font-bold font-['Inter'] leading-normal">
                PRICELIST
              </p>
            </div>
            <p className="text-center justify-start text-secondaryBlue text-xl font-medium font-['Inter'] underline leading-loose">
              view
            </p>
          </div>
        ))}
        <div className="w-40 self-end h-12 px-8 py-6 bg-[#15284A] rounded-3xl outline outline-1 outline-offset-[-1px] outline-[#15284A] inline-flex justify-center items-center">
          <span className="text-center justify-center text-white text-sm font-normal font-['Inter']">
            View All Files
          </span>
        </div>
      </div>

      <div
        style={{
          backgroundImage: "url(/images/whitecutbg.svg)",
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
        }}
        className="relative w-full py-[77px] px-[31px] max-w-[801px] h-[680px] mt-[48px] "
      >
        <div
          style={{
            backgroundImage: "url(/images/bluecutbg.svg)",
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
          }}
          className="absolute left-9 -top-12 flex items-center justify-between w-full max-w-[384px] h-[94px] pl-[25px] pr-[50px] py-[19px]"
        >
          <div className="flex items-center gap-4">
            <div className="p-[15px] bg-[#15BFFD] rounded-full">
              <img src="/images/uploadwhite.svg" alt="upload" />
            </div>
            <p className=" justify-start text-white text-base font-bold font-['Inter'] leading-normal">
              PRICELIST
            </p>
          </div>
          <span>
            <img src="/images/downwhite.svg" alt="downwhite" />
          </span>
        </div>
        <div className="flex gap-[30px] items-center">
          <p className="justify-center text-color-black-solid text-sm font-normal font-['Inter'] capitalize">
            Total
          </p>
          <div className="px-2 py-1.5 bg-primaryBlue rounded-[3px] inline-flex justify-start items-start">
            <span className="justify-center text-white text-base font-normal font-['Inter'] capitalize">
              10
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-[25px] mt-[43px]">
          {Array.from({ length: 8 }, (_, index) => (
            <div
              key={index}
              style={{
                backgroundImage: "url(/images/filebg.svg)",
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
              }}
              className="py-4 px-[19px] w-full max-w-[354px] h-[96px] flex gap-[33px]"
            >
              <div className="p-[11.5px] bg-primaryBlue w-fit rounded-full">
                <img src="/images/pdf.svg" alt="pdf" />
              </div>
              <div className="flex flex-col gap-[18px] w-full max-w-[190px]">
                <h3 className="self-stretch justify-center text-PAC-Blue text-base font-bold font-['Inter'] capitalize">
                  Access_NG_H1_21.pdf
                </h3>
                <div className="flex justify-between">
                  <img src="/images/calendar.svg" alt="calendar" />
                  <span className="justify-center text-PAC-Blue text-sm font-normal font-['Inter']">
                    April 4th 2023
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ResourcesBottom;
