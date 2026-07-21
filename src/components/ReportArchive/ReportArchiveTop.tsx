import React from "react";

const ReportArchiveTop = () => {
  return (
    <section
      style={{
        backgroundImage: "url(/images/resourcebannerbg.svg)",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
      className="w-full max-w-max h-[320px] mx-auto mt-[60px] py-[56px] px-[48px] flex items-center gap-[36px]"
    >
      <div
        style={{
          backgroundImage: "url(/images/whitecurvedbg.svg)",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
        className="relative zr:hidden md:flex min-w-[210px] h-[190px] flex flex-col justify-end pb-[46px]"
      >
        <div className="absolute top-0 left-0 w-full flex justify-center">
          <div className="py-[20px] px-[18px] rounded-full bg-[#D9D9D9] w-fit -translate-y-[20px]">
            <img src="/images/wallet.svg" alt="wallet" className="max-w-[26px]" />
          </div>
        </div>
        <div className="flex justify-between px-3">
          <span className="inline-flex p-3 bg-primaryBlue rounded-full">
            <img src="/images/pdf.svg" alt="pdf" className="max-w-[24px]" />
          </span>
          <span className="inline-flex p-3 bg-primaryBlue rounded-full">
            <img src="/images/file.svg" alt="report" className="max-w-[24px]" />
          </span>
          <span className="inline-flex p-3 bg-primaryBlue rounded-full">
            <img
              src="/images/wallet.svg"
              alt="purchase"
              className="max-w-[24px]"
            />
          </span>
        </div>
      </div>
      <div>
        <h2 className="text-[28px] sm:text-[34px] lg:text-[42px] lg:leading-[52px] text-white font-bold">
          PAC Research Report Archive
        </h2>
        <p className="mt-3 max-w-[440px] text-white/80 text-sm sm:text-base font-['Inter']">
          Purchase and securely read our premium research reports online.
        </p>
      </div>
    </section>
  );
};

export default ReportArchiveTop;
