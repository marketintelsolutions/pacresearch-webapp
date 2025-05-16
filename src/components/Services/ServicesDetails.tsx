import React from "react";
import ServiceItem from "./ServiceItem";
import BackgroundStyles from "./BackgroundStyles";

const services = [
  {
    heading: "Strategic Research and Advisory",
    text:
      "With a focus on long-term success, we provide in-depth strategic research and advisory services. From market entry strategies to policy impact assessments, our team delivers actionable recommendations backed by thorough research and analysis. Our advisory services are designed to help organizations stay ahead in a rapidly changing environment ",
    image: "strategic",
  },
  {
    heading: "Survey Services",
    text:
      "We design and execute customized surveys to collect accurate, relevant, and timely data. Our surveys are tailored to address specific client objectives, whether understanding consumer behavior, assessing employee engagement, or gauging market sentiment. By leveraging advanced methodologies and tools, we ensure that the data we provide is reliable and actionable. ",
    image: "survey",
  },
  {
    heading: "Consulting Services",
    text:
      "Our consulting services offer expert guidance to help businesses solve complex problems, enhance performance, and achieve their strategic objectives. Whether it’s financial modeling, risk management, operational efficiency, or growth strategy, we partner with our clients to deliver solutions that drive measurable impact.",
    image: "workspace",
  },
  {
    heading: "Market Intelligence",
    text:
      "Our market intelligence solutions provide deep insights into industry trends, competitive landscapes, and market opportunities. Through robust data analysis and reporting, we enable our clients to make informed decisions, seize growth opportunities, and maintain a competitive edge.",
    image: "marketimg",
  },
  {
    heading: "Data Services",
    text:
      "We offer end-to-end data services, including collection, cleansing, integration, analysis, and visualization. Our expertise in data management ensures that clients have access to accurate and meaningful data to inform decision-making processes. We also provide advanced analytics and reporting solutions to turn raw data into valuable insights. ",
    image: "dataimg",
  },
];

const ServicesDetails = () => {
  return (
    <div className="px-6 xl:px-0 mt-[50px] mb-40">
      <p className="w-full text-center max-w-[995px] mx-auto text-primaryBlue text-lg sm:text-xl md:text-2xl font-medium font-['Inter'] md:leading-[35px] tracking-tight">
        At PAC Research, we specialize in providing comprehensive and tailored
        solutions to support businesses and organizations in navigating today’s
        dynamic financial and economic landscape. Our suite of services is
        designed to empower decision-makers with actionable insights and
        strategic guidance.{" "}
      </p>
      <div className="relative w-full max-w-[1050px] mx-auto mt-[91px] flex flex-col gap-[118px]">
        {services.map((item, index) => (
          <ServiceItem key={index} index={index} {...item} />
        ))}
      </div>
    </div>
  );
};

export default ServicesDetails;
