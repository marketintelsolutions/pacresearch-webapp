import React, { useState, useEffect } from "react";
import { collection, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { ExchangeRateData, MacroeconomicData } from "../../types";

const Macroeconomics: React.FC = () => {
  // State for form data
  const [inflation, setInflation] = useState<MacroeconomicData>({
    date: "",
    percentage: 0,
  });
  const [gdp, setGdp] = useState<MacroeconomicData>({
    date: "",
    percentage: 0,
  });
  const [monetaryPolicy, setMonetaryPolicy] = useState<MacroeconomicData>({
    date: "",
    percentage: 0,
  });
  const [exchangeRate, setExchangeRate] = useState<ExchangeRateData>({
    price: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error" | "";
  }>({
    text: "",
    type: "",
  });

  // Fetch existing data on component mount
  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      setLoading(true);
      try {
        // Fetch inflation data
        const inflationDoc = await getDoc(
          doc(db, "macroeconomics", "inflation")
        );
        if (inflationDoc.exists()) {
          setInflation(inflationDoc.data() as MacroeconomicData);
        }

        // Fetch GDP data
        const gdpDoc = await getDoc(doc(db, "macroeconomics", "gdp"));
        if (gdpDoc.exists()) {
          setGdp(gdpDoc.data() as MacroeconomicData);
        }

        // Fetch monetary policy data
        const monetaryDoc = await getDoc(
          doc(db, "macroeconomics", "monetaryPolicy")
        );
        if (monetaryDoc.exists()) {
          setMonetaryPolicy(monetaryDoc.data() as MacroeconomicData);
        }

        // Fetch exchange rate data
        const exchangeDoc = await getDoc(
          doc(db, "macroeconomics", "exchangeRate")
        );
        if (exchangeDoc.exists()) {
          setExchangeRate(exchangeDoc.data() as ExchangeRateData);
        }
      } catch (error) {
        console.error("Error fetching macroeconomic data:", error);
        setMessage({
          text: "Failed to load data. Please try again.",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Save all data to Firestore
  const handleSave = async (): Promise<void> => {
    setLoading(true);
    try {
      // Update collections
      await Promise.all([
        setDoc(doc(db, "macroeconomics", "inflation"), inflation),
        setDoc(doc(db, "macroeconomics", "gdp"), gdp),
        setDoc(doc(db, "macroeconomics", "monetaryPolicy"), monetaryPolicy),
        setDoc(doc(db, "macroeconomics", "exchangeRate"), exchangeRate),
      ]);

      setMessage({
        text: "Data saved successfully!",
        type: "success",
      });

      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage({
          text: "",
          type: "",
        });
      }, 3000);
    } catch (error) {
      console.error("Error saving macroeconomic data:", error);
      setMessage({
        text: "Failed to save data. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Input change handlers
  const handleInflationChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const { id, value } = e.target;
    setInflation({
      ...inflation,
      [id === "inflationDate" ? "date" : "percentage"]:
        id === "inflationPercentage" ? parseFloat(value) || 0 : value,
    });
  };

  const handleGdpChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { id, value } = e.target;
    setGdp({
      ...gdp,
      [id === "gdpDate" ? "date" : "percentage"]:
        id === "gdpPercentage" ? parseFloat(value) || 0 : value,
    });
  };

  const handleMonetaryPolicyChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const { id, value } = e.target;
    setMonetaryPolicy({
      ...monetaryPolicy,
      [id === "monetaryDate" ? "date" : "percentage"]:
        id === "monetaryPercentage" ? parseFloat(value) || 0 : value,
    });
  };

  const handleExchangeRateChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const { value } = e.target;
    setExchangeRate({
      ...exchangeRate,
      price: parseFloat(value) || 0,
    });
  };

  return (
    <div className="w-full bg-white h-full rounded-[30px] px-10 py-14">
      {message.text && (
        <div
          className={`mb-4 p-4 rounded ${
            message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <h2 className="text-xl font-semibold">Inflation Rate</h2>
      <div className="my-10 flex gap-10">
        <div className="flex flex-col gap-3 w-full max-w-[350px]">
          <label htmlFor="inflationDate">Date</label>
          <input
            id="inflationDate"
            type="text"
            className="border-gray-400 border rounded-[6px] px-4 py-3 w-full"
            placeholder="February 20, 2025"
            value={inflation.date}
            onChange={handleInflationChange}
          />
        </div>
        <div className="flex flex-col gap-3 w-full max-w-[350px]">
          <label htmlFor="inflationPercentage">Percentage</label>
          <input
            id="inflationPercentage"
            type="number"
            className="border-gray-400 border rounded-[6px] px-4 py-3 w-full"
            placeholder="50"
            value={inflation.percentage || ""}
            onChange={handleInflationChange}
          />
        </div>
      </div>

      <h2 className="text-xl font-semibold">Real GDP Growth Rate</h2>
      <div className="my-10 flex gap-10">
        <div className="flex flex-col gap-3 w-full max-w-[350px]">
          <label htmlFor="gdpDate">Date</label>
          <input
            id="gdpDate"
            type="text"
            className="border-gray-400 border rounded-[6px] px-4 py-3 w-full"
            placeholder="February 20, 2025"
            value={gdp.date}
            onChange={handleGdpChange}
          />
        </div>
        <div className="flex flex-col gap-3 w-full max-w-[350px]">
          <label htmlFor="gdpPercentage">Percentage</label>
          <input
            id="gdpPercentage"
            type="number"
            className="border-gray-400 border rounded-[6px] px-4 py-3 w-full"
            placeholder="50"
            value={gdp.percentage || ""}
            onChange={handleGdpChange}
          />
        </div>
      </div>

      <h2 className="text-xl font-semibold">Monetary Policy Rate</h2>
      <div className="my-10 flex gap-10">
        <div className="flex flex-col gap-3 w-full max-w-[350px]">
          <label htmlFor="monetaryDate">Date</label>
          <input
            id="monetaryDate"
            type="text"
            className="border-gray-400 border rounded-[6px] px-4 py-3 w-full"
            placeholder="February 20, 2025"
            value={monetaryPolicy.date}
            onChange={handleMonetaryPolicyChange}
          />
        </div>
        <div className="flex flex-col gap-3 w-full max-w-[350px]">
          <label htmlFor="monetaryPercentage">Percentage</label>
          <input
            id="monetaryPercentage"
            type="number"
            className="border-gray-400 border rounded-[6px] px-4 py-3 w-full"
            placeholder="50"
            value={monetaryPolicy.percentage || ""}
            onChange={handleMonetaryPolicyChange}
          />
        </div>
      </div>

      <h2 className="text-xl font-semibold">Exchange Rate</h2>
      <div className="my-10 flex gap-10">
        <div className="flex flex-col gap-3 w-full max-w-[350px]">
          <label htmlFor="exchangeRate">Price</label>
          <input
            id="exchangeRate"
            type="number"
            className="border-gray-400 border rounded-[6px] px-4 py-3 w-full"
            placeholder="1570"
            value={exchangeRate.price || ""}
            onChange={handleExchangeRateChange}
          />
        </div>
      </div>

      <div className="mt-10">
        <button
          onClick={handleSave}
          disabled={loading}
          className={`bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors ${
            loading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default Macroeconomics;
