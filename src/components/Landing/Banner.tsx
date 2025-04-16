import React from "react";

const Banner = () => {
  return (
    <div
      style={{
        backgroundImage: `url(/images/bannerbg.svg)`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
      className="w-full h-[670px]  max-w-max mx-auto flex -translate-y-32 "
    >
      <div className="w-full max-w-[575px] h-full  flex items-end">
        <div className="w-full max-w-[575px] -translate-x-[77px] translate-y-[194px]">
          <img
            src="/images/bannerimage.svg"
            alt="bannerimage"
            className="w-full h-full"
          />
        </div>
      </div>
      <div className="h-full mt-[209px] flex flex-col gap-[35px]">
        <h1 className="self-stretch justify-start text-white text-5xl font-extrabold font-['Montserrat'] leading-[58px] tracking-tight">
          Deliver Thorough And Impactful Services
        </h1>
        <p className="justify-start text-white text-xl font-medium font-['Montserrat'] leading-loose tracking-tight">
          Deep understanding of industries across economies <br />
          and leading through on diverse subjects.
        </p>
        <button className="border border-[#FFFFFF] rounded-full w-fit py-[15px] px-[36px]">
          <div className="text-center justify-start text-white text-sm font-bold font-['Montserrat'] leading-snug tracking-tight">
            Learn More
          </div>
        </button>
      </div>
    </div>
  );
};

export default Banner;
