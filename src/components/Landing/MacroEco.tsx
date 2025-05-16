import React, { useState, useEffect } from "react";
import MacroEcoCard from "./MacroEcoCard";
import EquityMarket from "./EquityMarket";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { ExchangeRateData, MacroeconomicData } from "../../types";

const MacroEco: React.FC = () => {
  const [inflation, setInflation] = useState<MacroeconomicData | null>(null);
  const [gdp, setGdp] = useState<MacroeconomicData | null>(null);
  const [
    monetaryPolicy,
    setMonetaryPolicy,
  ] = useState<MacroeconomicData | null>(null);
  const [exchangeRate, setExchangeRate] = useState<ExchangeRateData | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      setLoading(true);
      try {
        // Fetch all macroeconomic data in parallel
        const [
          inflationDoc,
          gdpDoc,
          monetaryDoc,
          exchangeDoc,
        ] = await Promise.all([
          getDoc(doc(db, "macroeconomics", "inflation")),
          getDoc(doc(db, "macroeconomics", "gdp")),
          getDoc(doc(db, "macroeconomics", "monetaryPolicy")),
          getDoc(doc(db, "macroeconomics", "exchangeRate")),
        ]);

        if (inflationDoc.exists()) {
          setInflation(inflationDoc.data() as MacroeconomicData);
        }
        if (gdpDoc.exists()) {
          setGdp(gdpDoc.data() as MacroeconomicData);
        }
        if (monetaryDoc.exists()) {
          setMonetaryPolicy(monetaryDoc.data() as MacroeconomicData);
        }
        if (exchangeDoc.exists()) {
          setExchangeRate(exchangeDoc.data() as ExchangeRateData);
        }
      } catch (error) {
        console.error("Error fetching macroeconomic data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format exchange rate with commas
  const formatExchangeRate = (price: number): string => {
    return price.toLocaleString("en-US");
  };

  return (
    <section className="mt-[94px] px-6 lg:px-0 w-full max-w-[1110px] mx-auto">
      <h2 className="self-stretch justify-start text-primaryBlue text-3xl font-semibold font-['Jost']">
        MACROECONOMICS{" "}
      </h2>

      {loading ? (
        <div className="mt-5 flex justify-between">
          <div className="w-full max-w-[352px] h-[110px] bg-gray-200 animate-pulse rounded-md"></div>
          <div className="w-full max-w-[352px] h-[110px] bg-gray-200 animate-pulse rounded-md"></div>
          <div className="w-full max-w-[352px] h-[110px] bg-gray-200 animate-pulse rounded-md"></div>
        </div>
      ) : (
        <div className="mt-5 flex flex-wrap gap-10 lg:gap-5 ">
          {inflation && (
            <MacroEcoCard
              title="Inflation Rate"
              date={inflation.date}
              percentage={inflation.percentage}
              iconSrc="/images/money.svg"
            />
          )}

          {gdp && (
            <MacroEcoCard
              title="GDP Growth Rate"
              date={gdp.date}
              percentage={gdp.percentage}
              iconSrc="/images/money.svg"
              isPositive={gdp.percentage > 0}
            />
          )}

          {monetaryPolicy && (
            <MacroEcoCard
              title="Monetary Policy Rate"
              date={monetaryPolicy.date}
              percentage={monetaryPolicy.percentage}
              iconSrc="/images/money.svg"
            />
          )}
        </div>
      )}

      <div className="flex justify-end w-full pb-2.5 border-b border-secondaryBlue mt-[45px] mb-[27px]">
        <p className="w-40 h-5 justify-start">
          <span className="text-cyan-400 text-sm font-normal font-['Jost']">
            Exchange Rate{" "}
          </span>
          <span className="text-primaryBlue text-sm font-normal font-['Jost']">
            {loading || !exchangeRate
              ? "Loading..."
              : `N${formatExchangeRate(exchangeRate.price)}/$`}
          </span>
        </p>
      </div>

      <EquityMarket />
    </section>
  );
};

export default MacroEco;
