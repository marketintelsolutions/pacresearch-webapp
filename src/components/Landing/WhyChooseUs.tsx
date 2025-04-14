import React from "react";

const WhyChooseUs = () => {
  return (
    <section className="w-full max-w-max mx-auto mt-20">
      <h2 className=" h-14 text-center justify-start text-PAC-Blue text-4xl font-bold font-['Inter'] capitalize leading-[60px]">
        Why Choose Us?
      </h2>

      <div>
        <div className="relative w-full max-w-[520px] h-[250px] py-[5px] pr-[5px]">
          <div className="absolute top-0 right-0 rounded-[12px] bg-gradient-to-r from-[#D7DFFF] via-[#15BFFD] to-[#0467C3] w-[30%] h-[250px] "></div>
          <div className="relative z-[1] p-3 rounded-[10px] bg-[#D7DFFF]  w-full h-full">
            <div className=" rounded-[8px] border border-[#15BFFD] p-6 h-full   flex flex-col gap-4 ">
              <div>
                <img src="/images/think.svg" alt="think" />
              </div>
              <p className="self-stretch h-20 text-justify justify-start text-PAC-Blue text-base font-medium font-['Inter'] leading-snug tracking-tight">
                We have a deep understanding of industries across different
                climes, and we are leading industry thoughts diverse subjects.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
