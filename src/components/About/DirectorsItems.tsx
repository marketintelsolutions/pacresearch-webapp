import React from "react";
import { directorsData } from "../../utils/data";

const DirectorsItems = () => {
  return (
    <div
      style={{ translate: `${((directorsData.length - 1) * 40) / 2}px 0px` }}
      className={`flex justify-center items-center `}
    >
      {directorsData.map((item, index) => (
        <div
          key={index}
          style={{ translate: `-${index * 40}px 0px` }}
          className={`  min-w-[259px] mt-12`}
        >
          <img
            src={`/images/${item.image}.png`}
            alt={item.name}
            className="relative z-[2] w-full object-cover"
          />
          <div
            className="h-[106px] w-full justify-center rounded-tr-[30px] rounded-bl-[30px] bg-gradient-to-br from-[#8EC2F2] to-[#15284A] flex flex-col px-[35px] -translate-y-[42px]"
            style={
              {
                // backgroundImage: "url(/images/bluegradient.png)",
                // backgroundSize: "contain",
                // backgroundRepeat: "no-repeat",
              }
            }
          >
            <div className="  ">
              <span className="text-white text-xl font-bold font-['Inter'] capitalize leading-snug">
                {item.role} <br />
              </span>
              <span className="text-white text-xl font-normal font-['Inter'] capitalize leading-snug">
                {item.name}{" "}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DirectorsItems;
