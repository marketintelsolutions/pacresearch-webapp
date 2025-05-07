import React from "react";
import EquityMarketDashboard from "../../components/Admin/EquityMarketDashboard";
import FGNEditor from "../../components/Admin/FgnEditor";
import ASIEditor from "../../components/Admin/AsiEditor";

const EquityMarket = () => {
  return (
    <div className="flex flex-col gap-10 w-full">
      <EquityMarketDashboard />
      <ASIEditor />
      <FGNEditor />
    </div>
  );
};

export default EquityMarket;
