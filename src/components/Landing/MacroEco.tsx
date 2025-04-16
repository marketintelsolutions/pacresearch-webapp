import React from "react";
import MacroEcoCard from "./MacroEcoCard";
import EquityMarket from "./EquityMarket";

const MacroEco = () => {
  return (
    <section className="mt-[94px] w-full max-w-[1110px] mx-auto">
      <h2 className="self-stretch justify-start text-PAC-Blue text-2xl font-semibold font-['Jost']">
        MACROECONOMICS{" "}
      </h2>
      <div className="mt-5 flex justify-between">
        <MacroEcoCard />
        <MacroEcoCard />
        <MacroEcoCard />
      </div>
      <div className="flex justify-end w-full pb-2.5 border-b border-secondaryBlue mt-[45px] mb-[27px]">
        <p className="w-40 h-5 justify-start">
          <span className="text-cyan-400 text-sm font-normal font-['Jost']">
            Exchange Rate{" "}
          </span>
          <span className="text-PAC-Blue text-sm font-normal font-['Jost']">
            {" "}
            N1567/$
          </span>
        </p>
      </div>

      <EquityMarket />
    </section>
  );
};

export default MacroEco;
