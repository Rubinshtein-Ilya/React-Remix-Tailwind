import { useEffect, useState } from "react";

interface IProps {
  imageWidth: number;
}

function MatchVideo({ imageWidth }: IProps) {
  return (
    <div className="w-full lg:h-120 bg-[var(--bg-gray)] ">
      <div className="flex flex-col lg:h-120 mx-auto xl:max-w-[1195px] xl:flex-row xl:justify-between 2xl:justify-start gap-x-25.75">
        <div className="h-full self-center relative sm:min-w-113.5 w-full xl:w-113.5 flex-shrink-0 flex flex-col justify-center gap-y-4.5 sm:gap-y-5.25 text-[var(--text-primary)]">
          {/* Изображение для мобильного - теперь не absolute */}
          <div className="xl:hidden w-full h-60 flex-shrink-0">
            <img
              className="w-full h-full object-contain"
              src="/images/banners/matchGodaSlide.jpg"
              alt="banner image"
            />
          </div>

          {/* Текст - теперь отдельным блоком под изображением на мобильном */}
          <div className="flex flex-col justify-center gap-y-2 xl:gap-y-4.5 text-[var(--text-primary)] px-4 pt-0 pb-4 xl:px-0">
            <h1 className="text-[22px] lg:text-[30px] font-medium uppercase">
              Fan's Dream — партнер Матча года!
            </h1>
            <p className="text-[14px] lg:text-[16px] text-pretty">
              Эксклюзивные лоты от звёзд российского хоккея: Овечкин, Панарин,
              Малкин, Сергачёв, Ковальчук и другие. Матчевые джерси, клюшки,
              краги и товары с автографами — то, о чём мечтает каждый фанат.
            </p>
          </div>
        </div>
        <div
          className="shrink-0 flex-1 hidden xl:block"
          style={{ minWidth: imageWidth }}
        >
          <div
            className="t396__elem tn-elem t396__elem-flex tn-elem__9980435411746053698544 min-w-full"
            data-elem-id="1746053698544"
            data-elem-type="video"
            data-field-top-value="419"
            data-field-left-value="0"
            data-field-height-value="360"
            data-field-width-value="1200"
            data-field-axisy-value="top"
            data-field-axisx-value="left"
            data-field-container-value="grid"
            data-field-topunits-value="px"
            data-field-leftunits-value="px"
            data-field-heightunits-value="px"
            data-field-widthunits-value="px"
            data-field-autoplay-value="y"
            data-field-loop-value="y"
            data-field-mute-value="y"
            data-field-widthmode-value="fill"
            data-field-heightmode-value="fixed"
            data-field-top-res-320-value="310"
            data-field-left-res-320-value="25"
            data-field-height-res-320-value="154"
            data-field-width-res-320-value="270"
            data-field-widthmode-res-320-value="fixed"
            data-field-heightmode-res-320-value="fixed"
            data-field-top-res-640-value="351"
            data-field-left-res-640-value="50"
            data-field-height-res-640-value="304"
            data-field-width-res-640-value="540"
            data-field-widthmode-res-640-value="fixed"
            data-field-heightmode-res-640-value="fixed"
            data-field-top-res-960-value="351"
            data-field-left-res-960-value="200"
            data-field-height-res-960-value="315"
            data-field-width-res-960-value="560"
            data-field-widthmode-res-960-value="fixed"
            data-field-heightmode-res-960-value="fixed"
            data-fields="width,height,top,left,container,axisx,axisy,widthunits,heightunits,leftunits,topunits"
            style={{ height: "480px", left: "0px", top: "419px" }}
          >
            {" "}
            <div
              className="tn-atom"
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: "rgb(0, 0, 0)",
              }}
            >
              {" "}
              <div
                className="tn-atom__videoiframe"
                data-kinescopeid="vMKHrm3cQ5ALWSTmH8ioDR"
                style={{ width: "100%", height: "100%" }}
              >
                <iframe
                  id="kinescope-iframe-998043541-1746053698544"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  allowFullScreen={true}
                  allow="autoplay; encrypted-media; fullscreen; picture-in-picture; screen-wake-lock;"
                  className="t-iframe loaded"
                  data-original="https://kinescope.io/embed/vMKHrm3cQ5ALWSTmH8ioDR?&amp;muted=true&amp;autoplay=true&amp;autopause=false&amp;loop=true"
                  src="https://kinescope.io/embed/vMKHrm3cQ5ALWSTmH8ioDR?&amp;muted=true&amp;autoplay=true&amp;autopause=false&amp;loop=true"
                ></iframe>
              </div>{" "}
            </div>{" "}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MatchVideo;
