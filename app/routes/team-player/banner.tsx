import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useState } from "react";
import { RiArrowRightLongLine } from "@remixicon/react";
import { DotButton, useDotButton } from "~/shared/buttons/CarouselBtns";
import HeartIcon from "~/shared/icons/HeartIcon";
import { type EmblaOptionsType } from "embla-carousel";
import { Button } from "~/shared/buttons/Button";

type Iprops = {
  slides?: number[];
  options?: EmblaOptionsType;
};

const advantages = [
  {
    id: 1,
    title: "12 чемпионских титулов СССР и России",
  },
  {
    id: 2,
    title: "22 победы в Кубке СССР/России",
  },
  {
    id: 3,
    title: "Иконы клуба: Черенков, Тихонов, Титов, Павлюченко",
  },
  {
    id: 4,
    title: "Иконы клуба: Черенков, Тихонов, Титов, Павлюченко",
  },
  {
    id: 5,
    title: "Иконы клуба: Черенков, Тихонов, Титов, Павлюченко",
  },
  {
    id: 6,
    title: "Иконы клуба: Черенков, Тихонов, Титов, Павлюченко",
  },
  {
    id: 7,
    title: "Иконы клуба: Черенков, Тихонов, Титов, Павлюченко",
  },
  {
    id: 8,
    title: "Иконы клуба: Черенков, Тихонов, Титов, Павлюченко",
  },
];

const slides = [
  { id: 1, src: "/images/banners/team-player-img1.png" },
  { id: 2, src: "/images/banners/team-player-img1.png" },
  { id: 3, src: "/images/banners/team-player-img1.png" },
  { id: 4, src: "/images/banners/team-player-img1.png" },
  { id: 5, src: "/images/banners/team-player-img1.png" },
];

function Banner() {
  const [showMore, setShowMore] = useState(false);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 2000, stopOnInteraction: false }),
  ]);

  const { selectedIndex, scrollSnaps, onDotButtonClick } = useDotButton(emblaApi);

  return (
    <div className="w-full  bg-[var(--bg-dark)]  mt-15 sm:mt-20 lg:mt-30 ">
      <div className="xl:w-[1195px] w-full xl:mx-auto lg:px-[1.625rem] xl:px-0  flex flex-col lg:flex-row  items-center justify-start gap-0 lg:gap-10 2xl:gap-28.5">
        <div className="lg:w-113.5 w-full lg:px-0 px-[1.625rem] text-[var(--text-whitesmoke)] shrink-0 py-8 sm:py-19.5">
          <div className="flex items-center gap-x-3.75 mb-7.25">
            <div className="w-8 h-8 sm:w-12.75 sm:h-12.75 rounded-full overflow-hidden">
              <img
                src="/images/products/imageteamLogo.png"
                alt="team logo"
                className="w-full h-full object-cover"
              />
            </div>

            <h1 className="text-2xl sm:text-5xl leading-12 font-medium ">СПАРТАК</h1>
          </div>
          <div>
            <ul className="text-xs sm:text-base list-disc list-inside">
              {(showMore ? advantages : advantages.slice(0, 3)).map((advantage) => (
                <li key={advantage.id}>{advantage.title}</li>
              ))}
            </ul>
            <button
              onClick={() => setShowMore((prev) => !prev)}
              className="uppercase cursor-pointer font-medium text-sm sm:text-[var(--text-secondary)] mt-4.5"
            >
              Показать больше
            </button>
          </div>
          <div className="flex items-center gap-2 mt-4 sm:mt-11">
            <Button
              variant="secondary"
              size="lg"
              // styles="bg-[var(--bg-attention)] text-[var(--text-primary)]"
              className="w-fit px-4 text-sm sm:text-base sm:px-11  py-2 sm:py-5 flex items-center gap-x-4"
            >
              ПОДПИСАТЬСЯ
              <RiArrowRightLongLine size={24} />
            </Button>
            <button
              className={`w-10 h-10 sm:w-16 sm:h-16  p-2 rounded-full  flex items-center justify-center bg-[var(--bg-attention)] shadow-md shadow-black/10 cursor-pointer`}
            >
              <HeartIcon width={24} height={24} color="black" />
            </button>
          </div>
        </div>

        <section className="embla-banner shrink-0  flex-1 self-stretch  2xl:min-w-190.5 relative">
          <div className="embla__viewport h-full w-full overflow-hidden" ref={emblaRef}>
            <div className="embla__container flex gap-x-10  h-full ">
              {slides &&
                slides.map((slide) => (
                  <div className="embla__slide min-w-full" key={slide.id}>
                    <img
                      className=" h-full min-h-full w-full object-cover"
                      src={slide.src}
                      alt="banner image"
                    />
                  </div>
                ))}
            </div>
          </div>

          <div className="embla__controls absolute bottom-7 left-1/2 -translate-x-1/2">
            <div className="embla__dots flex items-center gap-x-1.25">
              {scrollSnaps.map((_, index) => (
                <DotButton
                  key={index}
                  onClick={() => onDotButtonClick(index)}
                  className={"embla__dot w-1.5 h-1.5 rounded-full bg-[#F9B234]".concat(
                    index === selectedIndex ? "  bg-[#CE8400] opacity-50" : ""
                  )}
                />
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Banner;
