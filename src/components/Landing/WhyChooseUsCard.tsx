import React from "react";

interface WhyChooseUsCardProps {
  icon: string;
  text: string;
  right: boolean;
  isActive?: boolean;
}

const WhyChooseUsCard: React.FC<WhyChooseUsCardProps> = ({
  icon,
  text,
  right,
  isActive = false,
}) => {
  return (
    <div
      className={`relative w-full xl:max-w-[520px] rounded-[12px] py-[5px] px-[5px] transition-all duration-500 ${
        isActive ? " shadow-lg" : ""
      }`}
    >
      <div
        className={`zr:hidden xl:flex absolute h-full items-center ${
          right ? "-left-[92px]" : "-right-[92px]"
        }`}
      >
        <div className="relative">
          <div
            className={`absolute w-[64px] h-6 flex items-center ${
              right ? "-right-16" : "-left-16"
            } `}
          >
            <img
              src={`/images/${right ? "rightdasharrow" : "leftdasharrow"}.svg`}
              alt="leftdasharrow"
            />
          </div>
          <span
            className={`inline-flex rounded-full h-6 w-6 transition-all duration-500 ${
              isActive ? "bg-primaryBlue" : "bg-secondaryBlue"
            }`}
          ></span>
        </div>
      </div>
      <div
        className={`absolute top-0 rounded-[12px] bg-gradient-to-r via-[#15BFFD] w-[180px] h-full transition-all duration-500 ${
          right
            ? "left-0 from-[#0467C3] to-[#eef5fe]"
            : "right-0 from-[#eef5fe] to-[#0467C3]"
        } ${isActive ? "opacity-100" : "opacity-80"}`}
      ></div>
      <div
        className={`relative z-[1] p-3 rounded-[10px] bg-[#eef5fe] w-full h-full transition-all duration-500 ${
          isActive ? "bg-opacity-100" : "bg-opacity-90"
        }`}
      >
        <div
          className={`rounded-[8px] border p-6 h-full flex flex-col gap-4 transition-all duration-500 ${
            isActive ? "border-primaryBlue border-2" : "border-[#15BFFD]"
          }`}
        >
          <div className={`transition-all duration-500 ${isActive ? "" : ""}`}>
            <img src={`/images/${icon}.svg`} alt={icon} />
          </div>
          <p className="self-stretch text-justify justify-start text-PAC-Blue text-base font-medium font-['Inter'] leading-snug tracking-tight">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
};

export default WhyChooseUsCard;
