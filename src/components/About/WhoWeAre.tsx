import React from "react";
import { Link } from "react-router-dom";

const WhoWeAre = () => {
  return (
    <section className="w-full px-6 xl:px-0 relative z-[2] max-w-max mx-auto mt-[90px] flex ">
      <div className="w-full max-w-[287px] absolute -bottom-[90px] -left-[136px]  ">
        <img src="/images/bubble.svg" alt="bubble" className="w-full " />
      </div>
      <div className="zr:hidden lg:flex relative w-full  items-end max-w-[620px]">
        <img
          src="/images/workspace.png"
          alt="workspace"
          className="absolute -top-[200px] left-0"
        />
        <img src="/images/guy.png" alt="guy" className="-translate-y-0" />
      </div>
      <div className="relative z-[2] flex flex-col pb-[50px] justify-center">
        <h2 className="w-[453px] justify-start text-PAC-Blue text-4xl font-bold font-['Inter'] capitalize leading-[60px]">
          Who We Are
        </h2>
        <p className="w-full lg:max-w-[637px] mt-6 mb-20 text-justify justify-start text-PAC-Blue text-base font-medium font-['Inter'] leading-relaxed tracking-tight">
          PAC Research is a subsidiary of Pan African Capital Holdings, a
          proprietary investment firm focused on value creation across diverse
          sectors in Africa and beyond. We power businesses across marketplaces
          through information, insights, and technology that enable customers to
          execute critical business decisions with confidence. By coalescing an
          exclusive platform with best-in-class data and analytics, we link
          businesses and public entities to opportunities - we drive
          performance, innovation and progress for our customers and partners.{" "}
          <br />
          <br />
          PAC Research leverages contemporary technologies and innovative
          instruments to create industry-leading analysis, insights and
          investment advice. We deploy analytics, machine learning and other
          research tools to deliver thorough and impactful services to our
          clients. <br />
          <br />
          We draw on cleaner and richer data to help our customers gain greater
          insight, fuel innovation and effectively navigate this time of
          unequalled change.{" "}
        </p>
        <Link
          to={"/services"}
          className="px-5 py-3 w-fit bg-[#15BFFD] hover:bg-transparent hover:text-[#15BFFD] text-white rounded-[30px] outline outline-1 outline-offset-[-1px] outline-[#15BFFD] border  inline-flex justify-center items-center gap-2.5"
        >
          <span className="text-center justify-start  text-base font-medium font-['Inter'] leading-normal">
            Learn More
          </span>
        </Link>
      </div>
    </section>
  );
};

export default WhoWeAre;
