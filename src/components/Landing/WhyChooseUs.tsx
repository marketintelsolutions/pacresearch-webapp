import React, { useState, useEffect, useRef } from "react";
import WhyChooseUsCard from "./WhyChooseUsCard";

// Define the card data interface
interface CardData {
  icon: string;
  text: string;
}

const whyChooseUsData: CardData[] = [
  {
    icon: "think",
    text:
      "We have a deep understanding of industries across different climes, and we are leading industry thoughts diverse subjects.",
  },
  {
    icon: "experience",
    text:
      "We have extensive experience in developing industry reports, specialized reports, macroeconomic reports, market sizing and opportunity assessment. We have developed industry reports and conducted market sizing and assessment for a wide range of clients across several industries including banking, real estate, oil & gas, power, manufacturing, etc.",
  },
  {
    icon: "professional",
    text:
      "We have a team of relevant subject matter experts, and we deliver project team drawn from a pool of experienced professionals who have deep and specialized experience in various markets.",
  },
  {
    icon: "client",
    text:
      "Over the years, we have worked with various private clients, government and regulatory bodies across sectors and have developed a deep understanding of the trends, opportunities and challenges in different sectors.",
  },
  {
    icon: "tool",
    text:
      "Our time-tested tools and methodologies are pivotal in tailor-suiting our services to meet clients' needs.",
  },
  {
    icon: "partners",
    text:
      "We leverage our partnership with industry-leading data providers, people, tools and methodologies to provide world-class service.",
  },
];

const WhyChooseUs: React.FC = () => {
  const [activeCardIndex, setActiveCardIndex] = useState<number | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sectionRef = useRef<HTMLElement | null>(null);

  // Setup card refs
  useEffect(() => {
    cardRefs.current = cardRefs.current.slice(0, whyChooseUsData.length);
  }, []);

  // Set up scroll listener to determine which card is closest to the "sweet spot"
  useEffect(() => {
    // The sweet spot is approximately 40% from the top of the viewport
    const sweetSpotPosition = 0.4;

    const handleScroll = () => {
      if (!cardRefs.current.length) return;

      // Get viewport height
      const viewportHeight = window.innerHeight;
      // Calculate sweet spot position in pixels from the top of the viewport
      const sweetSpotY = viewportHeight * sweetSpotPosition;

      let closestCard = null;
      let closestDistance = Infinity;

      // Check each card's position relative to the sweet spot
      cardRefs.current.forEach((ref, index) => {
        if (!ref) return;

        const rect = ref.getBoundingClientRect();
        // Use the center of the card for measurement
        const cardCenter = rect.top + rect.height / 2;
        // Calculate distance to the sweet spot
        const distance = Math.abs(cardCenter - sweetSpotY);

        // Keep track of the closest card
        if (distance < closestDistance) {
          closestDistance = distance;
          closestCard = index;
        }
      });

      // Update the active card
      if (closestCard !== null && closestCard !== activeCardIndex) {
        setActiveCardIndex(closestCard);
      }
    };

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll);

    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [activeCardIndex]);

  // Create left and right column card arrays
  const leftColumnCards = whyChooseUsData.slice(0, 3);
  const rightColumnCards = whyChooseUsData.slice(3, 6);

  return (
    <section
      ref={sectionRef}
      className="w-full px-6 xl:px-0 max-w-max mx-auto mt-20"
    >
      <h2 className="h-14 text-center justify-start text-primaryBlue text-3xl font-bold font-['Inter'] capitalize leading-[60px]">
        WHY CHOOSE US?
      </h2>

      <div className="mt-[60px] max-w-full mx-auto flex flex-wrap md:flex-nowrap gap-10 justify-between">
        <div className="flex flex-col  gap-[40px] lg:gap-[60px] xl:gap-[126px]">
          {leftColumnCards.map((item, index) => (
            <div
              key={index}
              ref={(el) => (cardRefs.current[index] = el)}
              data-index={index.toString()}
            >
              <WhyChooseUsCard
                {...item}
                right={false}
                isActive={activeCardIndex === index}
              />
            </div>
          ))}
        </div>
        <div className="zr:hidden xl:flex mt-[105px] w-1 bg-primaryBlue h-[887px]"></div>
        <div className="flex flex-col   gap-[40px] lg:gap-[60px] xl:gap-[126px] lg:mt-[185px]">
          {rightColumnCards.map((item, index) => {
            const globalIndex = index + 3;
            return (
              <div
                key={index}
                ref={(el) => (cardRefs.current[globalIndex] = el)}
                data-index={globalIndex.toString()}
                className=""
              >
                <WhyChooseUsCard
                  {...item}
                  right={true}
                  isActive={activeCardIndex === globalIndex}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="w-full rounded-[30px] min-h-[208px] px-6  py-[29px] bg-secondaryBlue mt-[105px]">
        <h2 className="self-stretch  text-center justify-start text-primaryBlue text-3xl font-bold font-['Inter'] leading-snug tracking-tight">
          TRUSTED BY
        </h2>

        <div className="flex flex-wrap md:flex-nowrap items-center gap-10 justify-center mt-[37px]">
          {["pacam", "PACCapital", "PACR", "pacs"].map((item, index) => (
            <div
              key={index}
              className="w-full max-w-[230px]  flex justify-center bg-white rounded-[10px] items-center p-6"
            >
              <img src={`/images/${item}.png`} alt={item} className="w-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
