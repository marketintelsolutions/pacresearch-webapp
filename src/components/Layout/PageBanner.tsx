import React from "react";

const PageBanner: React.FC<{ text: string }> = ({ text }) => {
  return (
    <div className="h-[170px] relative z-[2] ">
      <div
        style={{
          backgroundImage: `url(/images/smallbannerbg.svg)`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
        className=" w-full h-[298px] relative max-w-max mx-auto flex -translate-y-32 pb-[54px] flex-col gap-1 justify-end items-center "
      >
        <h1 className="h-[53px]  text-[#A4A4A4] text-xl font-medium font-['Inter'] capitalize leading-[60px] tracking-[14.80px]">
          {text}
        </h1>
        <span>
          <img src="/images/downgrey.svg" alt="downgrey" />
        </span>
      </div>
    </div>
  );
};

export default PageBanner;
