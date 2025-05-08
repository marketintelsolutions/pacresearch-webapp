import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  fetchCategories,
  fetchFiles,
  setSelectedCategory,
} from "../../store/resourcesSlice";

const ResourcesBottom: React.FC = () => {
  const dispatch = useAppDispatch();
  const { categories, files, selectedCategory, loading } = useAppSelector(
    (state) => ({
      categories: state.resources.categories,
      files: state.resources.files,
      selectedCategory: state.resources.selectedCategory,
      loading: state.resources.loading,
    })
  );

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (selectedCategory) {
      dispatch(fetchFiles(selectedCategory));
    }
  }, [dispatch, selectedCategory]);

  const handleCategoryClick = (categoryId: string) => {
    dispatch(setSelectedCategory(categoryId));
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const month = date.toLocaleString("default", { month: "long" });
    const day = date.getDate();
    const year = date.getFullYear();

    return `${month} ${day}${getOrdinalSuffix(day)} ${year}`;
  };

  const getOrdinalSuffix = (day: number): string => {
    if (day > 3 && day < 21) return "th";
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  // Get a representative icon for the category (first file's icon or default)
  const getCategoryIcon = (categoryId: string): string => {
    // For selected category, show default uploadwhite icon
    if (selectedCategory === categoryId) {
      return "uploadwhite";
    }

    // Find a file with this category and use its icon, defaulting to uploadwhite
    const fileInCategory = files.find((file) => file.category === categoryId);
    return fileInCategory?.icon || "uploadwhite";
  };

  if (loading.categories && categories.length === 0) {
    return (
      <section className="w-full max-w-max mx-auto mt-[60px] flex justify-center">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-slate-200 h-10 w-10"></div>
          <div className="flex-1 space-y-6 py-1">
            <div className="h-2 bg-slate-200 rounded"></div>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <div className="h-2 bg-slate-200 rounded col-span-2"></div>
                <div className="h-2 bg-slate-200 rounded col-span-1"></div>
              </div>
              <div className="h-2 bg-slate-200 rounded"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full max-w-max mx-auto mt-[60px] flex gap-[25px]">
      <div className="flex flex-col gap-[25px] w-full max-w-[384px]">
        {categories.map((category) => (
          <div
            key={category.id}
            style={{
              backgroundImage: "url(/images/bluecutbg.svg)",
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
            }}
            className={`flex items-center justify-between w-full max-w-[384px] h-[94px] pl-[25px] pr-[50px] py-[19px] cursor-pointer ${
              selectedCategory === category.id
                ? "opacity-100"
                : "opacity-70 hover:opacity-100"
            }`}
            onClick={() => handleCategoryClick(category.id)}
          >
            <div className="flex items-center gap-4">
              <div className="p-[15px] bg-[#15BFFD] rounded-full">
                <img
                  // src={`/images/${getCategoryIcon(category.id)}.svg`}
                  src={`/images/uploadwhite.svg`}
                  alt={category.name}
                />
              </div>
              <p className="justify-start uppercase text-white text-base font-bold font-['Inter'] leading-normal">
                {category.name}
              </p>
            </div>
            {selectedCategory === category.id ? (
              <span>
                <img src="/images/downwhite.svg" alt="selected" />
              </span>
            ) : (
              <p className="text-center justify-start text-secondaryBlue text-xl font-medium font-['Inter'] underline leading-loose">
                view
              </p>
            )}
          </div>
        ))}
        {/* <div className="w-40 self-end h-12 px-8 py-6 bg-[#15284A] rounded-3xl outline outline-1 outline-offset-[-1px] outline-[#15284A] inline-flex justify-center items-center cursor-pointer">
          <span className="text-center justify-center text-white text-sm font-normal font-['Inter']">
            View All Files
          </span>
        </div> */}
      </div>

      {selectedCategory && (
        <div
          style={{
            backgroundImage: "url(/images/whitecutbg.svg)",
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
          }}
          className="relative w-full py-[77px] px-[31px] max-w-[801px] h-[680px] mt-[48px]"
        >
          <div
            style={{
              backgroundImage: "url(/images/bluecutbg.svg)",
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
            }}
            className="absolute left-9 -top-12 flex items-center justify-between w-full max-w-[384px] h-[94px] pl-[25px] pr-[50px] py-[19px]"
          >
            <div className="flex items-center gap-4">
              <div className="p-[15px] bg-[#15BFFD] rounded-full">
                <img
                  src={`/images/uploadwhite.svg`}
                  alt={
                    categories.find((cat) => cat.id === selectedCategory)
                      ?.name || "Resource"
                  }
                />
              </div>
              <p className="justify-start uppercase text-white text-base font-bold font-['Inter'] leading-normal">
                {categories.find((cat) => cat.id === selectedCategory)?.name ||
                  "Resources"}
              </p>
            </div>
            <span>
              <img src="/images/downwhite.svg" alt="downwhite" />
            </span>
          </div>

          <div className="flex gap-[30px] items-center">
            <p className="justify-center text-color-black-solid text-sm font-normal font-['Inter'] capitalize">
              Total
            </p>
            <div className="px-2 py-1.5 bg-primaryBlue rounded-[3px] inline-flex justify-start items-start">
              <span className="justify-center text-white text-base font-normal font-['Inter'] capitalize">
                {files.length}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-[25px] mt-[43px] max-h-[450px] overflow-auto">
            {loading.files ? (
              Array.from({ length: 4 }, (_, index) => (
                <div
                  key={index}
                  className="py-4 px-[19px] w-full max-w-[354px] h-[96px] bg-gray-100 rounded-lg animate-pulse"
                ></div>
              ))
            ) : files.length === 0 ? (
              <div className="col-span-2 text-center py-6">
                <p className="text-gray-500">
                  No files found in this category.
                </p>
              </div>
            ) : (
              files.map((file) => (
                <div
                  key={file.id}
                  className="relative p-[1px] w-full max-w-[354px] overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#15BFFD] to-[#9C37FD] rounded-[5px]"></div>
                  <div className="absolute z-[2] -bottom-10 -right-10 w-[70px] h-[70px] rotate-[50deg] border border-[#9C37FD] bg-white"></div>
                  <div
                    style={
                      {
                        // backgroundImage: "url(/images/filebg.svg)",
                        // backgroundSize: "contain",
                        // backgroundRepeat: "no-repeat",
                      }
                    }
                    className="relative bg-white z-1 py-4 px-[19px] w-full rounded-[4px] h-full min-h-[96px] flex gap-[33px]"
                  >
                    <div className="p-[11.5px] h-fit bg-primaryBlue w-fit rounded-full">
                      <img
                        src={`/images/${file.icon}.svg`}
                        alt="file"
                        className="w-full max-w-[40px]"
                      />
                    </div>
                    <div className="flex flex-col gap-[18px] w-full max-w-[190px]">
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="self-stretch  break-words justify-center text-PAC-Blue text-base font-bold font-['Inter'] capitalize hover:underline"
                      >
                        {file.name}
                      </a>
                      <div className="flex justify-between">
                        <img src="/images/calendar.svg" alt="calendar" />
                        <span className="justify-center text-PAC-Blue text-sm font-normal font-['Inter']">
                          {formatDate(file.uploadDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default ResourcesBottom;
