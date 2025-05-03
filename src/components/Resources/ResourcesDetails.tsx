import React from "react";

const ResourcesDetails = () => {
  return (
    <section>
      <div
        style={{
          backgroundImage: "url(/images/resourcebannerbg.svg)",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
        className="w-full max-w-max h-[474px] mx-auto mt-[60px] py-[94px] px-[66px] flex gap-[51px]"
      >
        <div
          style={{
            backgroundImage: "url(/images/whitecurvedbg.svg)",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
          }}
          className="relative min-w-[305px] h-[277px] flex flex-col justify-end pb-[70px]"
        >
          <div className="absolute top-0 left-0 w-full flex justify-center">
            <div className=" py-[29px] px-[26px] rounded-full bg-[#D9D9D9] w-fit -translate-y-[29px]">
              <img src="/images/wallet.svg" alt="wallet" />
            </div>
          </div>
          <h3 className="w-full text-center justify-start text-primaryBlue text-base font-bold font-['Inter'] leading-normal">
            Total file
          </h3>
          <p className="text-center mt-[22px] justify-start text-secondaryBlue text-xl font-medium font-['Inter'] underline leading-loose">
            VIEW ALL FILE
          </p>
        </div>
        <div className="w-full grid grid-cols-2 ">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className="flex items-center justify-between w-full max-w-[306px]"
            >
              <div className="flex items-center gap-4">
                <div className="p-[15px] bg-[#15BFFD] rounded-full">
                  <img src="/images/upload.svg" alt="upload" />
                </div>
                <p className=" justify-start text-white text-base font-bold font-['Inter'] leading-normal">
                  PRICELIST
                </p>
              </div>
              <p className="text-center justify-start text-secondaryBlue text-xl font-medium font-['Inter'] underline leading-loose">
                view
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ResourcesDetails;
