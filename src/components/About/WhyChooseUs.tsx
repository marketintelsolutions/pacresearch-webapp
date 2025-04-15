import React from "react";

const WhyChooseUs = () => {
  return (
    <section className="flex gap-[67px] w-full max-w-max mx-auto mt-[50px] items-center">
      <div className="w-full max-w-[445px]">
        <img
          src="/images/whychooseus.png"
          alt="whychooseus"
          className="w-full"
        />
      </div>
      <div>
        <h3 className="max-w-[551px] h-14 justify-start text-PAC-Blue text-4xl font-bold font-['Inter'] capitalize leading-[60px]">
          Why Choose Us?
        </h3>
        <p className="self-stretch mt-6  text-justify justify-start text-PAC-Blue text-base font-medium font-['Inter'] leading-snug tracking-tight">
          <br />· We have a deep understanding of industries across different
          climes, and we are leading industry thoughts diverse subjects.
          <br />
          <br />· Over the years, we have worked with various private clients,
          government and regulatory bodies across sectors and have developed a
          deep understanding of the trends, opportunities and challenges in
          different sectors.
          <br />
          <br />· We have extensive experience in developing industry reports,
          specialized reports, macroeconomic reports, market sizing and
          opportunity assessment. We have developed industry reports and
          conducted market sizing and assessment for a wide range of clients
          across several industries including banking, real estate, oil & gas,
          power, manufacturing, etc.
          <br />
          <br />· Our time-tested tools and methodologies are pivotal in
          tailor-suiting our services to meet clients’ needs.
          <br />
          <br />· We have a team of relevant subject matter experts, and we
          deliver project team drawn from a pool of experienced professionals
          who have deep and specialized experience in various markets.
          <br />
          <br />
          We leverage our partnership with industry-leading data providers,
          people, tools and methodologies to provide world-class service.
        </p>
      </div>
    </section>
  );
};

export default WhyChooseUs;
