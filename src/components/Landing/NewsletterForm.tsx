import { X } from "lucide-react";
import React, { useEffect, useState } from "react";

const NewsletterForm = () => {
  const [isOpen, setIsOpen] = useState(true);
  const isNewsLetter = JSON.parse(
    localStorage.getItem("isNewsLetter") as string
  );

  const close = () => {
    setIsOpen(false);
    localStorage.setItem("isNewsLetter", JSON.stringify("closed"));
  };

  useEffect(() => {
    if (isNewsLetter === "closed") {
      setIsOpen(false);
    }
  }, []);
  return (
    <div
      className={`${
        isOpen ? "static" : "hidden"
      } bg-[#FFFFFFBF] fixed rounded-[30px] pt-[37px] pb-[25px] px-[28px]  right-[51px] z-[99] bottom-[36px] w-full max-w-[302px]`}
    >
      <button onClick={close} className="absolute top-5 right-5 ">
        <X />
      </button>
      <h2 className="text-[#000000] font-roboto text-2xl font-semibold">
        Stay Ahead with PAC Research Newsletter 
      </h2>
      <p className="text-[11px] font-normal font-roboto mt-[10px] text-[#000000DE]">
        Subscribe to PAC Research's newsletter for quick updates on market
        trends, expert insights, and key developments. Get the latest delivered
        right to your inbox!
      </p>
      <input
        type="email"
        name="email"
        id="email"
        className="p-[9px] placeholder:text-[#696666] text-[12px] border border-[#D8D8D8] bg-[#F6F6F6] rounded-[2px] w-full mt-5 "
        placeholder="your.email@example.com"
      />
      <input
        type="name"
        name="name"
        id="name"
        className="p-[9px] placeholder:text-[#696666] text-[12px] border border-[#D8D8D8] bg-[#F6F6F6] rounded-[2px] w-full mt-5 "
        placeholder="Your name"
      />
      <button className="bg-[#15BFFD] rounded-[2px] font-medium text-[#000000] py-2.5 text-center w-full text-xs mt-2.5">
        Subscribe
      </button>
      <p className="text-[11px] text-[#000000DE] mt-[10px] ">
        We value your privacy and will never send irrelevant information.
      </p>
    </div>
  );
};

export default NewsletterForm;
