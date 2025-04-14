import React from "react";

const LetsTalk = () => {
  return (
    <section className=" h-[649px] px-[101px] flex justify-between rounded-[30px] relative z-[2] bg-primaryBlue w-full max-w-max mx-auto mt-[163px]">
      <div className="flex flex-col justify-center h-full">
        <h1 className="w-96 justify-start text-white text-4xl font-bold font-['Montserrat'] leading-[48px] tracking-tight">
          … intellectually curious, imaginative & analytical...{" "}
        </h1>
        <p className="w-80  mt-[27px] justify-start text-white text-base font-medium font-['Jost'] leading-tight tracking-tight">
          Partnering with You to Deliver Tailored Insights for Sustainable
          Market Success{" "}
        </p>
        <button className="w-44 mt-[70px] px-10 py-3.5 bg-sky-500 rounded-[5px] inline-flex flex-col justify-start items-center gap-2.5 overflow-hidden">
          <span className="text-center justify-start text-white text-sm font-bold font-['Montserrat'] underline leading-snug tracking-tight">
            LETS’S TALK
          </span>
        </button>
      </div>
      <div className=" py-[40px] relative w-full max-w-[46%]">
        <div className="relative  h-full">
          <img
            src="/images/building.png"
            alt="building"
            className="w-full z-[3] absolute top-0 left-0 max-w-[390px]"
          />
          <img
            src="/images/darklay.png"
            alt="building"
            className="w-full absolute top-5 left-5 max-w-[390px]"
          />
          <img
            src="/images/darklay.png"
            alt="building"
            className="w-full absolute top-10 left-10 max-w-[390px]"
          />
          <img
            src="/images/darklay.png"
            alt="building"
            className="w-full absolute top-[60px] left-[60px] max-w-[390px]"
          />
        </div>
        <div>
          <img
            src="/images/man.png"
            alt="building"
            className="w-full max-w-[412px] absolute z-[4] bottom-0 right-0"
          />
        </div>
      </div>
    </section>
  );
};

export default LetsTalk;
