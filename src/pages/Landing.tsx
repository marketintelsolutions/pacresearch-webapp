import React from "react";
import Banner from "../components/Landing/Banner";
import MacroEco from "../components/Landing/MacroEco";
import LetsTalk from "../components/Landing/LetsTalk";
import WhyChooseUs from "../components/Landing/WhyChooseUs";
import NewsCommentary from "../components/Landing/NewsCommentary";
import SendMessage from "../components/Layout/SendMessage";
import NewsletterForm from "../components/Landing/NewsletterForm";

const Landing = () => {
  return (
    <>
      {/* <PreNav /> */}

      <Banner />
      <MacroEco />
      <LetsTalk />
      <NewsCommentary />
      <WhyChooseUs />
      {/* <SendMessage /> */}
    </>
  );
};

export default Landing;
