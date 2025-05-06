import React, { useState, useEffect } from "react";
import {
  getStocks,
  addStock,
  updateStock,
  deleteStock,
  getTopGainers,
  getTopLosers,
} from "../../firebase/stockService";
import { Stock } from "../../types";
import StockTable from "./StockTable";
import StockForm from "./StockForm";

const EquityMarketDashboard: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [topGainers, setTopGainers] = useState<Stock[]>([]);
  const [topLosers, setTopLosers] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingStock, setEditingStock] = useState<Stock | undefined>(
    undefined
  );
  const [activeTab, setActiveTab] = useState<"all" | "gainers" | "losers">(
    "all"
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const [stocksData, gainers, losers] = await Promise.all([
        getStocks(),
        getTopGainers(),
        getTopLosers(),
      ]);
      setStocks(stocksData);
      setTopGainers(gainers);
      setTopLosers(losers);
    } catch (err) {
      setError("Failed to fetch data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddStock = async (stockData: Omit<Stock, "id">) => {
    try {
      await addStock(stockData);
      await fetchData();
      setShowForm(false);
    } catch (err) {
      setError("Failed to add stock");
      console.error(err);
    }
  };

  const handleUpdateStock = async (stockData: Omit<Stock, "id">) => {
    if (!editingStock) return;

    try {
      await updateStock(editingStock.id, stockData);
      await fetchData();
      setShowForm(false);
      setEditingStock(undefined);
    } catch (err) {
      setError("Failed to update stock");
      console.error(err);
    }
  };

  const handleDeleteStock = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this stock?")) {
      try {
        await deleteStock(id);
        await fetchData();
      } catch (err) {
        setError("Failed to delete stock");
        console.error(err);
      }
    }
  };

  const handleEdit = (stock: Stock) => {
    setEditingStock(stock);
    setShowForm(true);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingStock(undefined);
  };

  const handleFormSubmit = (stockData: Omit<Stock, "id">) => {
    if (editingStock) {
      handleUpdateStock(stockData);
    } else {
      handleAddStock(stockData);
    }
  };

  let displayedStocks: Stock[] = [];
  switch (activeTab) {
    case "gainers":
      displayedStocks = topGainers;
      break;
    case "losers":
      displayedStocks = topLosers;
      break;
    default:
      displayedStocks = stocks;
  }

  return (
    <div className="w-full mx-auto">
      <div className="flex justify-end items-center mb-6">
        <button
          onClick={() => {
            setShowForm(true);
            setEditingStock(undefined);
          }}
          className="px-4 py-2 bg-primaryBlue text-white rounded-[30px] hover:bg-blue-700"
        >
          Add New Stock
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
          <button
            className="absolute top-0 bottom-0 right-0 px-4"
            onClick={() => setError("")}
          >
            &times;
          </button>
        </div>
      )}

      {showForm && (
        <div className="mb-6">
          <StockForm
            stock={editingStock}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        </div>
      )}

      <div className="bg-white rounded-[30px] shadow overflow-hidden mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab("all")}
              className={`justify-start text-left px-6 py-5  text-base font-medium  font-['Jost'] ${
                activeTab === "all"
                  ? "border-primaryBlue text-blue-600"
                  : "border-transparent text-secondaryBlue hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              All Stocks
            </button>
            <button
              onClick={() => setActiveTab("gainers")}
              className={`justify-start text-left px-6 py-5  text-base font-medium font-['Jost'] ${
                activeTab === "gainers"
                  ? "border-primaryBlue text-blue-600"
                  : "border-transparent text-secondaryBlue hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Top 5 Gainers
            </button>
            <button
              onClick={() => setActiveTab("losers")}
              className={`justify-start text-left px-6 py-5  text-base font-medium font-['Jost'] ${
                activeTab === "losers"
                  ? "border-primaryBlue text-blue-600"
                  : "border-transparent text-secondaryBlue hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Top 5 Losers
            </button>
          </nav>
        </div>

        {loading ? (
          <div className="py-24 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        ) : displayedStocks.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-gray-500">No stocks found</p>
          </div>
        ) : (
          <StockTable
            stocks={displayedStocks}
            onEdit={handleEdit}
            onDelete={handleDeleteStock}
          />
        )}
      </div>
    </div>
  );
};

export default EquityMarketDashboard;
