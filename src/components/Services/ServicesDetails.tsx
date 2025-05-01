import React from "react";
import ServiceItem from "./ServiceItem";

const ServicesDetails = () => {
  return (
    <div className=" mt-[50px]">
      <p className="w-full text-center max-w-[995px] mx-auto text-PAC-Blue text-2xl font-medium font-['Inter'] leading-[35px] tracking-tight">
        At PAC Research, we specialize in providing comprehensive and tailored
        solutions to support businesses and organizations in navigating today’s
        dynamic financial and economic landscape. Our suite of services is
        designed to empower decision-makers with actionable insights and
        strategic guidance.{" "}
      </p>
      <div className="mt-[91px] flex flex-col gap-[118px]">
        {Array.from({ length: 5 }, (_, index) => (
          <ServiceItem key={index} />
        ))}
      </div>
    </div>
  );
};

export default ServicesDetails;
