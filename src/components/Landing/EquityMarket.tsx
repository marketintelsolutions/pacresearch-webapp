import React from "react";
import FgnCard from "./FgnCard";

const EquityMarket = () => {
  return (
    <div className="relative flex gap-[36px]">
      <div className="absolute -bottom-[290px] -left-[61px]">
        <img src="/images/semieclipse.svg" alt="semieclipse" />
      </div>
      <div className="w-full max-w-64">
        <div className="w-64 h-11 px-9 py-3 bg-white rounded-3xl shadow-[2.9px_2.9px_13.3px_-1.4px_rgba(231,228,232,0.80)] border-Color-blue inline-flex justify-start items-center gap-2">
          <span className="justify-start text-primaryBlue text-xs font-normal font-['Jost']">
            All Share Index (ASI){" "}
          </span>
        </div>
        <div className="flex justify-between mt-2.5">
          <span className="w-24 h-6 justify-start text-primaryBlue text-sm font-normal font-['Jost']">
            17232894.00{" "}
          </span>
          <span className="w-9 h-6 justify-start text-red-500 text-sm font-normal font-['Jost']">
            -1.23
          </span>
          <span className="w-20 h-6 justify-start text-primaryBlue text-sm font-normal font-['Jost']">
            20 Mar 25
          </span>
        </div>
        <h2 className="self-stretch justify-start mt-[35px] text-primaryBlue text-2xl font-semibold font-['Jost'] leading-normal">
          FIXED INCOME MARKET
        </h2>
        <FgnCard />
        <FgnCard />
      </div>
      <div className="w-full">
        <h2 className="w-[686px] justify-start text-blue-950 text-4xl font-semibold font-['Jost'] leading-10">
          EQUITY MARKET{" "}
        </h2>

        <div className="flex gap-40 mt-[22px] border-b border-[#EBEEF2]">
          <p className="self-stretch pb-1 border-b-[3px] border-primaryBlue text-center justify-start text-PAC-Blue text-base font-medium font-['Jost']">
            All Transactions
          </p>
          <p className="justify-start text-secondaryBlue text-base font-medium font-['Jost']">
            Top 5 gainers
          </p>
          <p className="justify-start text-secondaryBlue text-base font-medium font-['Jost']">
            Top 5 losers
          </p>
        </div>

        <table className="w-full mt-[48px] bg-[#FFFFFF] rounded-[30px] h-[397px] ">
          <thead>
            <tr>
              <th className="justify-start text-left px-6 py-5  text-secondaryBlue text-base font-medium font-['Jost']">
                <span className="inline-flex w-[30px]"></span>
              </th>
              <th className="justify-start text-left px-6 py-5 text-secondaryBlue text-base font-medium font-['Jost']">
                STOCK{" "}
              </th>
              <th className="justify-start text-left px-6 py-5 text-secondaryBlue text-base font-medium font-['Jost']">
                PREVIOUS DAY CLOSE {" "}
              </th>
              <th className="justify-start text-left px-6 py-5 text-secondaryBlue text-base font-medium font-['Jost']">
                CURRENT DAY CLOSE {" "}
              </th>
              <th className="justify-start text-left px-6 py-5 text-secondaryBlue text-base font-medium font-['Jost']">
                CHANGE {" "}
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }, (_, index) => (
              <tr key={index} className="border-t border-[#E6EFF5] ">
                <td className="px-6 py-5">
                  <img src="/images/rounduparrow.svg" alt="rounduparrow" />
                </td>
                <td className="justify-start text-left px-6 py-5 text-neutral-800 text-base font-normal font-['Jost']">
                  D,EDS'D{" "}
                </td>
                <td className="justify-start text-left px-6 py-5 text-neutral-800 text-base font-normal font-['Jost']">
                  12345.67{" "}
                </td>
                <td className="justify-start text-left px-6 py-5 text-neutral-800 text-base font-normal font-['Jost']">
                  12345.67{" "}
                </td>
                <td className="justify-start text-left px-6 py-5 text-[#F44336] text-base font-normal font-['Jost']">
                  34%{" "}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mt-6 items-center ">
          <div className="flex gap-8">
            <button className="justify-center text-PAC-Blue text-base font-medium font-['Jost']">
              Previous
            </button>
            <div className="flex gap-5 items-center">
              <p className="justify-center px-4 py-[9px] bg-primaryBlue rounded-[10px] text-white text-base font-medium font-['Jost']">
                1
              </p>
              <p className="justify-center text-primaryBlue text-base font-medium font-['Jost']">
                2
              </p>
              <p className="justify-center text-primaryBlue text-base font-medium font-['Jost']">
                3
              </p>
              <p className="justify-center text-primaryBlue text-base font-medium font-['Jost']">
                4
              </p>
            </div>
            <button className="justify-center text-PAC-Blue text-base font-medium font-['Jost']">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquityMarket;
