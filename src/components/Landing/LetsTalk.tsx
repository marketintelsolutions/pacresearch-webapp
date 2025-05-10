import { ArrowLeft, ArrowLeftIcon, ArrowRight } from "lucide-react";
import React, { useState } from "react";
import { BiLeftArrow, BiRightArrow } from "react-icons/bi";

const carousel = [
  {
    heading: "Empowering smarter decisions with cleaner data.",
    text:
      "We draw on cleaner and richer data to help our customers gain greater insight, fuel innovation and effectively navigate this time of unequalled change.",
    image: "caro1",
  },
  {
    heading: "PAC Research Analytics",
    text:
      "We deploy the latest analytical methods to identify patterns, trends, and insights that can help businesses make informed decisions and gain a competitive advantage.",
    image: "caro2",
  },
];

const LetsTalk = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className=" h-[649px] px-[101px] flex justify-between rounded-[30px] relative z-[2] bg-primaryBlue w-full max-w-max mx-auto mt-[163px]">
      <div className="flex flex-col justify-center h-full">
        <h1 className="w-[450px] justify-start text-white text-4xl font-bold font-['Montserrat'] leading-[48px] tracking-tight">
          {carousel[activeIndex].heading}
        </h1>
        <p className="w-[400px]  mt-[27px] justify-start text-white text-base font-medium font-['Jost'] leading-tight tracking-tight">
          {carousel[activeIndex].text}
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
            src={`/images/${carousel[activeIndex].image}.jpg`}
            alt="building"
            className="w-full z-[3] absolute top-0 left-0 object-cover rounded-[30px] h-full max-w-[390px]"
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
      <div className="absolute h-full right-12 top-0 flex flex-col justify-center items-center gap-20">
        <div className="flex flex-col gap-3">
          {Array.from({ length: carousel.length }, (_, index) => (
            <div
              className={`h-2 w-2  rounded-full ${
                index === activeIndex ? "bg-white" : "bg-[#FFFFFF33]"
              }`}
            ></div>
          ))}
        </div>
        <div className="border-dashed border h-[250px] w-[1px] border-[#FFFFFF33]"></div>
        <div className="flex flex-col gap-4">
          <button
            className={`p-2 rounded-full  ${
              activeIndex === 0 ? "bg-[#FFFFFF33]" : "bg-secondaryBlue"
            }`}
            onClick={() => {
              if (activeIndex === 0) {
                // setActiveIndex(carousel.length - 1);
                return;
              }
              setActiveIndex((prev) => prev - 1);
            }}
          >
            <ArrowLeft color="white" />
          </button>
          <button
            className={`p-2 rounded-full bg-secondaryBlue ${
              activeIndex === carousel.length - 1
                ? "bg-[#FFFFFF33]"
                : "bg-secondaryBlue"
            }`}
            onClick={() => {
              if (activeIndex === carousel.length - 1) {
                // setActiveIndex(0);
                return;
              }
              setActiveIndex((prev) => prev + 1);
            }}
          >
            <ArrowRight color="white" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default LetsTalk;
