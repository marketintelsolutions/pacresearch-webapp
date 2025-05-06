import React from "react";
import { Stock } from "../../types";

interface StockTableProps {
  stocks: Stock[];
  onEdit: (stock: Stock) => void;
  onDelete: (id: string) => void;
}

const StockTable: React.FC<StockTableProps> = ({
  stocks,
  onEdit,
  onDelete,
}) => {
  console.log("stocks", stocks);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Symbol
            </th>
            <th
              scope="col"
              className="px-6 py-5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Previous Day Close
            </th>
            <th
              scope="col"
              className="px-6 py-5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Current Day Close
            </th>
            <th
              scope="col"
              className="px-6 py-5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Change (%)
            </th>
            <th
              scope="col"
              className="px-6 py-5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {stocks.map((stock) => (
            <tr key={stock.id}>
              <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-900">
                {stock.symbol}
              </td>
              <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500">
                {stock.previousDayClose.toFixed(2)}
              </td>
              <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500">
                {stock.currentDayClose.toFixed(2)}
              </td>
              <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500">
                <span
                  className={`${
                    stock.change >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stock.change >= 0 ? "+" : ""}
                  {stock.change}%
                </span>
              </td>
              <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onEdit(stock)}
                  className="text-blue-600 hover:text-blue-900 mr-4"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(stock.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StockTable;
