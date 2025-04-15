import React from "react";

const SendMessage = () => {
  return (
    <>
      <section className="mt-[90px] h-[649px] bg-primaryBlue flex rounded-[30px] w-full max-w-max mx-auto">
        <div className="flex  w-full max-w-[47%] items-end">
          <img src="/images/woman.png" alt="woman" />
        </div>
        <div className="w-full max-w-[561px]  flex flex-col justify-center gap-10">
          <h2 className="justify-start text-white text-4xl font-bold font-['Montserrat'] leading-normal tracking-tight">
            SEND US A MESSAGE
          </h2>
          <form className="flex flex-col gap-5">
            <div className="flex gap-5">
              <input
                type="text"
                className="w-full rounded-full py-[11px] px-5 text-sm bg-[#F9F9F9] text-[#737373] border-[#E6E6E6]"
                placeholder="Full Name"
                name="fullname"
              />
              <input
                type="email"
                name="email"
                className="w-full rounded-full py-[11px] px-5 text-sm bg-[#F9F9F9] text-[#737373] border-[#E6E6E6]"
                placeholder="Email"
              />
            </div>
            <div className="flex gap-5">
              <div className="w-full rounded-full py-[11px] px-5 text-sm bg-[#F9F9F9] text-[#737373] border-[#E6E6E6]">
                <select
                  name="reason"
                  id="reason"
                  className="bg-transparent w-full"
                >
                  <option value="select">Please Select</option>
                </select>
              </div>
              <div className="w-full rounded-full py-[11px] px-5 text-sm bg-[#F9F9F9] text-[#737373] border-[#E6E6E6]">
                <select
                  name="reason"
                  id="reason"
                  className="bg-transparent w-full"
                >
                  <option disabled value="select">
                    9:00 AM
                  </option>
                </select>
              </div>
            </div>
            <textarea
              name="message"
              id="message"
              className="w-full h-[140px] rounded-[16px] py-[11px] px-5 text-sm bg-[#F9F9F9] text-[#737373] border-[#E6E6E6]"
            ></textarea>
          </form>
        </div>
      </section>
      <section className="relative w-full max-w-max mx-auto bg-white mt-[56px] px-[70px] py-10 rounded-[30px] flex items-center gap-32">
        <div className="flex flex-col gap-2.5">
          <h2 className="justify-start text-slate-800 text-2xl font-bold font-['Montserrat'] leading-loose tracking-tight">
            Consulting Agency For Your Business
          </h2>
          <p className="justify-start text-neutral-500 text-sm font-medium font-['Montserrat'] leading-tight tracking-tight">
            the quick fox jumps over the lazy dog
          </p>
        </div>
        <button className="px-10 py-3.5 bg-secondaryBlue h-fit rounded-[30px] inline-flex flex-col justify-start items-center gap-2.5 overflow-hidden">
          <span className="text-center justify-start text-white text-sm font-bold font-['Montserrat'] leading-snug tracking-tight">
            Contact Us
          </span>
        </button>
        <div className="absolute right-0 -top-6">
          <img src="/images/monitor.svg" alt="monitor" />
        </div>
      </section>
    </>
  );
};

export default SendMessage;
