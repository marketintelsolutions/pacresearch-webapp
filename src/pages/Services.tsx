import React from "react";
import PageBanner from "../components/Layout/PageBanner";
import ServicesDetails from "../components/Services/ServicesDetails";

const Services = () => {
  return (
    <>
      <PageBanner text="OUR SERVICES" />
      <ServicesDetails />
    </>
  );
};

export default Services;
