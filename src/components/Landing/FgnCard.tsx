import React from "react";

const FgnCard = () => {
  return (
    <div
      style={{
        backgroundImage: "url(/images/fgnbg.png)",
        backgroundRepeat: "no-repeat",
      }}
      className="h-[169px] w-[211px] mt-5"
    >
      <h3 className="pt-2 text-center justify-start text-black/70 text-base font-bold font-['Jost']">
        FGN BONDS{" "}
      </h3>
      <div className="flex gap-3 mt-[31px] justify-center">
        <div className=" justify-start text-white text-base font-semibold font-['Jost'] leading-7">
          91-DAY - <br />
          182-DAY - <br />
          364-DAY -{" "}
        </div>
        <div className=" justify-start text-white text-base font-semibold font-['Jost'] leading-7">
          12.34
          <br />
          12.34
          <br />
          12.34
        </div>
      </div>
    </div>
  );
};

export default FgnCard;
