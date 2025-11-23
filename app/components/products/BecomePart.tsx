import useEmblaCarousel from "embla-carousel-react";
import { useCallback } from "react";
import { RiArrowLeftLongLine, RiArrowRightLongLine } from "@remixicon/react";
import { NavLink } from "react-router";
import { useTranslation } from "react-i18next";
import { cn } from "~/lib/utils";

const links = [
  {
    title: "become_part.categories.game_items",
    link: "/",
    img: "images/products/grassfield.png",
  },
  {
    title: "become_part.categories.autographed_items",
    link: "/",
    img: "images/products/ball.png",
  },
  {
    title: "become_part.categories.collectible_finds",
    link: "/",
    img: "images/products/cup.png",
  },
  {
    title: "become_part.categories.game_items",
    link: "/",
    img: "images/products/grassfield.png",
  },
  {
    title: "become_part.categories.game_items",
    link: "/",
    img: "images/products/grassfield.png",
  },
];

interface IProps {
  blockStyles?: string;
}

function BecomePart({ ...props }: IProps) {
  const { blockStyles = "pt-5 sm:pt-20" } = props;
  const { t } = useTranslation();
  const [emblaRef, emblaApi] = useEmblaCarousel({
    slidesToScroll: 1,
    align: "start",
    loop: false,
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <section className="become-part">
      <div
        className={cn(
          "pt-9 pb-10 sm:pt-11 sm:pb-20 text-[var(--text-secondary)] bg-[var(--bg-dark)]",
          blockStyles
        )}
      >
        <div className="container">
          <div className="embla">
            {/* heading */}
            <div className="flex flex-col items-start gap-3 sm:gap-6 md:flex-row md:justify-between md:items-center ">
              <div className="text-2xl sm:text-5xl text-[var(--text-secondary)] font-medium leading-12 uppercase">
                {t("become_part.title")}
              </div>

              {/* btns */}
              <div className="flex gap-4 ">
                <button
                  className="embla__prev uppercase"
                  onClick={scrollPrev}
                  style={{ color: "var(--text-primary)" }}
                >
                  <div className="w-8 h-8 sm:w-14 sm:h-14 p-2 rounded-full bg-[var(--bg-attention)] flex items-center justify-center">
                    <RiArrowLeftLongLine size={24} color="var(--text-primary)" />
                  </div>
                </button>
                <button
                  className="embla__next uppercase text-[var(--text-primary)]"
                  onClick={scrollNext}
                >
                  <div className="w-8 h-8 sm:w-14 sm:h-14 p-2 rounded-full bg-[var(--bg-attention)] flex items-center justify-center">
                    <RiArrowRightLongLine size={24} color="var(--text-primary)" />
                  </div>
                </button>
              </div>
            </div>
            {/* carousel */}
            <div className="embla__viewport overflow-hidden mt-8" ref={emblaRef}>
              <div className={`embla__container w-full flex row gap-2`}>
                {links.map((link, index) => (
                  <div
                    className={`embla__slide flex-shrink-0 w-full sm:w-[calc(50%-4px)] lg:w-[calc(33.333%-5.333px)] rounded-lg overflow-hidden`}
                    key={index}
                  >
                    <NavLink to="/" className="w-full h-full">
                      <div className="w-full h-64 relative">
                        <img src={link.img} alt="" className="w-full h-full" />
                        <div className="absolute bg-[var(--bg-dark)] text-[var(--text-secondary)] bottom-5 left-5 text-xs sm:text-xl font-medium uppercase py-2 px-4 rounded-full">
                          {t(link.title)}
                        </div>
                      </div>
                    </NavLink>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default BecomePart;
