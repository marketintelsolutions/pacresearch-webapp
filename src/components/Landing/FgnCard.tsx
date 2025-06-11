import React from "react";
import { FGNData } from "../../types";
import { BiUpArrow } from "react-icons/bi";
import { ArrowUp } from "lucide-react";

interface FgnCardProps {
  data: FGNData;
}

const FgnCard: React.FC<FgnCardProps> = ({ data }) => {
  return (
    <div
      style={{
        backgroundImage: "url(/images/fgnbg.png)",
        backgroundRepeat: "no-repeat",
      }}
      className="relative h-[169px] w-[211px] mt-5"
    >
      <h3 className="pt-2 text-center justify-start text-secondaryBlue text-base font-bold font-['Jost']">
        FGN {data.type}{" "}
      </h3>
      {data.tenures.length > 3 && (
        <div className="absolute top-11 justify-center items-center gap-2  w-full flex text-white text-sm left-0">
          {/* <span>Scroll </span> */}
          <span>
            <ArrowUp size={16} />
          </span>
        </div>
      )}
      <div className=" h-24 overflow-y-scroll  flex gap-3 mt-[31px] justify-center">
        <div className="justify-start  text-white text-base font-semibold font-['Jost'] leading-7">
          {data.tenures.map((tenure, index) => (
            <React.Fragment key={index}>
              {tenure.label} - <br />
            </React.Fragment>
          ))}
        </div>
        <div className="justify-start text-white text-base font-semibold font-['Jost'] leading-7">
          {data.tenures.map((tenure, index) => (
            <React.Fragment key={index}>
              {tenure.rate.toFixed(2)}%
              <br />
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FgnCard;
