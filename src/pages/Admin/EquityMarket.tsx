import React from "react";
import EquityMarketDashboard from "../../components/Admin/EquityMarketDashboard";
import FGNEditor from "../../components/Admin/FgnEditor";
import ASIEditor from "../../components/Admin/AsiEditor";
import TopGainersManager from "../../components/Admin/TopGainersManager";
import TopLosersManager from "../../components/Admin/TopLosersManager";

const EquityMarket = () => {
  return (
    <div className="flex flex-col gap-10 w-full">
      {/* <EquityMarketDashboard /> */}
      <TopGainersManager />
      <TopLosersManager />
      <ASIEditor />
      <FGNEditor />
    </div>
  );
};

export default EquityMarket;
