import React, { useState } from "react";
import { TopStock } from "../../types";

interface EquityMarketTableProps {
  gainers: TopStock[];
  losers: TopStock[];
  loading: {
    gainers: boolean;
    losers: boolean;
  };
}

const EquityMarketTable: React.FC<EquityMarketTableProps> = ({
  gainers,
  losers,
  loading,
}) => {
  const [activeTab, setActiveTab] = useState<"gainers" | "losers">("gainers");

  // Format number with commas
  const formatNumber = (num: number): string => {
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Get current data based on active tab
  const currentData = activeTab === "gainers" ? gainers : losers;
  const isLoading = activeTab === "gainers" ? loading.gainers : loading.losers;

  // Filter out empty stocks (stocks with no symbol)
  const validStocks = currentData.filter((stock) => stock.symbol.trim() !== "");

  return (
    <div className="w-full">
      <h2 className="justify-start text-primaryBlue text-3xl font-semibold font-['Jost'] leading-10">
        EQUITY MARKET{" "}
      </h2>

      <div className="flex gap-40 mt-[22px] border-b border-[#EBEEF2]">
        <p
          className={`self-stretch pb-1 ${
            activeTab === "gainers"
              ? "border-b-[3px] border-primaryBlue text-primaryBlue"
              : "text-secondaryBlue"
          } text-center justify-start text-sm md:text-base font-medium font-['Jost'] cursor-pointer`}
          onClick={() => setActiveTab("gainers")}
        >
          Top 5 gainers
        </p>
        <p
          className={`justify-start ${
            activeTab === "losers"
              ? "border-b-[3px] border-primaryBlue text-primaryBlue"
              : "text-secondaryBlue"
          } text-sm md:text-base font-medium font-['Jost'] cursor-pointer`}
          onClick={() => setActiveTab("losers")}
        >
          Top 5 losers
        </p>
      </div>

      <div className="w-full overflow-x-scroll">
        <table className="min-w-[600px] w-full mt-[48px] bg-[#FFFFFF] rounded-[30px]">
          <thead>
            <tr>
              <th className="justify-start text-left px-3 md:px-6 py-5 md:py-5 text-secondaryBlue text-sm md:text-base font-medium font-['Jost']">
                <span className="inline-flex w-[30px]"></span>
              </th>
              <th className="justify-start text-left px-3 md:px-6 py-5 md:py-5 text-secondaryBlue text-sm md:text-base font-medium font-['Jost']">
                STOCK{" "}
              </th>
              <th className="justify-start text-left px-3 md:px-6 py-5 md:py-5 text-secondaryBlue text-sm md:text-base font-medium font-['Jost']">
                PREVIOUS DAY CLOSE{" "}
              </th>
              <th className="justify-start text-left px-3 md:px-6 py-5 md:py-5 text-secondaryBlue text-sm md:text-base font-medium font-['Jost']">
                CURRENT DAY CLOSE{" "}
              </th>
              <th className="justify-start text-left px-3 md:px-6 py-5 md:py-5 text-secondaryBlue text-sm md:text-base font-medium font-['Jost']">
                CHANGE{" "}
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="text-center py-8">
                  Loading...
                </td>
              </tr>
            ) : validStocks.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8">
                  No {activeTab} data available
                </td>
              </tr>
            ) : (
              validStocks.map((stock, index) => (
                <tr key={stock.id} className="border-t border-[#E6EFF5]">
                  <td className="px-3 md:px-6 py-5 md:py-5">
                    <img
                      src={
                        stock.change >= 0
                          ? "/images/rounduparrow.svg"
                          : "/images/rounddownarrow.svg"
                      }
                      alt={stock.change >= 0 ? "up arrow" : "down arrow"}
                    />
                  </td>
                  <td className="justify-start text-left px-3 md:px-6 py-5 md:py-5 text-neutral-800 text-sm md:text-base font-normal font-['Jost']">
                    {stock.symbol}
                  </td>
                  <td className="justify-start text-left px-3 md:px-6 py-5 md:py-5 text-neutral-800 text-sm md:text-base font-normal font-['Jost']">
                    {formatNumber(stock.previousDayClose)}
                  </td>
                  <td className="justify-start text-left px-3 md:px-6 py-5 md:py-5 text-neutral-800 text-sm md:text-base font-normal font-['Jost']">
                    {formatNumber(stock.currentDayClose)}
                  </td>
                  <td
                    className={`justify-start text-left px-3 md:px-6 py-5 md:py-5 ${
                      stock.change >= 0 ? "text-green-500" : "text-[#F44336]"
                    } text-sm md:text-base font-normal font-['Jost']`}
                  >
                    {stock.change >= 0 ? "+" : ""}
                    {stock.change.toFixed(2)}%
                  </td>
                </tr>
              ))
            )}

            {/* Fill empty rows if we have less than 5 valid stocks */}
            {!isLoading &&
              validStocks.length < 5 &&
              Array.from({ length: 5 - validStocks.length }).map((_, index) => (
                <tr
                  key={`empty-${index}`}
                  className="border-t border-[#E6EFF5]"
                >
                  <td className="px-3 md:px-6 py-5 md:py-5"></td>
                  <td className="justify-start text-left px-3 md:px-6 py-5 md:py-5 text-gray-400 text-sm md:text-base font-normal font-['Jost']">
                    -
                  </td>
                  <td className="justify-start text-left px-3 md:px-6 py-5 md:py-5 text-gray-400 text-sm md:text-base font-normal font-['Jost']">
                    -
                  </td>
                  <td className="justify-start text-left px-3 md:px-6 py-5 md:py-5 text-gray-400 text-sm md:text-base font-normal font-['Jost']">
                    -
                  </td>
                  <td className="justify-start text-left px-3 md:px-6 py-5 md:py-5 text-gray-400 text-sm md:text-base font-normal font-['Jost']">
                    -
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EquityMarketTable;
