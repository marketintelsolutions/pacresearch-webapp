import React from "react";

interface MacroEcoCardProps {
  title: string;
  date: string;
  percentage: number;
  iconSrc: string;
  isPositive?: boolean;
}

const MacroEcoCard: React.FC<MacroEcoCardProps> = ({
  title,
  date,
  percentage,
  iconSrc,
  isPositive = false,
}) => {
  return (
    <div
      style={{
        backgroundImage: "url(/images/macrobg.png)",
        backgroundRepeat: "no-repeat",
      }}
      className="p-[25px] h-[110px] flex justify-between items-center w-full max-w-[352px]"
    >
      <div className="flex gap-[17px]">
        <div className="bg-[#FFF5D9] rounded-full p-[14px] w-fit h-fit">
          <img src={iconSrc} alt={title.toLowerCase()} />
        </div>
        <div className="flex flex-col gap-1">
          <p className="h-6 68,147,196 justify-start text-white text-base font-medium font-['Jost']">
            {title}
          </p>
          <p className="justify-start text-secondaryBlue text-base font-normal font-['Jost']">
            {date.toUpperCase()}
          </p>
        </div>
      </div>
      <p
        className={`text-right justify-start ${
          percentage > 0 ? "text-green-500" : "text-red-500"
        } text-base font-medium font-['Jost']`}
      >
        {percentage}%
      </p>
    </div>
  );
};

export default MacroEcoCard;
