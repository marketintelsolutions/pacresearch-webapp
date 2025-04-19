import React from "react";
import { directorsData } from "../utils/data";
import DirectorsSummary from "../components/About/Directors";
import DirectorsItems from "../components/About/DirectorsItems";

const Directors = () => {
  return (
    <section className="w-full max-w-max mx-auto mt-[72px]">
      <h1 className="w-[1200px] text-center justify-start">
        <span className="text-primaryBlue text-3xl font-bold font-['Inter'] capitalize leading-10">
          OUR BOARD
        </span>
        <span className="text-primaryBlue text-3xl font-normal font-['Inter'] capitalize leading-10">
          {" "}
          OF DIRECTORS
        </span>
      </h1>
      <div className="flex flex-col gap-10 mt-[32px]">
        {directorsData.map((item, index) => (
          <div
            key={index}
            className="bg-[#FFFFFFE8] py-[76px] px-[90px] rounded-[30px] flex gap-11"
          >
            <div className="w-full max-w-[384px]">
              <div className="w-full">
                <img
                  src={`/images/${item.iamgeBig}.png`}
                  alt={item.name}
                  className="w-full"
                />
              </div>
              <div className="w-52 justify-start mt-[30px]">
                <span className="text-PAC-Blue text-3xl font-bold font-['Inter'] capitalize leading-10">
                  {item.role} <br />
                </span>
                <span className="text-PAC-Blue text-3xl font-normal font-['Inter'] capitalize leading-10">
                  {item.name}{" "}
                </span>
              </div>
            </div>
            <div className="w-full flex flex-col gap-5">
              {item.desc.map((item, index) => (
                <p
                  key={index}
                  className="w-[577px] text-justify justify-start text-PAC-Blue text-base font-medium font-['Inter'] leading-relaxed tracking-tight"
                >
                  {item}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
      <DirectorsItems />
    </section>
  );
};

export default Directors;
