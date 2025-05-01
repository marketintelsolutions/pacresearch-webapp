import React from "react";

const ServiceItem = () => {
  return (
    <div className="relative w-full max-w-[1100px] mx-auto flex items-center gap-[100px]">
      <div className="relative w-full p-[15px] max-w-[513px]">
        <div className="w-full h-full rounded-[24px] p-[6px] absolute top-0 left-0 bg-gradient-to-r from-[#15BFFD] via-[#15BFFD00] to-[#eef5fe]">
          <div className="h-full w-full bg-[#eef5fe] rounded-[20px]"></div>
        </div>
        <div
          style={{
            backgroundImage: "url(/images/servicebg.svg)",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
          }}
          className="relative z-[2] w-full h-[427px] flex items-center justify-center"
        >
          <div className="w-full">
            <img
              src="/images/serviceeclipse.svg"
              alt="serviceeclipse"
              className="w-full"
            />
          </div>
          <div className="w-full absolute h-full flex justify-center items-center">
            <img
              src="/images/strategic.svg"
              alt="strategic"
              className="w-full max-w-[330px]"
            />
          </div>
        </div>
      </div>
      <div className="w-full max-w-[541px] flex flex-col gap-6">
        <h2 className="self-stretch justify-start text-PAC-Blue text-4xl font-bold font-['Inter'] leading-[42px]">
          Strategic Research and Advisory
        </h2>
        <p className="self-stretch text-justify justify-start text-PAC-Blue text-base font-medium font-['Inter'] leading-[26px] tracking-tight">
          With a focus on long-term success, we provide in-depth strategic
          research and advisory services. From market entry strategies to policy
          impact assessments, our team delivers actionable recommendations
          backed by thorough research and analysis. Our advisory services are
          designed to help organizations stay ahead in a rapidly changing
          environment <br />
        </p>
        <button className="px-5 py-3 w-fit bg-[#15bffd] rounded-[30px] outline outline-1 outline-offset-[-1px] outline-[#15bffd] inline-flex justify-center items-center gap-2.5">
          <span className="text-center justify-start text-white text-base font-medium font-['Inter'] leading-normal">
            Get Started
          </span>
        </button>
      </div>
    </div>
  );
};

export default ServiceItem;
