import React from "react";
import WhoWeAre from "../components/About/WhoWeAre";
import Objectives from "../components/About/Objectives";
import LetsTalk from "../components/Landing/LetsTalk";
import WhyChooseUs from "../components/About/WhyChooseUs";
import CustomResearch from "../components/About/CustomResearch";

const About = () => {
  return (
    <>
      <WhoWeAre />
      <Objectives />
      <CustomResearch />
      <LetsTalk />
      <WhyChooseUs />
    </>
  );
};

export default About;
