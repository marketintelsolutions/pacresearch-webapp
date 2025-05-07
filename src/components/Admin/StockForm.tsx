// File: src/components/StockForm.tsx
import React, { useState, useEffect } from "react";
import { Stock } from "../../types";

interface StockFormProps {
  stock?: Stock;
  onSubmit: (stock: Omit<Stock, "id">) => void;
  onCancel: () => void;
}

const StockForm: React.FC<StockFormProps> = ({ stock, onSubmit, onCancel }) => {
  const [symbol, setSymbol] = useState("");
  const [previousDayClose, setPreviousDayClose] = useState("");
  const [currentDayClose, setCurrentDayClose] = useState("");

  useEffect(() => {
    if (stock) {
      setSymbol(stock.symbol);
      setPreviousDayClose(stock.previousDayClose.toString());
      setCurrentDayClose(stock.currentDayClose.toString());
    }
  }, [stock]);

  const calculateChange = (prev: number, curr: number): number => {
    return Number((((curr - prev) / prev) * 100).toFixed(2));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const prevClose = parseFloat(previousDayClose);
    const currClose = parseFloat(currentDayClose);
    const change = calculateChange(prevClose, currClose);

    onSubmit({
      symbol,
      previousDayClose: prevClose,
      currentDayClose: currClose,
      change,
    });

    // Reset form
    setSymbol("");
    setPreviousDayClose("");
    setCurrentDayClose("");
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">
        {stock ? "Edit Stock" : "Add New Stock"}
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Symbol
            </label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Previous Day Close
            </label>
            <input
              type="number"
              step="0.01"
              value={previousDayClose}
              onChange={(e) => setPreviousDayClose(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Day Close
            </label>
            <input
              type="number"
              step="0.01"
              value={currentDayClose}
              onChange={(e) => setCurrentDayClose(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {stock ? "Update" : "Add"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StockForm;
