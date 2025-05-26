import React, { useState, useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  fetchTopLosers,
  saveTopLosers,
  clearError,
  clearSuccess,
} from "../../store/equityMarketSlice";
import { TopStock } from "../../types";

const TopLosersManager: React.FC = () => {
  const dispatch = useAppDispatch();
  const { losers, loading, error, success } = useAppSelector((state) => ({
    losers: state.equityMarket.losers,
    loading: state.equityMarket.loading.losers,
    error: state.equityMarket.error,
    success: state.equityMarket.success,
  }));

  const [stocks, setStocks] = useState<TopStock[]>([]);
  const [draggedStock, setDraggedStock] = useState<string | null>(null);
  const [dragOverStock, setDragOverStock] = useState<string | null>(null);
  const [dragPosition, setDragPosition] = useState<"before" | "after" | null>(
    null
  );

  // Initialize empty stocks
  const initializeEmptyStocks = useCallback(() => {
    return Array.from({ length: 5 }, (_, index) => ({
      id: `loser_${index}`, // Use consistent IDs
      symbol: "",
      previousDayClose: 0,
      currentDayClose: 0,
      change: 0,
      displayOrder: index,
    }));
  }, []);

  useEffect(() => {
    dispatch(fetchTopLosers());
  }, [dispatch]);

  useEffect(() => {
    // Initialize local state with fetched data or create empty slots
    if (losers.length > 0) {
      // Ensure we always have exactly 5 stocks
      const paddedLosers = [...losers];
      while (paddedLosers.length < 5) {
        paddedLosers.push({
          id: `loser_${paddedLosers.length}`,
          symbol: "",
          previousDayClose: 0,
          currentDayClose: 0,
          change: 0,
          displayOrder: paddedLosers.length,
        });
      }
      setStocks(paddedLosers.slice(0, 5)); // Ensure exactly 5
    } else {
      setStocks(initializeEmptyStocks());
    }
  }, [losers, initializeEmptyStocks]);

  // Clear messages after timeout
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (success || error) {
      timer = setTimeout(() => {
        dispatch(clearSuccess());
        dispatch(clearError());
      }, 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [success, error, dispatch]);

  // Use useCallback to prevent unnecessary re-renders
  const handleStockChange = useCallback(
    (index: number, field: keyof TopStock, value: string | number) => {
      setStocks((prevStocks) => {
        const updatedStocks = [...prevStocks];

        if (field === "previousDayClose" || field === "currentDayClose") {
          const numValue = parseFloat(value as string) || 0;
          const prevClose =
            field === "previousDayClose"
              ? numValue
              : updatedStocks[index].previousDayClose;
          const currClose =
            field === "currentDayClose"
              ? numValue
              : updatedStocks[index].currentDayClose;

          updatedStocks[index] = {
            ...updatedStocks[index],
            [field]: numValue,
            change:
              prevClose > 0
                ? Number(
                    (((currClose - prevClose) / prevClose) * 100).toFixed(2)
                  )
                : 0,
          };
        } else {
          updatedStocks[index] = {
            ...updatedStocks[index],
            [field]: value,
          };
        }

        return updatedStocks;
      });
    },
    []
  );

  const handleSave = async () => {
    // Filter out empty stocks and validate
    const validStocks = stocks.filter(
      (stock) =>
        stock.symbol.trim() !== "" &&
        stock.previousDayClose > 0 &&
        stock.currentDayClose > 0
    );

    if (validStocks.length === 0) {
      dispatch({
        type: "equityMarket/setError",
        payload: "Please add at least one valid stock entry",
      });
      return;
    }

    // Ensure we have exactly 5 stocks (pad with empty if needed)
    const stocksToSave = [...validStocks];
    while (stocksToSave.length < 5) {
      stocksToSave.push({
        id: `loser_empty_${stocksToSave.length}`,
        symbol: "",
        previousDayClose: 0,
        currentDayClose: 0,
        change: 0,
        displayOrder: stocksToSave.length,
      });
    }

    try {
      await dispatch(saveTopLosers(stocksToSave.slice(0, 5))).unwrap();
    } catch (err) {
      console.error("Error saving top losers:", err);
    }
  };

  // Drag and drop handlers (same as TopGainersManager)
  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    stockId: string
  ) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", stockId);
    setDraggedStock(stockId);

    if (e.currentTarget) {
      e.currentTarget.style.opacity = "0.4";
    }
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    if (e.currentTarget) {
      e.currentTarget.style.opacity = "1";
    }

    setDraggedStock(null);
    setDragOverStock(null);
    setDragPosition(null);
  };

  const handleDragOver = (
    e: React.DragEvent<HTMLDivElement>,
    stockId: string
  ) => {
    e.preventDefault();

    if (stockId === draggedStock) {
      setDragOverStock(null);
      setDragPosition(null);
      return;
    }

    e.dataTransfer.dropEffect = "move";

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const position = y < rect.height / 2 ? "before" : "after";

    setDragOverStock(stockId);
    setDragPosition(position);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverStock(null);
      setDragPosition(null);
    }
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    targetStockId: string
  ) => {
    e.preventDefault();

    const draggedId = e.dataTransfer.getData("text/plain");

    if (draggedId === targetStockId) return;

    const draggedIndex = stocks.findIndex((stock) => stock.id === draggedId);
    const targetIndex = stocks.findIndex((stock) => stock.id === targetStockId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const reorderedStocks = [...stocks];
    const [draggedStock] = reorderedStocks.splice(draggedIndex, 1);

    let newIndex = targetIndex;
    if (dragPosition === "before") {
      newIndex = targetIndex;
      if (draggedIndex < targetIndex) {
        newIndex--;
      }
    } else if (dragPosition === "after") {
      newIndex = targetIndex;
    }

    reorderedStocks.splice(newIndex, 0, draggedStock);

    // Update display orders
    const updatedStocks = reorderedStocks.map((stock, index) => ({
      ...stock,
      displayOrder: index,
    }));

    setStocks(updatedStocks);

    setDraggedStock(null);
    setDragOverStock(null);
    setDragPosition(null);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Manage Top 5 Losers</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {success}
        </div>
      )}

      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Enter the top 5 losing stocks. Drag and drop to reorder. Changes will
          be calculated automatically.
        </p>
      </div>

      <div className="space-y-4">
        {stocks.map((stock, index) => (
          <div
            key={stock.id}
            draggable
            onDragStart={(e) => handleDragStart(e, stock.id)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, stock.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, stock.id)}
            className={`relative p-4 border rounded-lg ${
              stock.id === draggedStock
                ? "opacity-40"
                : "bg-white hover:bg-gray-50"
            }`}
          >
            {/* Drop indicators */}
            {dragOverStock === stock.id && dragPosition === "before" && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-red-500 z-10"></div>
            )}
            {dragOverStock === stock.id && dragPosition === "after" && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-500 z-10"></div>
            )}

            <div className="flex items-center gap-4">
              <div className="cursor-move text-gray-500 hover:text-gray-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="8" cy="6" r="1" />
                  <circle cx="15" cy="6" r="1" />
                  <circle cx="8" cy="12" r="1" />
                  <circle cx="15" cy="12" r="1" />
                  <circle cx="8" cy="18" r="1" />
                  <circle cx="15" cy="18" r="1" />
                </svg>
              </div>

              <div className="text-lg font-medium text-gray-600 w-8">
                #{index + 1}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-grow">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Stock Symbol
                  </label>
                  <input
                    type="text"
                    value={stock.symbol}
                    onChange={(e) =>
                      handleStockChange(index, "symbol", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., MTNN"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Previous Close
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={
                      stock.previousDayClose === 0 ? "" : stock.previousDayClose
                    }
                    onChange={(e) =>
                      handleStockChange(
                        index,
                        "previousDayClose",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Current Close
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={
                      stock.currentDayClose === 0 ? "" : stock.currentDayClose
                    }
                    onChange={(e) =>
                      handleStockChange(
                        index,
                        "currentDayClose",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Change (%)
                  </label>
                  <div
                    className={`w-full px-3 py-2 border border-gray-200 rounded-md text-sm bg-gray-50 ${
                      stock.change > 0
                        ? "text-green-600"
                        : stock.change < 0
                        ? "text-red-600"
                        : "text-gray-600"
                    }`}
                  >
                    {stock.change > 0 ? "+" : ""}
                    {stock.change.toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className={`px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 ${
            loading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Saving..." : "Save Top Losers"}
        </button>
      </div>
    </div>
  );
};

export default TopLosersManager;
