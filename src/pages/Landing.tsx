import React from "react";
import PreNav from "../components/Layout/PreNav";
import Banner from "../components/Landing/Banner";
import MacroEco from "../components/Landing/MacroEco";
import LetsTalk from "../components/Landing/LetsTalk";
import WhyChooseUs from "../components/Landing/WhyChooseUs";
import NewsCommentary from "../components/Landing/NewsCommentary";
import SendMessage from "../components/Landing/SendMessage";

const Landing = () => {
  return (
    <>
      {/* <PreNav /> */}
      <Banner />
      <MacroEco />
      <LetsTalk />
      <WhyChooseUs />
      <NewsCommentary />
      <SendMessage />
    </>
  );
};

export default Landing;
