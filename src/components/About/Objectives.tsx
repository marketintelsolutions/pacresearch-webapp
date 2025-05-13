import React from "react";

const objectives = [
  {
    image: "objective",
    heading: "Objective",
    text:
      " To produce analytically ambitious, client/business-focused research in a fast-paced environment where time to market is critical.",
  },
  {
    image: "vision",
    heading: "Vision",
    text:
      "To deliver innovative research products in our industry and be among the best research experts in our focus sectors. ",
  },
  {
    image: "mission",
    heading: "Mission",
    text:
      "To produce timely, creative, and comprehensive research in the industry that is built on integrity, objectivity, and exceptional service. ",
  },
];

const Objectives = () => {
  return (
    <section className="relative z-[2] w-full bg-primaryBlue rounded-[10px] md:rounded-[26px] py-[87px] px-6 md:px-[50px] lg:px-[78px] max-w-max mx-auto flex flex-wrap lg:flex-nowrap gap-[20px] items-center justify-center">
      {objectives.map((item, index) => (
        <div
          key={index}
          style={{
            backgroundImage: "url(/images/glassbg.svg)",
            backgroundRepeat: "no-repeat",
          }}
          className="h-[460px]  w-full bg-contain max-w-[337px] px-[36px] py-[30px] flex flex-col items-end"
        >
          <img
            src={`/images/${item.image}.svg`}
            alt="objective"
            className="w-full max-w-[80px] lg:max-w-[90px] xl:max-w-[120px]"
          />
          <h3 className="self-stretch mt-5 md:mt-6 lg:mt-7 xl:mt-9 mb-[10px] justify-start text-primaryBlue text-3xl lg::text-4xl font-bold font-['Montserrat'] leading-loose tracking-tight">
            {item.heading}
          </h3>
          <div className="self-stretch  justify-start text-PAC-Blue text-sm font-medium font-['Montserrat'] leading-snug tracking-tight">
            {item.text}
          </div>
        </div>
      ))}
    </section>
  );
};

export default Objectives;
