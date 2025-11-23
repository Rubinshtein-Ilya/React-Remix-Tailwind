import { useState } from "react";
import type { IItem } from "server/models/Item";
import { cn } from "~/lib/utils";
import CarouselHeading from "~/shared/carousel/CarouselHeading";
import ProductCard from "~/shared/carousel/ProductCard";
import ProductFilter from "~/shared/productFilter/ProductFilter";
import Select from "~/shared/select/Select";
import type { LikeResponse } from "~/types/item";

interface IProps {
  title: string;
  subtitle: string;
  blockStyles?: string;
}

function GoodsCards({ title, subtitle, blockStyles = "pt-10 sm:pt-20" }: IProps) {
  const [selectedValue, setSelectedValue] = useState<string>("");

  return (
    <section className="gaming-goods-cards">
      <div className={cn("container mx-auto flex flex-col gap-y-10 ", blockStyles)}>
        <div className="flex xl:flex-row flex-col justify-between xl:items-center items-start xl:gap-0 gap-2">
          <CarouselHeading title={title} subtitle={subtitle} />
          <div className="flex gap-4">
            <Select onSelect={setSelectedValue} />
            <ProductFilter />
          </div>
        </div>
        <div className="grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2 gap-x-2 gap-y-10">
          {Array(12)
            .fill(null)
            .map((_, index) => (
              <div key={index}>
                <ProductCard product={{} as LikeResponse<IItem>} />
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}

export default GoodsCards;
