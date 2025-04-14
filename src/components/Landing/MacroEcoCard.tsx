import React from "react";

const MacroEcoCard = () => {
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
          <img src="/images/money.svg" alt="money" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="w-24 h-6 justify-start text-white text-base font-medium font-['Jost']">
            Inflation Rate{" "}
          </p>
          <p className="justify-start text-secondaryBlue text-base font-normal font-['Jost']">
            JANUARY 2025
          </p>
        </div>
      </div>
      <p className="text-right justify-start text-red-500 text-base font-medium font-['Jost']">
        20%
      </p>
    </div>
  );
};

export default MacroEcoCard;
