import React from "react";

const NewsCommentary = () => {
  return (
    <section className="mt-[98px] px-6 xl:px-0 w-full max-w-[1032px] mx-auto">
      <h1 className="text-center justify-start text-primaryBlue text-2xl md:text-4xl font-bold font-['Montserrat'] leading-[57px] tracking-tight">
        NEWS COMMENTARY
      </h1>
      <p className="self-stretch mt-[18px] text-center justify-start text-primaryBlue text-sm md:text-base font-normal font-['Montserrat'] leading-normal tracking-tight">
        At PAC Research, we go beyond headlines. Our expert team dissects key
        news stories and market developments, offering deeper insights into how
        they affect industries, businesses, and investments. Whether it's a
        shift in monetary policy, emerging market trends, or major corporate
        moves, our news commentary delivers comprehensive analysis, helping you
        understand the bigger picture and make informed decisions. Stay ahead
        with our timely updates and expert takes.{" "}
      </p>

      <div className="mt-10 flex flex-wrap md:flex-nowrap gap-5 justify-between">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            style={{
              backgroundImage: "url(/images/watchthisspace.jpg)",
              backgroundSize: "cover",
            }}
            className="h-[452px] w-full md:max-w-[331px] rounded-[30px]"
          >
            <div className="h-full flex items-end px-5 pb-8 rounded-[30px]  bg-gradient-to-b to-[#00000042] from-[#383838fe]">
              <div className="flex flex-col gap-[15px]">
                <p className="justify-start text-white text-sm font-semibold font-['Montserrat'] leading-normal tracking-tight">
                  27/11/2024
                </p>
                <p className="justify-start text-white text-xl font-medium font-['Montserrat'] leading-loose tracking-tight [text-shadow:_0px_13px_19px_rgb(0_0_0_/_0.24)]">
                  NEWS COMMENTARY
                </p>
                <button className="px-9 py-2.5 bg-sky-500 rounded-[37px] inline-flex flex-col justify-start items-center gap-2.5 overflow-hidden">
                  <span className="text-center justify-start text-white text-sm font-bold font-['Montserrat'] leading-snug tracking-tight">
                    Read More
                  </span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default NewsCommentary;
