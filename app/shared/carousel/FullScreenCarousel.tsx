import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useCallback } from "react";
import CarouselPaginationBtns from "../buttons/CarouselPaginationBtns";

interface IProps {
  slides: React.ReactNode[];
}

function FullScreenCarousel({ ...props }: IProps) {
  const { slides } = props;
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 30_000, stopOnInteraction: false, stopOnMouseEnter: true }),
  ]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <div className="embla-banner  relative">
      <div className="embla__viewport h-full w-full overflow-hidden" ref={emblaRef}>
        <div className="embla__container flex gap-x-10  h-full ">
          {slides &&
            slides.map((slide, index) => (
              <div key={index} className="embla__slide min-w-full max-w-full overflow-hidden">
                {slide}
              </div>
            ))}
        </div>
      </div>
      <div className="relative sm:absolute sm:bottom-15 sm:left-1/2  sm:-translate-x-1/2  xl:-translate-x-1/3 flex justify-center mt-0 lg:mt-2">
        <CarouselPaginationBtns
          btnBg="bg-white"
          iconColor="text-black"
          scrollPrev={scrollPrev}
          scrollNext={scrollNext}
        />
      </div>
    </div>
  );
}

export default FullScreenCarousel;
