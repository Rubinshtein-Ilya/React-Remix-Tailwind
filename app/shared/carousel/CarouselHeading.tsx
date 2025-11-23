interface IProps {
  title: string;
  subtitle: string;
}

function CarouselHeading({ title, subtitle }: IProps) {
  return (
    <div className="flex flex-col gap-1 lg:gap-0">
      <div className="text-2xl sm:text-5xl text-[var(--text-primary)] font-medium leading-6 sm:leading-16 uppercase ">
        {title}
      </div>
      <div className="text-xs sm:text-base text-[var(--text-primary)]  font-medium leading-4 sm:leading-6 ">
        {subtitle}
      </div>
    </div>
  );
}

export default CarouselHeading;
