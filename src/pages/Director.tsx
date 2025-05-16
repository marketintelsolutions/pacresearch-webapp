import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { directorsData } from "../utils/data";
import DirectorsItems from "../components/About/DirectorsItems";
import { ArrowLeft } from "lucide-react";
import PageBanner from "../components/Layout/PageBanner";

const Director = () => {
  const { id } = useParams();

  const director = directorsData.find((item) => item.name === id);

  console.log(director);

  const navigate = useNavigate();

  return (
    <section className="w-full max-w-max  mx-auto px-6 xl:px-0">
      <PageBanner text={director?.name || ""} />
      <button
        onClick={() => navigate(-1)}
        className="px-6 py-3 my-20 bg-primaryBlue text-white flex items-center gap-1 rounded-[6px]"
      >
        <span>
          <ArrowLeft />
        </span>{" "}
        Back
      </button>
      <div className="bg-[#FFFFFFE8] py-[76px] px-6 md:px-[50px] lg:px-[90px] rounded-[30px] flex flex-wrap lg:flex-nowrap gap-11">
        <div className="w-full max-w-[384px]">
          <div className="w-full">
            <img
              src={`/images/${director?.iamgeBig}.png`}
              alt={director?.name}
              className="w-full"
            />
          </div>
          <div className="lg:w-52 justify-start mt-[30px]">
            <span className="text-primaryBlue text-3xl font-bold font-['Inter'] capitalize leading-10">
              {director?.role} <br />
            </span>
            <span className="text-primaryBlue text-3xl font-normal font-['Inter'] capitalize leading-10">
              {director?.name}{" "}
            </span>
          </div>
        </div>
        <div className="w-full flex flex-col gap-5">
          {director?.desc.map((item, index) => (
            <p
              key={index}
              className="lg:w-[577px] text-justify justify-start text-primaryBlue text-sm md:text-base font-medium font-['Inter'] leading-relaxed tracking-tight"
            >
              {item}
            </p>
          ))}
        </div>
      </div>
      <DirectorsItems />
    </section>
  );
};

export default Director;
