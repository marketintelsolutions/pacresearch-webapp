import React, { useState, useEffect } from "react";
import FgnCard from "./FgnCard";

import { ArrowDown } from "lucide-react";
import EquityMarketTable from "./EquityMarketTable";

const EquityMarket: React.FC = () => {
  return (
    <div className="relative flex gap-[36px]">
      <div className="absolute -bottom-[290px] -left-[61px]">
        <img src="/images/semieclipse.svg" alt="semieclipse" />
      </div>
      <div className="w-full max-w-64">
        <div className="w-64 h-11 px-9 py-3 bg-white rounded-3xl shadow-[2.9px_2.9px_13.3px_-1.4px_rgba(231,228,232,0.80)] border-Color-blue inline-flex justify-start items-center gap-2">
          <span className="justify-start text-primaryBlue text-xs font-normal font-['Jost']">
            All Share Index (ASI){" "}
          </span>
        </div>
        <div className="flex justify-between mt-2.5">
          <span className="w-24 h-6 justify-start text-primaryBlue text-sm font-normal font-['Jost']">
            17232894.00{" "}
          </span>
          <div className="flex items-center gap-1">
            <span>
              <ArrowDown size={16} color="#ef4444" />
            </span>
            <span className="w-9 h-6 justify-start text-red-500 text-sm font-normal font-['Jost']">
              -1.23
            </span>
          </div>
          <span className="w-20 h-6 justify-start text-primaryBlue text-sm font-normal font-['Jost']">
            20 Mar 25
          </span>
        </div>
        <h2 className="self-stretch justify-start mt-[35px] text-primaryBlue text-2xl font-semibold font-['Jost'] leading-normal">
          FIXED INCOME MARKET
        </h2>
        <FgnCard />
        <FgnCard />
      </div>
      <EquityMarketTable />
    </div>
  );
};

export default EquityMarket;
