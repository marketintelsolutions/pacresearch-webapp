import React from "react";
import WhoWeAre from "../components/About/WhoWeAre";
import Objectives from "../components/About/Objectives";
import LetsTalk from "../components/Landing/LetsTalk";
import WhyChooseUs from "../components/About/WhyChooseUs";
import CustomResearch from "../components/About/CustomResearch";
import Directors from "../components/About/Directors";
import PageBanner from "../components/Layout/PageBanner";

const About = () => {
  return (
    <>
      <PageBanner text="ABOUT US" />
      <WhoWeAre />
      <Objectives />
      <CustomResearch />
      <LetsTalk />
      <WhyChooseUs />
      <Directors />
    </>
  );
};

export default About;
