import React, { useState, useEffect } from "react";
import FgnCard from "./FgnCard";
import { ArrowDown, ArrowUp } from "lucide-react";
import EquityMarketTable from "./EquityMarketTable";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { ASIData, FGNData } from "../../types";

const EquityMarket: React.FC = () => {
  const [asiData, setAsiData] = useState<ASIData | null>(null);
  const [fgnData, setFgnData] = useState<FGNData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      setLoading(true);
      try {
        // Fetch ASI data
        const asiRef = doc(db, "marketIndices", "ASI");
        const asiSnapshot = await getDoc(asiRef);

        if (asiSnapshot.exists()) {
          setAsiData(asiSnapshot.data() as ASIData);
        }

        // Fetch FGN data
        const fgnRef = collection(db, "fixedIncome");
        const fgnSnapshot = await getDocs(fgnRef);

        const fgnItems: FGNData[] = [];
        fgnSnapshot.forEach((doc) => {
          fgnItems.push({ id: doc.id, ...doc.data() } as FGNData);
        });

        setFgnData(fgnItems);
      } catch (error) {
        console.error("Error fetching market data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format large number with commas
  const formatLargeNumber = (num: number): string => {
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Format date (from YYYY-MM-DD to DD MMM YY)
  const formatDate = (dateString: string): string => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const day = date.getDate();
    const month = new Intl.DateTimeFormat("en", { month: "short" }).format(
      date
    );
    const year = date.getFullYear().toString().substr(-2);

    return `${day} ${month} ${year}`;
  };

  return (
    <div className="relative flex flex-wrap lg:flex-nowrap gap-[36px]">
      <div className="absolute -bottom-[290px] -left-[61px]">
        <img src="/images/semieclipse.svg" alt="semieclipse" />
      </div>
      <div className="w-full lg:max-w-64">
        <div className="w-64 h-11 px-9 py-3 bg-white rounded-3xl shadow-[2.9px_2.9px_13.3px_-1.4px_rgba(231,228,232,0.80)] border-Color-blue inline-flex justify-start items-center gap-2">
          <span className="justify-start text-primaryBlue text-xs font-normal font-['Jost']">
            All Share Index (ASI){" "}
          </span>
        </div>

        {loading || !asiData ? (
          <div className="flex justify-between mt-2.5">
            <span className="w-24 h-6 bg-gray-200 animate-pulse rounded"></span>
            <span className="w-9 h-6 bg-gray-200 animate-pulse rounded"></span>
            <span className="w-20 h-6 bg-gray-200 animate-pulse rounded"></span>
          </div>
        ) : (
          <div className="flex justify-between max-w-[300px] mt-2.5">
            <span className="w-24 h-6 justify-start text-primaryBlue text-sm font-normal font-['Jost']">
              {formatLargeNumber(asiData.value)}
            </span>
            <div className="flex items-center gap-1">
              <span>
                {asiData.change >= 0 ? (
                  <ArrowUp size={16} color="#22c55e" />
                ) : (
                  <ArrowDown size={16} color="#ef4444" />
                )}
              </span>
              <span
                className={`w-9 h-6 justify-start ${
                  asiData.change >= 0 ? "text-green-500" : "text-red-500"
                } text-sm font-normal font-['Jost']`}
              >
                {asiData.change >= 0 ? "+" : ""}
                {asiData.change.toFixed(2)}
              </span>
            </div>
            <span className="w-20 h-6 justify-start text-primaryBlue text-sm font-normal font-['Jost']">
              {formatDate(asiData.date)}
            </span>
          </div>
        )}

        <h2 className="self-stretch justify-start mt-[35px] text-primaryBlue text-2xl font-semibold font-['Jost'] leading-normal">
          FIXED INCOME MARKET
        </h2>

        {loading ? (
          <>
            <div className="h-[169px] w-[211px] mt-5 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-[169px] w-[211px] mt-5 bg-gray-200 animate-pulse rounded"></div>
          </>
        ) : (
          <div className="relative z-[2] flex flex-wrap lg:flex-col gap-6 mt-5">
            {fgnData.map((fgn) => (
              <FgnCard key={fgn.id} data={fgn} />
            ))}
          </div>
        )}
      </div>
      <EquityMarketTable />
    </div>
  );
};

export default EquityMarket;
