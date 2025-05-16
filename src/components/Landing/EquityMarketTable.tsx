import React, { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { Stock } from "../../types";

const EquityMarketTable = () => {
  // State for storing data
  const [topGainers, setTopGainers] = useState<Stock[]>([]);
  const [topLosers, setTopLosers] = useState<Stock[]>([]);
  const [activeTab, setActiveTab] = useState<"gainers" | "losers">("gainers");
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch top gainers
  const fetchTopGainers = async (): Promise<void> => {
    try {
      const stocksRef = collection(db, "stocks");
      const gainersQuery = query(
        stocksRef,
        orderBy("change", "desc"),
        limit(5)
      );
      const gainersSnapshot = await getDocs(gainersQuery);

      const gainersData: Stock[] = [];
      gainersSnapshot.forEach((doc) => {
        gainersData.push({
          id: doc.id,
          ...(doc.data() as Omit<Stock, "id">),
        });
      });

      setTopGainers(gainersData);
    } catch (error) {
      console.error("Error fetching top gainers:", error);
    }
  };

  // Fetch top losers
  const fetchTopLosers = async (): Promise<void> => {
    try {
      const stocksRef = collection(db, "stocks");
      const losersQuery = query(stocksRef, orderBy("change", "asc"), limit(5));
      const losersSnapshot = await getDocs(losersQuery);

      const losersData: Stock[] = [];
      losersSnapshot.forEach((doc) => {
        losersData.push({
          id: doc.id,
          ...(doc.data() as Omit<Stock, "id">),
        });
      });

      setTopLosers(losersData);
    } catch (error) {
      console.error("Error fetching top losers:", error);
    }
  };

  // Fetch all data on component mount
  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      setLoading(true);
      try {
        await Promise.all([fetchTopGainers(), fetchTopLosers()]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format number with commas
  const formatNumber = (num: number): string => {
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="w-full ">
      <h2 className=" justify-start text-primaryBlue text-3xl font-semibold font-['Jost'] leading-10">
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
        <table className="min-w-[600px] w-full mt-[48px] bg-[#FFFFFF] rounded-[30px] ">
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
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-8">
                  Loading...
                </td>
              </tr>
            ) : (
              (activeTab === "gainers" ? topGainers : topLosers).map(
                (stock) => (
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
                      {stock.change}%
                    </td>
                  </tr>
                )
              )
            )}
            {!loading &&
              (activeTab === "gainers" ? topGainers : topLosers).length ===
                0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8">
                    No data available
                  </td>
                </tr>
              )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EquityMarketTable;
