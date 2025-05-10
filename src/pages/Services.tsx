import React from "react";
import PageBanner from "../components/Layout/PageBanner";
import ServicesDetails from "../components/Services/ServicesDetails";
import BackgroundStyles from "../components/Services/BackgroundStyles";

const Services = () => {
  return (
    <div className="relative w-full">
      <PageBanner text="OUR SERVICES" />
      <ServicesDetails />
      <BackgroundStyles />
    </div>
  );
};

export default Services;
