import React from "react";

const BackgroundStyles = () => {
  return (
    <>
      {/* first glass bubble on the left */}
      <div className="absolute w-full  border-2 border-red-500 left-[-0px]  top-[700px]">
        <div className="w-full max-w-max mx-auto">
          <div className="max-w-[300px] -translate-x-32">
            <img src="/images/bubble.svg" alt="bubble" className="w-full" />
          </div>
        </div>
      </div>

      <div className="absolute top-[500px] right-0 rotate-180">
        <img
          src="/images/eclipselightblue.svg"
          alt="eclipselightblue"
          className="w-full"
        />
      </div>
    </>
  );
};

export default BackgroundStyles;
