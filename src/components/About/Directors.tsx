import React from "react";
import { directorsData } from "../../utils/data";
import { Link } from "react-router-dom";
import DirectorsItems from "./DirectorsItems";

const DirectorsSummary = () => {
  return (
    <section className="w-full max-w-max px-6 xl:px-0 mx-auto mt-40">
      <h3 className="  text-center text-primaryBlue text-3xl  font-bold font-['Inter'] capitalize md:leading-[60px]">
        OUR BOARD OF DIRECTORS
      </h3>

      <DirectorsItems />

      {/* <div className="flex justify-end">
        <Link to={"/about/directors"}>
          <button className="px-9 py-2.5 bg-sky-500 text-white border border-sky-500 hover:bg-transparent hover:text-sky-500  rounded-[37px] inline-flex flex-col justify-start items-center gap-2.5 overflow-hidden">
            <span className="text-center justify-start text-sm font-bold font-['Montserrat'] leading-snug tracking-tight">
              View All
            </span>
          </button>
        </Link>
      </div> */}
    </section>
  );
};

export default DirectorsSummary;
