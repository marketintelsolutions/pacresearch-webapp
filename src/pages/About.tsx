import React from "react";
import WhoWeAre from "../components/About/WhoWeAre";
import Objectives from "../components/About/Objectives";
import LetsTalk from "../components/Landing/LetsTalk";
import WhyChooseUs from "../components/About/WhyChooseUs";
import CustomResearch from "../components/About/CustomResearch";
import Directors from "../components/About/Directors";
import PageBanner from "../components/Layout/PageBanner";
import MainBackgroundStyles from "../components/Layout/MainBackgroundStyles";
// import { Helmet } from "react-helmet-async";
import { Helmet } from "react-helmet";

const About = () => {
  return (
    <>
      {/* <Helmet>
        <title>aboutjfjf</title>
        <meta name="description" content="test content" data-rh="true" />
        <link rel="canonical" href="/about" />
      </Helmet> */}

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
