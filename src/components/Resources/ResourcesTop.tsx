import React from "react";

const ResourcesTop = () => {
  return (
    <section
      style={{
        backgroundImage: "url(/images/resourcebannerbg.svg)",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
      className="w-full max-w-max h-[474px] mx-auto mt-[60px] py-[94px] px-[66px] flex gap-[51px]"
    >
      <div
        style={{
          backgroundImage: "url(/images/whitecurvedbg.svg)",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
        className="relative zr:hidden md:flex min-w-[305px] h-[277px] flex flex-col justify-end pb-[70px]"
      >
        <div className="absolute top-0 left-0 w-full flex justify-center">
          <div className=" py-[29px] px-[26px] rounded-full bg-[#D9D9D9] w-fit -translate-y-[29px]">
            <img src="/images/wallet.svg" alt="wallet" />
          </div>
        </div>
        <div className="flex justify-between px-4">
          <span className="inline-flex p-5 bg-primaryBlue rounded-full">
            <img src="/images/pdf.svg" alt="pdf" className="max-w-[40px]" />
          </span>
          <span className="inline-flex p-5 bg-primaryBlue rounded-full">
            <img src="/images/word.svg" alt="pdf" className="max-w-[40px]" />
          </span>
          <span className="inline-flex p-5 bg-primaryBlue rounded-full">
            <img src="/images/excel.svg" alt="pdf" className="max-w-[40px]" />
          </span>
        </div>
        {/* <h3 className="w-full text-center justify-start text-primaryBlue text-base font-bold font-['Inter'] leading-normal">
          Total file
        </h3>
        <p className="text-center mt-[22px] justify-start text-secondaryBlue text-xl font-medium font-['Inter'] underline leading-loose">
          VIEW ALL FILES
        </p> */}
      </div>
      <div>
        <h2 className="text-[60px] sm:text-[70px] lg:text-[80px] lg:leading-[110px] text-white font-bold">
          PAC Research Resources
        </h2>
      </div>
      {/* <div className="w-full grid grid-cols-2 ">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="flex items-center justify-between w-full max-w-[306px]"
          >
            <div className="flex items-center gap-4">
              <div className="p-[15px] bg-[#15BFFD] rounded-full">
                <img src="/images/upload.svg" alt="upload" />
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
      </div> */}
    </section>
  );
};

export default ResourcesTop;
