import React from "react";

const SendMessage = () => {
  return (
    <section className="mt-[90px] h-[649px] bg-primaryBlue flex rounded-[30px] w-full max-w-max mx-auto">
      <div className="flex items-end">
        <img src="/images/woman.png" alt="woman" />
      </div>
      <div className="w-full max-w-[601px]">
        <h2 className="justify-start text-white text-4xl font-bold font-['Montserrat'] leading-normal tracking-tight">
          SEND US A MESSAGE
        </h2>
      </div>
    </section>
  );
};

export default SendMessage;
