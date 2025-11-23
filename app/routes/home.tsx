import ItemsSection from "~/components/products/ItemsSection";
import EventsSection from "~/components/products/EventsSection";
import FeaturedEventItemsSection from "~/components/products/FeaturedEventItemsSection";
import { useTranslation } from "react-i18next";
import MatchVideo from "~/components/MainPageSlides/MatchVideo";
import TrysovaSlide from "~/components/MainPageSlides/TrysovaSlide";
import FullScreenCarousel from "~/shared/carousel/FullScreenCarousel";
import PartnersSection from "~/components/partners/PartnersSection";
import { useEffect, useState } from "react";

function Home() {
  const { t } = useTranslation();
  const [isClient, setIsClient] = useState(false);
  const [imageWidth, setImageWidth] = useState(0);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const updateVideoWidth = () => {
      const viewportWidth = window.innerWidth;
      const marginXWidth = viewportWidth - 1195;
      // контейнер - левый блок - гэп + отступы по бокам / 2;
      const imgWidth = 1195 - 454 - 103 + marginXWidth / 2;
      setImageWidth(imgWidth);
    };
    updateVideoWidth();
    window.addEventListener("resize", updateVideoWidth);
    return () => {
      window.removeEventListener("resize", updateVideoWidth);
    };
  }, [isClient]);

  return (
    <div className="pb-5">
      <section className="mt-16 sm:mt-20.5 lg:mt-30 ">
        <FullScreenCarousel
          slides={[
            <MatchVideo imageWidth={imageWidth} />,
            <TrysovaSlide imageWidth={imageWidth} />,
          ]}
        />
      </section>
      {/*  */}

      {/* <section className="preview-goods">
        <PreviewGoods />
      </section> */}

      {/* <section className="items-section">
        <ItemsSection />
      </section>

      <section className="events-section">
        <EventsSection />
      </section>

      <section className="featured-event-items-section">
        <FeaturedEventItemsSection />
      </section> */}

      <section className="partners-section mb-4">
        <PartnersSection />
      </section>

      {/* <section className="become-part">
    <BecomePart blockStyles="mt-5 sm:mt-20" />
   </section> */}
      {/* 
   <section className="gaming-goods">
   
     <GamingGoods />
 
   </section>

   <section className="autographed-goods">
   
     <AutographedGoods />
  
   </section>

   <section className="collectible-goods">
   
     <CollectibleGoods />
   
   </section> */}
    </div>
  );
}

export default Home;
