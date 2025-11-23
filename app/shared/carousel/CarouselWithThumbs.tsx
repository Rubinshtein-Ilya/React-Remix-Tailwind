import React, { useState, useEffect, useCallback } from "react";
import type { EmblaOptionsType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import { Thumb } from "./CarouselThumbs";
import CarouselPaginationBtns from "../buttons/CarouselPaginationBtns";
import { LikeButton } from "../buttons/LikeButton";
import ExportIcon from "../icons/ExportIcon";
import { ShareDialog } from "~/components/Dialogs/ShareDialog";
import ImageViewerDialog from "~/components/Dialogs/ImageViewerDialog";
import useWindowWidth from "~/utils/useWindowWidth";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";

type PropType = {
  slides: {
    id: number;
    image: string;
  }[];
  options?: EmblaOptionsType;
  sourceId?: string;
  sourceType?: "item" | "team" | "player" | "event";
  isLiked?: boolean;
  shareUrl?: string;
  shareTitle?: string;
};

const CarouselWithThumbs: React.FC<PropType> = (props) => {
  const { slides, options, sourceId, sourceType = "item", isLiked, shareUrl, shareTitle } = props;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const width = useWindowWidth();
  const [emblaMainRef, emblaMainApi] = useEmblaCarousel({
    slidesToScroll: 1,
    align: "start",
    loop: false,
  });
  const [emblaThumbsRef, emblaThumbsApi] = useEmblaCarousel({
    containScroll: "keepSnaps",
    dragFree: true,
  });

  const onThumbClick = useCallback(
    (index: number) => {
      if (!emblaMainApi || !emblaThumbsApi) return;
      emblaMainApi.scrollTo(index);
    },
    [emblaMainApi, emblaThumbsApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaMainApi || !emblaThumbsApi) return;
    setSelectedIndex(emblaMainApi.selectedScrollSnap());
    emblaThumbsApi.scrollTo(emblaMainApi.selectedScrollSnap());
  }, [emblaMainApi, emblaThumbsApi, setSelectedIndex]);

  const scrollPrev = useCallback(() => {
    if (emblaMainApi) emblaMainApi.scrollPrev();
  }, [emblaMainApi]);

  const scrollNext = useCallback(() => {
    if (emblaMainApi) emblaMainApi.scrollNext();
  }, [emblaMainApi]);

  const handleImageClick = useCallback(() => {
    setIsImageViewerOpen(true);
  }, []);

  const handleImageViewerClose = useCallback(() => {
    setIsImageViewerOpen(false);
  }, []);

  const handleImageChange = useCallback(
    (index: number) => {
      setSelectedIndex(index);
      if (emblaMainApi) {
        emblaMainApi.scrollTo(index);
      }
    },
    [emblaMainApi]
  );

  useEffect(() => {
    if (!emblaMainApi) return;
    onSelect();

    emblaMainApi.on("select", onSelect).on("reInit", onSelect);
  }, [emblaMainApi, onSelect]);

  return (
    <div className="embla flex gap-2.5 w-full shrink-0 pb-3 sm:pb-11">
      {/* thumbs */}
      <div className="embla-thumbs hidden xl:block  min-w-32.5 w-32.5">
        <div className="embla-thumbs__viewport h-full" ref={emblaThumbsRef}>
          <div className="embla-thumbs__container flex flex-col gap-2.5 h-full">
            {slides.map((slide, index) => (
              <Thumb
                key={slide.id}
                onClick={() => onThumbClick(index)}
                selected={index === selectedIndex}
                image={slide.image}
                id={slide.id}
              />
            ))}
          </div>
        </div>
      </div>

      {/* main */}

      <div className="embla__viewport overflow-hidden w-full relative" ref={emblaMainRef}>
        <div className="embla__container w-full flex row gap-2" ref={emblaMainRef}>
          {slides.map((slide) => (
            <div
              className="embla__slide flex-shrink-0 w-full aspect-[6/7] bg-white rounded-lg "
              key={slide.id}
            >
              <div className="embla__slide__number h-full grid place-content-center">
                <img
                  src={slide.image}
                  alt="product image"
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={handleImageClick}
                />
              </div>
            </div>
          ))}
        </div>
        {/* pagination btns */}
        <CarouselPaginationBtns
          scrollPrev={scrollPrev}
          scrollNext={scrollNext}
          containerStyles="absolute bottom-7.5 left-1/2 -translate-x-1/2 flex gap-2.75"
          btnBg="bg-[var(--bg-soft-gray)] "
          iconColor="black"
        />
        {/* top btns */}
        <div className="absolute flex items-center justify-between px-6.5 gap-4  w-full bottom-7.5  right-0 lg:bottom-auto  lg:w-fit lg:px-0  lg:top-7.5 lg:right-7.5 pointer-events-none">
          {shareUrl && shareTitle && (
            <Tooltip>
              <TooltipTrigger>
                <div
                  className={`pointer-events-auto w-7.5 h-7.5 sm:w-8.5 sm:h-8.5 p-2 rounded-full hover:scale-105 transition-all hover:shadow-lg hover:shadow-black/20 duration-200 flex items-center justify-center bg-[var(--bg-soft-gray)] shadow-md shadow-black/10 cursor-pointer`}
                  onClick={() => setIsShareDialogOpen(true)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setIsShareDialogOpen(true);
                    }
                  }}
                >
                  <ExportIcon width={18} height={18} color="#121212" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Поделиться</p>
              </TooltipContent>
            </Tooltip>
          )}
          {sourceId && (
            <Tooltip>
              <TooltipTrigger>
                <LikeButton
                  sourceId={sourceId}
                  type={sourceType}
                  size={width && width >= 640 ? "lg" : "sm"}
                  className="pointer-events-auto bg-[var(--bg-soft-gray)] shadow-md shadow-black/10 hover:scale-105 hover:shadow-lg hover:shadow-black/20 transition-all duration-200"
                  isLiked={isLiked}
                  iconColors={{
                    liked: "#ef4444",
                    unliked: "#121212",
                  }}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>Добавить в избранное</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Share Dialog */}
      {shareUrl && shareTitle && (
        <ShareDialog
          isOpen={isShareDialogOpen}
          onClose={() => setIsShareDialogOpen(false)}
          url={shareUrl}
          title={shareTitle}
        />
      )}

      {/* Image Viewer Dialog */}
      <ImageViewerDialog
        isOpen={isImageViewerOpen}
        onClose={handleImageViewerClose}
        images={slides}
        currentIndex={selectedIndex}
        onImageChange={handleImageChange}
      />
    </div>
  );
};

export default CarouselWithThumbs;
