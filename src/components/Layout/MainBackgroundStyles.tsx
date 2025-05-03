import React from "react";

const MainBackgroundStyles = () => {
  return (
    <>
      {/* eclipse */}
      <div className="w-full max-w-[356px] absolute top-0 left-0">
        <img
          src="/images/eclipselightblue.svg"
          alt="eclipselightblue"
          className="w-full "
        />
      </div>
      {/* faint blue eclipse */}
      <div className="w-full max-w-[356px] absolute top-0 right-0 rotate-90">
        <img
          src="/images/eclipselightblue.svg"
          alt="eclipselightblue"
          className="w-full "
        />
      </div>
      {/* star */}
      <div className="w-full max-w-[35px] absolute top-[160px] right-[60px] ">
        <img src="/images/star.svg" alt="star" className="w-full " />
      </div>
    </>
  );
};

export default MainBackgroundStyles;
