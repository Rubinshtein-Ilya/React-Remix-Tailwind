interface IProps {
  imageWidth: number;
}

function TrysovaSlide({ imageWidth }: IProps) {
  return (
    <div className="w-full lg:h-120 bg-[var(--bg-gray)] ">
      <div className="flex flex-col lg:h-120 mx-auto xl:max-w-[1195px] xl:flex-row xl:justify-between 2xl:justify-start gap-25.75">
        <div className="h-full self-center relative mx-auto sm:min-w-113.5 w-full xl:w-113.5 flex-shrink-0 flex flex-col justify-center gap-y-4.5 sm:gap-y-5.25 text-[var(--text-primary)]">
          {/* Изображение для мобильного - теперь не absolute */}
          <div className="xl:hidden w-full h-60 flex-shrink-0">
            <img
              className="w-full h-full object-contain"
              src="/images/banners/trysova-and-ignatov.jpg"
              alt="banner image"
            />
          </div>

          {/* Текст - теперь отдельным блоком под изображением на мобильном */}
          <div className="flex flex-col justify-center gap-y-2 xl:gap-y-4.5 text-[var(--text-primary)] px-4 pt-0 pb-4 xl:px-0">
            <h1 className="hidden lg:block text-[22px] lg:text-[30px] font-medium uppercase">
              Александра Трусова
              <br /> и Макар Игнатов — эксклюзивно на <br />
              Fan's Dream!
            </h1>
            <h1 className="block lg:hidden text-[22px] font-medium uppercase">
              Александра Трусова и Макар Игнатов — эксклюзивно на Fan's Dream!
            </h1>
            <p className="text-[14px] lg:text-[16px] text-pretty">
              Уникальные коньки, экипировка и товары с автографами уже доступны
              для покупки на Fan's Dream.
            </p>
          </div>
        </div>
        <div
          className="shrink-0 hidden xl:block"
          style={{ minWidth: imageWidth }}
        >
          <img
            className="w-full h-full object-contain"
            src="/images/banners/trysova-and-ignatov.jpg"
            alt="banner image"
          />
        </div>
      </div>
    </div>
  );
}

export default TrysovaSlide;
