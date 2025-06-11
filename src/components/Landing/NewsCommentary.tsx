import React, { useState, useEffect } from "react";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

interface NewsCommentaryItem {
  id: string;
  title: string;
  description: string;
  interviewer: string;
  videoUrl: string;
  thumbnailUrl: string;
  displayOrder: number;
  isActive: boolean;
}

const NewsCommentary: React.FC = () => {
  const [newsItems, setNewsItems] = useState<NewsCommentaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNewsItems = async () => {
      try {
        const q = query(
          collection(db, "newsCommentary"),
          where("isActive", "==", true),
          orderBy("displayOrder", "asc")
        );

        const querySnapshot = await getDocs(q);
        const items: NewsCommentaryItem[] = [];

        querySnapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() } as NewsCommentaryItem);
        });

        setNewsItems(items.slice(0, 3)); // Limit to 3 items
      } catch (err) {
        console.error("Error fetching news commentary:", err);
        setError("Failed to load news commentary");
      } finally {
        setLoading(false);
      }
    };

    fetchNewsItems();
  }, []);

  const handleVideoClick = (videoUrl: string) => {
    window.open(videoUrl, "_blank");
  };

  const getYouTubeThumbnail = (url: string): string => {
    // Extract video ID from YouTube URL and get high quality thumbnail
    const videoId = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
    )?.[1];
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
    return url; // Fallback to custom thumbnail
  };

  if (loading) {
    return (
      <section className="mt-[98px] px-6 xl:px-0 w-full max-w-[1032px] mx-auto">
        <h1 className="text-center justify-start text-primaryBlue text-2xl md:text-4xl font-bold font-['Montserrat'] leading-[57px] tracking-tight">
          NEWS COMMENTARY
        </h1>
        <div className="mt-10 flex justify-center">
          <div className="text-gray-500">Loading news commentary...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mt-[98px] px-6 xl:px-0 w-full max-w-[1032px] mx-auto">
        <h1 className="text-center justify-start text-primaryBlue text-2xl md:text-4xl font-bold font-['Montserrat'] leading-[57px] tracking-tight">
          NEWS COMMENTARY
        </h1>
        <div className="mt-10 flex justify-center">
          <div className="text-red-500">{error}</div>
        </div>
      </section>
    );
  }

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
        with our timely updates and expert takes.
      </p>

      <div className="mt-10 flex flex-wrap md:flex-nowrap gap-5 justify-between">
        {newsItems.length > 0
          ? newsItems.map((item) => (
              <div
                key={item.id}
                style={{
                  backgroundImage: `url(${
                    item.thumbnailUrl || getYouTubeThumbnail(item.videoUrl)
                  })`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
                className="h-[452px] w-full md:max-w-[331px] rounded-[30px] cursor-pointer transition-transform hover:scale-105"
                onClick={() => handleVideoClick(item.videoUrl)}
              >
                <div className="h-full flex items-end px-5 pb-8 rounded-[30px] bg-gradient-to-b to-[#00000042] from-[#383838fe]">
                  <div className="flex flex-col gap-[15px]">
                    <div className="h-1.5 w-[65%] bg-white rounded-full"></div>
                    <p className="justify-start text-white text-xl font-medium font-['Montserrat'] leading-loose tracking-tight [text-shadow:_0px_13px_19px_rgb(0_0_0_/_0.24)]">
                      {item.title} - <span>{item.interviewer}</span>
                    </p>
                    <button
                      className="px-9 py-2.5 bg-sky-500 rounded-[37px] inline-flex flex-col justify-start items-center gap-2.5 overflow-hidden hover:bg-sky-600 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVideoClick(item.videoUrl);
                      }}
                    >
                      <span className="text-center justify-start text-white text-sm font-bold font-['Montserrat'] leading-snug tracking-tight">
                        Watch Now
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          : // Fallback for when no items are available
            Array.from({ length: 3 }, (_, index) => (
              <div
                key={index}
                style={{
                  backgroundImage: "url(/images/watchthisspace.jpg)",
                  backgroundSize: "cover",
                }}
                className="h-[452px] w-full md:max-w-[331px] rounded-[30px]"
              >
                <div className="h-full flex items-end px-5 pb-8 rounded-[30px] bg-gradient-to-b to-[#00000042] from-[#383838fe]">
                  <div className="flex flex-col gap-[15px]">
                    <div className="h-1.5 w-[65%] bg-white rounded-full"></div>
                    <p className="justify-start text-white text-xl font-medium font-['Montserrat'] leading-loose tracking-tight [text-shadow:_0px_13px_19px_rgb(0_0_0_/_0.24)]">
                      Coming Soon - Watch This Space
                    </p>
                    <button className="px-9 py-2.5 bg-gray-500 rounded-[37px] inline-flex flex-col justify-start items-center gap-2.5 overflow-hidden opacity-50 cursor-not-allowed">
                      <span className="text-center justify-start text-white text-sm font-bold font-['Montserrat'] leading-snug tracking-tight">
                        Coming Soon
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
