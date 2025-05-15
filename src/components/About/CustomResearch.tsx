import React from "react";

const CustomResearch = () => {
  return (
    <section className="w-full max-w-max mx-auto mt-20 px-6 xl:px-0 flex flex-wrap xl:flex-nowrap gap-10 justify-between">
      <div className="flex flex-col gap-[50px] w-full lg:max-w-[598px]">
        <h2 className=" justify-start text-primaryBlue text-3xl font-bold font-['Inter'] capitalize leading-10">
          CUSTOM RESEARCH SERVICES
        </h2>
        <p className="w-full self-stretch  text-justify justify-start text-primaryBlue text-base font-medium font-['Inter'] leading-relaxed tracking-tight">
          At PAC Research we specialize in providing tailored research solutions
          designed to meet your unique business and individual needs. Whether
          you’re seeking in-depth market analysis, industry insights, or
          strategic business advice, our team of experts delivers precise,
          actionable, and timely research to help you make informed decisions.
          We combine analytical rigor with creative solutions to ensure that you
          stay ahead in a rapidly changing market. Our custom research services
          are designed for businesses that require personalized insights to
          drive success and growth.
          <br />
          <br />
          In addition to our custom report offerings, we provide fully tailored
          research solutions to meet the specific needs of our clients across
          all the industries we monitor. We specialize in sectors such as
          finance, healthcare, technology, energy, Agriculture, Hospitality, and
          many more. By understanding the unique dynamics of each industry, we
          deliver research solutions that are specific to your needs, whether
          it’s competitive analysis, market trends, consumer behavior, or
          economic forecasts. No matter your industry, our approach ensures
          comprehensive, actionable insights that drive strategic
          decision-making.
        </p>
      </div>
      <div className=" min-w-96 w-full lg:max-w-[500px] px-8 py-12 bg-primaryBlue rounded-[39.51px]  inline-flex flex-col justify-center items-center gap-4">
        <div
          data-has-description="false"
          data-has-error="false"
          data-has-label="true"
          data-state="Default"
          data-value-type="Placeholder"
          className="w-96 flex flex-col justify-start items-start gap-2.5"
        >
          <p className="self-stretch justify-start text-secondaryBlue text-xl font-normal font-['Inter'] leading-7">
            Name
          </p>
          <input
            type="text"
            name="name"
            id="name"
            className="self-stretch min-w-80 px-5 py-4 bg-white rounded-xl outline outline-[1.32px] outline-offset-[-0.66px] outline-Border-Default-Default inline-flex justify-start items-center overflow-hidden"
          />
        </div>
        <div
          data-has-description="false"
          data-has-error="false"
          data-has-label="true"
          data-state="Default"
          data-value-type="Placeholder"
          className="w-96 flex flex-col justify-start items-start gap-2.5"
        >
          <p className="self-stretch justify-start text-secondaryBlue text-xl font-normal font-['Inter'] leading-7">
            Phone No.
          </p>
          <input
            type="tel"
            name="phone"
            id="phone"
            className="self-stretch min-w-80 px-5 py-4 bg-white rounded-xl outline outline-[1.32px] outline-offset-[-0.66px] outline-Border-Default-Default inline-flex justify-start items-center overflow-hidden"
          />
        </div>
        <div
          data-has-description="false"
          data-has-error="false"
          data-has-label="true"
          data-state="Default"
          data-value-type="Placeholder"
          className="w-96 flex flex-col justify-start items-start gap-2.5"
        >
          <p className="self-stretch justify-start text-secondaryBlue text-xl font-normal font-['Inter'] leading-7">
            Email
          </p>
          <input
            type="email"
            name="email"
            id="email"
            className="self-stretch min-w-80 px-5 py-4 bg-white rounded-xl outline outline-[1.32px] outline-offset-[-0.66px] outline-Border-Default-Default inline-flex justify-start items-center overflow-hidden"
          />
        </div>
        <div
          data-has-description="false"
          data-has-error="false"
          data-has-label="true"
          data-state="Default"
          data-value-type="Placeholder"
          className="w-96 flex flex-col justify-start items-start gap-2.5"
        >
          <p className="self-stretch justify-start text-secondaryBlue text-xl font-normal font-['Inter'] leading-7">
            Message
          </p>
          <textarea
            name="message"
            id="message"
            className="self-stretch min-w-80 min-h-28 px-5 py-4 relative bg-white rounded-xl outline outline-[1.32px] outline-offset-[-0.66px] outline-Border-Default-Default inline-flex justify-start items-start overflow-hidden"
          ></textarea>
        </div>
        <div
          data-align="Justify"
          data-button-end="true"
          data-button-start="false"
          className="w-96 inline-flex justify-start items-center gap-5"
        >
          <button className="flex-1 p-4 bg-secondaryBlue mt-5 hover:bg-transparent border-2 border-secondaryBlue hover:text-secondaryBlue text-white rounded-xl flex justify-center items-center">
            <span className="justify-start  text-xl font-normal font-['Inter'] leading-snug">
              Submit
            </span>
          </button>
        </div>
        <div className="inline-flex justify-start items-center gap-4">
          <input
            type="checkbox"
            name="signup"
            id="signup"
            className="w-5 h-5 bg-zinc-300 rounded-md border-[1.32px] border-secondaryBlue"
          />
          <div className="justify-start text-slate-400 text-sm font-normal font-['Jost']">
            Sign up for our Daily Newsletter (OPTIONAL)
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomResearch;
