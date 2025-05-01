import React from "react";

const Objectives = () => {
  return (
    <section className="relative z-[2] w-full bg-primaryBlue rounded-[26px] py-[87px] px-[78px] max-w-max mx-auto flex gap-[20px] justify-between">
      <div
        style={{
          backgroundImage: "url(/images/glassbg.svg)",
          backgroundRepeat: "no-repeat",
        }}
        className="h-[460px] w-full max-w-[386px] px-[36px] py-[30px] flex flex-col items-end"
      >
        <img src="/images/objective.svg" alt="objective" />
        <h3 className="self-stretch mt-9 mb-[10px] justify-start text-primaryBlue text-4xl font-bold font-['Montserrat'] leading-loose tracking-tight">
          Objective{" "}
        </h3>
        <div className="self-stretch  justify-start text-PAC-Blue text-sm font-medium font-['Montserrat'] leading-snug tracking-tight">
          To produce analytically ambitious, client/business-focused research in
          a fast-paced environment where time to market is critical.
        </div>
      </div>
      <div
        style={{
          backgroundImage: "url(/images/glassbg.svg)",
          backgroundRepeat: "no-repeat",
        }}
        className="h-[460px] w-full max-w-[337px] px-[36px] py-[30px] flex flex-col items-end"
      >
        <img src="/images/vision.svg" alt="vision" />
        <h3 className="self-stretch mt-9 mb-[10px] justify-start text-primaryBlue text-4xl font-bold font-['Montserrat'] leading-loose tracking-tight">
          Vision{" "}
        </h3>
        <p className="self-stretch  justify-start text-PAC-Blue text-sm font-medium font-['Montserrat'] leading-snug tracking-tight">
          To deliver innovative research products in our industry and be among
          the best research experts in our focus sectors. 
        </p>
      </div>
      <div
        style={{
          backgroundImage: "url(/images/glassbg.svg)",
          backgroundRepeat: "no-repeat",
        }}
        className="h-[460px] w-full max-w-[386px] px-[36px] py-[30px] flex flex-col items-end"
      >
        <img src="/images/mission.svg" alt="mission" />
        <h3 className="self-stretch mt-9 mb-[10px] justify-start text-primaryBlue text-4xl font-bold font-['Montserrat'] leading-loose tracking-tight">
          Mission{" "}
        </h3>
        <p className="self-stretch  justify-start text-PAC-Blue text-sm font-medium font-['Montserrat'] leading-snug tracking-tight">
          To produce timely, creative, and comprehensive research in the
          industry that is built on integrity, objectivity, and exceptional
          service. 
        </p>
      </div>
    </section>
  );
};

export default Objectives;
