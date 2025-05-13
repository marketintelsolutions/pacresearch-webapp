import React, { useEffect, useState } from "react";

const MainBackgroundStyles = () => {
  const [path, setPath] = useState("");

  const { pathname } = window.location;
  console.log(pathname);

  useEffect(() => {
    setPath(pathname);
  }, [pathname]);

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
      {/* star top right */}
      <div className=" w-full  absolute  top-[160px]">
        <div className="w-full max-w-max relative mx-auto">
          <div className="zr:hidden md:flex w-full max-w-[32px] absolute top-[0px] right-0 xl:-right-[60px] ">
            <img src="/images/star.svg" alt="star" className="w-full " />
          </div>
        </div>
      </div>
      {/* star right one */}
      <div className="zr:hidden md:flex w-full  absolute top-[1010px]">
        <div className="w-full max-w-max relative mx-auto">
          <div className="w-full max-w-[30px] absolute top-[0px] right-0 xl:-right-[60px] ">
            <img src="/images/star.svg" alt="star" className="w-full " />
          </div>
        </div>
      </div>

      {/* stroke */}
      <div className="w-full max-w-[512px] absolute top-[280px] right-[0px] ">
        <img src="/images/stroke.svg" alt="star" className="w-full " />
      </div>
      {/* blue patch right one */}
      <div className="w-full max-w-[356px] absolute top-[882px] -right-[0px] ">
        <img
          src="/images/bluepatchrightone.svg"
          alt="star"
          className="w-full "
        />
      </div>

      {/* blue patch left one */}
      <div className="w-full max-w-[356px] absolute top-[1265px] -left-[0px] ">
        <img
          src="/images/bluepatchleftone.svg"
          alt="star"
          className="w-full "
        />
      </div>

      {/* DO NOT SHOW ON ADMIN */}
      {!pathname.split("/").includes("admin") && (
        <>
          {/* star right two */}
          {/* do not show on services and resources and contact */}
          {pathname !== "/services" &&
            pathname !== "/resources" &&
            pathname !== "/contact" && (
              <div className="w-full  absolute top-[4293px]">
                <div className="w-full max-w-max relative mx-auto">
                  <div className="w-full max-w-[24px] absolute top-0 right-0 xl:-right-[60px] ">
                    <img
                      src="/images/star.svg"
                      alt="star"
                      className="w-full "
                    />
                  </div>
                </div>
              </div>
            )}

          {/* blue patch left two */}
          {/* do not show on resources and contact */}
          {pathname !== "/resources" && pathname !== "/contact" && (
            <div className="w-full max-w-[356px] absolute top-[2065px] -left-[0px] ">
              <img
                src="/images/bluepatchleftone.svg"
                alt="star"
                className="w-full "
              />
            </div>
          )}
          {/* blue patch left three */}
          {/* do not show on services and resources and contact */}
          {pathname !== "/services" &&
            pathname !== "/resources" &&
            pathname !== "/contact" && (
              <div className="w-full max-w-[356px] absolute top-[3837px] -left-[0px] ">
                <img
                  src="/images/bluepatchleftone.svg"
                  alt="star"
                  className="w-full "
                />
              </div>
            )}
          {/* blue patch left four */}
          {/* show only on landing */}
          {/* {pathname === "/" && (
            <div className="w-full max-w-[356px] absolute top-[5233px] -left-[0px] ">
              <img
                src="/images/bluepatchleftone.svg"
                alt="star"
                className="w-full "
              />
            </div>
          )} */}

          {/* blue patch right two */}
          {/* do not show on resources and contact */}
          {pathname !== "/resources" && pathname !== "/contact" && (
            <div className="w-full max-w-[356px] absolute top-[3126px] -right-[0px] ">
              <img
                src="/images/bluepatchrightone.svg"
                alt="star"
                className="w-full "
              />
            </div>
          )}
          {/* blue patch right three */}
          {/* do not show on services and resources and contact */}
          {pathname !== "/services" &&
            pathname !== "/resources" &&
            pathname !== "/contact" && (
              <div className="w-full max-w-[356px] absolute top-[4166px] -right-[0px] ">
                <img
                  src="/images/bluepatchrightone.svg"
                  alt="star"
                  className="w-full "
                />
              </div>
            )}
          {/* blue patch right four */}
          {/* show only on landing */}
          {/* {pathname === "/" && (
            <div className="w-full max-w-[356px] absolute top-[5572px] -right-[0px] ">
              <img
                src="/images/bluepatchrightone.svg"
                alt="star"
                className="w-full "
              />
            </div>
          )} */}
        </>
      )}
    </>
  );
};

export default MainBackgroundStyles;
