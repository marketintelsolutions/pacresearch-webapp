import React from "react";

const ReportArchiveTop = () => {
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
          <div className="py-[29px] px-[26px] rounded-full bg-[#D9D9D9] w-fit -translate-y-[29px]">
            <img src="/images/wallet.svg" alt="wallet" />
          </div>
        </div>
        <div className="flex justify-between px-4">
          <span className="inline-flex p-5 bg-primaryBlue rounded-full">
            <img src="/images/pdf.svg" alt="pdf" className="max-w-[40px]" />
          </span>
          <span className="inline-flex p-5 bg-primaryBlue rounded-full">
            <img src="/images/file.svg" alt="report" className="max-w-[40px]" />
          </span>
          <span className="inline-flex p-5 bg-primaryBlue rounded-full">
            <img src="/images/wallet.svg" alt="purchase" className="max-w-[40px]" />
          </span>
        </div>
      </div>
      <div>
        <h2 className="text-[46px] sm:text-[60px] lg:text-[72px] lg:leading-[96px] text-white font-bold">
          PAC Research Report Archive
        </h2>
        <p className="mt-4 max-w-[520px] text-white/80 text-base sm:text-lg font-['Inter']">
          Purchase and securely read our premium research reports online.
        </p>
      </div>
    </section>
  );
};

export default ReportArchiveTop;
