import React from "react";
import { Link } from "react-router-dom";

const ServiceItem: React.FC<{
  heading: string;
  text: string;
  image: string;
  index: number;
}> = ({ heading, text, image, index }) => {
  return (
    <div
      className={`relative z-[2] w-full  mx-auto  flex flex-wrap lg:flex-nowrap justify-center items-center gap-10 md:gap-[70px] ${
        index % 2 === 0 ? "flex-row" : "flex-row-reverse"
      }`}
    >
      <div className="relative w-full p-[10px]  max-w-[453px]">
        <div
          className={`w-full h-full rounded-[24px] p-[6px] absolute top-0 left-0 via-[#15BFFD00] bg-gradient-to-r  ${
            index % 2 === 0
              ? "from-[#15BFFD]  to-[#eef5fe] "
              : "from-[#eef5fe] to-[#15BFFD]"
          }`}
        >
          <div className="h-full w-full bg-[#eef5fe] rounded-[20px]"></div>
        </div>
        <div
          style={{
            backgroundImage: "url(/images/servicebg.svg)",
            backgroundRepeat: "no-repeat",
          }}
          className="relative z-[2] w-full md:h-[387px] bg-contain md:bg-cover flex items-center justify-center"
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
              src={`/images/${image}.png`}
              alt={image}
              className="w-full max-w-[200px] md:max-w-[300px]"
            />
          </div>
        </div>
      </div>
      <div className="w-full max-w-[541px] flex flex-col gap-5 md:gap-6">
        <h2 className="self-stretch justify-start text-PAC-Blue text-2xl md:text-4xl font-bold font-['Inter'] md:leading-[42px]">
          {heading}
        </h2>
        <p className="self-stretch text-justify justify-start text-PAC-Blue text-sm md:text-base font-medium font-['Inter'] md:leading-[26px] tracking-tight">
          {text}
        </p>
        <Link
          to={"/contact"}
          className="px-5 py-3 w-fit border border-[#15bffd] bg-[#15bffd] text-white hover:bg-white hover:text-[#15bffd] rounded-[30px] outline outline-1 outline-offset-[-1px] outline-[#15bffd] inline-flex justify-center items-center gap-2.5"
        >
          <span className="text-center justify-start text-base font-medium font-['Inter'] leading-normal">
            Get Started
          </span>
        </Link>
      </div>
    </div>
  );
};

export default ServiceItem;
