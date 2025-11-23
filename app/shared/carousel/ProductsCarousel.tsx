import {useCallback, useEffect, useState} from "react";
import useEmblaCarousel from "embla-carousel-react";
import type { IEvent } from "server/models/Event";
import type { IItem } from "server/models/Item";
import ProductCard from "./ProductCard";
import CarouselPaginationBtns from "../buttons/CarouselPaginationBtns";
import type { LikeResponse } from "~/types/item";
import { cn } from "~/lib/utils";
import { Link } from "react-router";

interface IProps {
  events?: LikeResponse<IEvent>[];
  items?: LikeResponse<IItem>[];
  title?: string;
  titleLink?: string;
  imgSrc?: string;
  options?: {
    id: string;
    label: string;
    value: string;
  }[];
  selectedValue?: string;
  setSelectedValue?: (value: string) => void;
  heading?: "team" | "title" | "btns";
  renderCard?: (item: any, index: number) => React.ReactNode;
  slideWidth?: string;
}

function ProductsCarousel({ ...props }: IProps) {
  const {
    events = [],
    items = [],
    title = "НАЗВАНИЕ КОМАНДЫ/КЛУБА",
    titleLink,
    imgSrc = "/images/products/imageteamLogo.png",
    options = [],
    selectedValue = "",
    setSelectedValue = () => {},
    heading = "team",
    renderCard,
    slideWidth = "18.25rem",
  } = props;

  // Определяем какие данные используем
  const dataItems = events.length > 0 ? events : items;

  // Если нет данных, не рендерим компонент
  if (!dataItems || dataItems.length === 0) {
    return null;
  }

  const [emblaRef, emblaApi] = useEmblaCarousel({
    slidesToScroll: 1,
    align: "start",
    loop: false,
    containScroll: "trimSnaps",
  });

  const [canScroll, setCanScroll] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    if (!emblaApi) return;

    const calculateVisibleSlidesAndScrollState = () => {
      const viewportNode = emblaApi.rootNode();
      const firstSlide = viewportNode.querySelector(".embla__slide") as HTMLElement;

      if (!viewportNode || !firstSlide) return;

      const viewportWidth = viewportNode.getBoundingClientRect().width;
      const slideWidth = firstSlide.getBoundingClientRect().width;

      if (slideWidth === 0) return;

      const visibleCount = Math.floor(viewportWidth / slideWidth);
      setCanScroll(dataItems.length > visibleCount);

      // добавим scroll направления
      console.log(emblaApi.canScrollPrev(), emblaApi.canScrollNext());

      setCanScrollLeft(emblaApi.canScrollPrev());
      setCanScrollRight(emblaApi.canScrollNext());
    };

    // слушаем scroll и resize
    emblaApi.on("select", calculateVisibleSlidesAndScrollState);
    emblaApi.on("reInit", calculateVisibleSlidesAndScrollState);

    calculateVisibleSlidesAndScrollState();

    const resizeObserver = new ResizeObserver(calculateVisibleSlidesAndScrollState);
    resizeObserver.observe(emblaApi.rootNode());

    return () => {
      emblaApi.off("select", calculateVisibleSlidesAndScrollState);
      emblaApi.off("reInit", calculateVisibleSlidesAndScrollState);
      resizeObserver.disconnect();
    };
  }, [emblaApi, dataItems.length]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <div className="container mx-auto">
      <div className="embla pt-4 md:pt-10">
        <div
          className={cn(
            "w-full flex gap-4 justify-between items-center pb-4.5 sm:pb-7",
            {
              "flex-col lg:flex-row items-start lg:items-center":
                heading !== "team",
            }
          )}
        >
          {/* only title */}
          {heading === "title" && (
            <div className="flex justify-between items-center w-full">
              {titleLink ? (
                <Link to={titleLink}>
                  <div className="text-[22px] lg:text-[30px] text-[var(--text-primary)] font-medium leading-16 uppercase">
                    {title}
                  </div>
                </Link>
              ) : (
                <div className="text-[22px] lg:text-[30px] text-[var(--text-primary)] font-medium leading-16 uppercase">
                  {title}
                </div>
              )}
              <div className="lg:hidden">
                <CarouselPaginationBtns
                  canScroll={canScroll}
                  scrollPrev={canScrollLeft ? scrollPrev : undefined}
                  scrollNext={canScrollRight ? scrollNext : undefined}
                  size="sm"
                  containerStyles="flex gap-2"
                />
              </div>
            </div>
          )}
          {/* team name */}
          {heading === "team" && (
            <div className="flex justify-between items-center w-full">
              <div className="flex gap-2 md:gap-4 items-center">
                <div className="w-8 h-8 sm:w-14 sm:h-14 bg-[var(--bg-gray)] rounded-full overflow-hidden">
                  <img src={imgSrc} alt="logo" className="w-full h-full" />
                </div>

                <div className="text-[16px] text-[var(--text-primary)] font-medium">
                  {title}
                </div>
              </div>
              <div className="lg:hidden">
                <CarouselPaginationBtns
                  canScroll={canScroll}
                  scrollPrev={canScrollLeft ? scrollPrev : undefined}
                  scrollNext={canScrollRight ? scrollNext : undefined}
                  size="sm"
                  containerStyles="flex gap-2"
                />
              </div>
            </div>
          )}
          {/* radio buttons */}
          {heading === "btns" && (
            <div className="w-full flex flex-wrap gap-1 sm:gap-4 pb-4 lg:pb-0">
              {setSelectedValue &&
                options.map((option: Record<string, string>) => (
                  <div key={option.id}>
                    <input
                      type="radio"
                      id={option.id}
                      value={option.value}
                      checked={selectedValue === option.value}
                      onChange={() => setSelectedValue(option.value)}
                      className="hidden"
                      name="preview-goods-filter"
                    />
                    <label
                      htmlFor={option.id}
                      className="text-[10px] sm:text-base font-medium uppercase cursor-pointer py-2 px-3 sm:px-7.5 border-1 border-[#121212] border-solid rounded-full"
                      style={
                        selectedValue === option.value
                          ? {
                              color: "var(--text-secondary)",
                              backgroundColor: "var( --bg-dark)",
                            }
                          : {
                              color: "var(--text-primary)",
                              backgroundColor: "var( --bg-primary)",
                            }
                      }
                    >
                      {option.label}
                    </label>
                  </div>
                ))}
            </div>
          )}

          {/* Кнопки для планшетов и десктопа */}
          <div className="hidden lg:block">
            <CarouselPaginationBtns
              canScroll={canScroll}
              scrollPrev={canScrollLeft ? scrollPrev : undefined}
              scrollNext={canScrollRight ? scrollNext : undefined}
            />
          </div>
        </div>

        <div className="embla__viewport overflow-hidden" ref={emblaRef}>
          <div className={`embla__container w-full flex row gap-2`}>
            {dataItems &&
              dataItems.map((item: any, index: number) => (
                <div
                  className={`embla__slide flex-shrink-0 w-[calc(50%-4px)] md:w-[calc(33.333%-5.333px)] lg:max-w-[calc(25%-6px)]`}
                  key={item._id}
                >
                  {renderCard ? (
                    renderCard(item, index)
                  ) : (
                    <ProductCard product={item} />
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductsCarousel;
