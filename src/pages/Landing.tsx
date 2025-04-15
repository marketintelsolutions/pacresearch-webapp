import React from "react";
import Banner from "../components/Landing/Banner";
import MacroEco from "../components/Landing/MacroEco";
import LetsTalk from "../components/Landing/LetsTalk";
import WhyChooseUs from "../components/Landing/WhyChooseUs";
import NewsCommentary from "../components/Landing/NewsCommentary";

const Landing = () => {
  return (
    <>
      {/* <PreNav /> */}
      <Banner />
      <MacroEco />
      <LetsTalk />
      <WhyChooseUs />
      <NewsCommentary />
    </>
  );
};

export default Landing;
