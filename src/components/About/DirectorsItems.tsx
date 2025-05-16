import React, { useState, useEffect } from "react";
import { directorsData } from "../../utils/data";
import { Link } from "react-router-dom";

const DirectorsItems = () => {
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on a small screen on mount and when window resizes
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768); // 768px is typical md breakpoint
    };

    // Check on mount
    checkScreenSize();

    // Add resize listener
    window.addEventListener("resize", checkScreenSize);

    // Clean up
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return (
    <div
      style={
        !isMobile
          ? { translate: `${((directorsData.length - 1) * 40) / 2}px 0px` }
          : {}
      }
      className={`flex flex-wrap lg:flex-nowrap  justify-center items-center`}
    >
      {directorsData.map((item, index) => (
        <Link
          to={`/about/director/${item.name}`}
          key={index}
          style={!isMobile ? { translate: `-${index * 40}px 0px` } : {}}
          className={`min-w-[259px] mt-12`}
        >
          <img
            src={`/images/${item.image}.png`}
            alt={item.name}
            className="relative z-[2] w-full object-cover"
          />
          <div className="h-[106px] w-full justify-center rounded-tr-[30px] rounded-bl-[30px] bg-gradient-to-br from-[#8EC2F2] to-[#15284A] flex flex-col px-[35px] -translate-y-[42px]">
            <div className="">
              <span className="text-white text-xl font-bold font-['Inter'] capitalize leading-snug">
                {item.role} <br />
              </span>
              <span className="text-white text-xl font-normal font-['Inter'] capitalize leading-snug">
                {item.name}{" "}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default DirectorsItems;
