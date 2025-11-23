import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useParams,
  useNavigate,
  type LoaderFunction,
  type MetaFunction,
  redirect,
  useLoaderData,
} from "react-router";
import InfoBlock from "~/shared/accordions/InfoBlock";
import BetsAccordion from "~/shared/accordions/BetsAccordion";
import CarouselWithThumbs from "~/shared/carousel/CarouselWithThumbs";
import { useItem, useItemBids, usePlayer } from "~/queries/public";
import { ItemService } from "server/services/ItemService";
import { extractIdFromSlug } from "~/utils/slugUtils";
import type { IItem } from "server/models/Item";
import type { LikeResponse } from "~/types/item";
import { UserLikeService } from "server/services/UserLikeService";
import { Button } from "~/shared/buttons/Button";
import useWindowWidth from "~/utils/useWindowWidth";
import { RiArrowRightLongLine } from "@remixicon/react";
import { useItemDeliveryTariffs } from "~/queries/delivery";
import { useUser } from "~/queries/auth";
import { AppButton } from "~/shared/buttons/AppButton";
import type { User, UserAddress } from "~/types/user";
import { useAddAddress, useUpdateAddress } from "~/queries/user";
import { AddressDialog } from "~/components/Dialogs/AddressDialog";
import { YandexConfigProvider } from "~/contexts/YandexConfigContext";
import { getYandexConfig } from "~/loaders/yandexConfig";
import ProductInfoBlock from "~/components/products/ProductInfoBlock";

export const loader: LoaderFunction = async ({ request, context }) => {
  try {
    const url = new URL(request.url);
    const itemId = extractIdFromSlug(url.pathname);
    const item = await new ItemService().getById(itemId || "");
    if (context.user) {
      await new UserLikeService().applyLikeToSource((context.user as any)._id.toString(), item);
    }

    // Получаем конфигурацию Яндекс
    const yandexConfig = await getYandexConfig();

    return {
      item: item.toJSON(),
      yandexConfig,
    };
  } catch (err) {
    console.error(err);
    return redirect("/");
  }
};

export const meta: MetaFunction = ({ data }) => {
  const loaderData = data as { item?: LikeResponse<IItem> };

  if (!loaderData?.item) {
    return [
      { title: "Товар не найден | Fan's Dream" },
      { description: "Запрашиваемый товар не найден" },
    ];
  }

  const item = loaderData.item;
  const title = `${item.title} | Fan's Dream`;
  const description =
    item.description ||
    `Эксклюзивный товар. Аутентичная спортивная атрибутика с гарантией подлинности.`;

  return [
    { title },
    { description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "product" },
    {
      property: "og:image",
      content: item.images?.[0] || "/default-product-image.jpg",
    },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    {
      name: "twitter:image",
      content: item.images?.[0] || "/default-product-image.jpg",
    },
    { name: "product:price:amount", content: item.price?.toString() || "0" },
    { name: "product:price:currency", content: "RUB" },
  ];
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
};

function SingleProduct() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { item: initItem, yandexConfig } = useLoaderData<{
    item: LikeResponse<IItem>;
    yandexConfig: { apiKey: string; mapApiKey: string };
  }>();
  const width = useWindowWidth();
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | undefined>();

  const id = extractIdFromSlug(slug || "");

  const addAddressMutation = useAddAddress();
  const updateAddressMutation = useUpdateAddress();
  const { user, refetch: refetchUser } = useUser();

  const handleAddAddress = () => {
    setEditingAddress(undefined);
    setShowAddressDialog(true);
  };

  const handleEditAddress = (address: UserAddress) => {
    setEditingAddress(address);
    setShowAddressDialog(true);
  };

  const handleCloseAddressDialog = () => {
    setShowAddressDialog(false);
    setEditingAddress(undefined);
  };

  const handleSaveAddress = (addressData: {
    name: string;
    street: string;
    city: string;
    country: string;
    postalCode: string;
  }) => {
    if (editingAddress && editingAddress._id) {
      // Редактирование существующего адреса
      updateAddressMutation.mutate(
        { addressId: editingAddress._id, addressData },
        {
          onSuccess: () => {
            handleCloseAddressDialog();
            // Принудительно обновляем данные пользователя
            refetchUser();
          },
        }
      );
    } else {
      // Добавление нового адреса
      addAddressMutation.mutate(addressData, {
        onSuccess: () => {
          handleCloseAddressDialog();
          // Принудительно обновляем данные пользователя
          refetchUser();
        },
      });
    }
  };

  // Загружаем данные предмета через API
  const {
    data: itemData,
    isLoading,
    error,
  } = useItem(id || "", initItem.salesMethod === "bidding" ? 1000 : 0);
  const item = itemData || initItem;

  const { data: player } = usePlayer(item?.player?._id || "");
  const { data: bids } = useItemBids(item.salesMethod !== "bidding" ? "" : item?._id || "");

  // Создаем данные для accordions используя переводы и данные предмета
  const details = useMemo(
    () =>
      item && {
        [t("singleProduct.details.date")]: item.endDate
          ? new Date(item.endDate).toLocaleDateString("ru-RU")
          : "Не указано",
        [t("singleProduct.details.size")]:
          Object.keys(item.stockBySize || {}).join(", ") || "Не указано",
        [t("singleProduct.details.team")]: player?.team?.name || "Не указано",
        // [t("singleProduct.details.club")]: player?.team?.name || "Не указано",
        // [t("singleProduct.details.description")]:
        //   item.description || "Описание товара",
        // [t("singleProduct.details.price")]: item.price
        //   ? `${item.price} ₽`
        //   : "0 ₽",
      },
    [item, t, player]
  );

  const { data: deliveryTariffs } = useItemDeliveryTariffs(
    user?.addresses?.find((address) => address.isDefault)?._id,
    item._id
  );

  const cheapestDeliveryTariff = deliveryTariffs?.sort(
    (a: any, b: any) => a.delivery_sum - b.delivery_sum
  )[0];

  const getAddress = (user: User) => {
    if (!user) return null;

    // Показываем индикатор загрузки если данные обновляются
    if (addAddressMutation.isPending || updateAddressMutation.isPending) {
      return (
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400"></div>
          <span className="text-sm text-gray-500">{t("common.loading")}</span>
        </div>
      );
    }

    const defaultAddress = user.addresses?.find((address) => address.isDefault);

    if (defaultAddress) {
      return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <span
            className="text-sm sm:text-base font-light"
            style={{ color: "var(--text-primary)" }}
          >
            {`${defaultAddress.country}, ${defaultAddress.city}, ${defaultAddress.street}, ${defaultAddress.apartmentNumber}`}
          </span>
          <AppButton
            variant="secondary"
            size="sm"
            fullWidth={false}
            onClick={() => handleEditAddress(defaultAddress)}
            disabled={addAddressMutation.isPending || updateAddressMutation.isPending}
          >
            {t("profile.addresses.edit_address")}
          </AppButton>
        </div>
      );
    } else {
      return (
        <AppButton
          variant="secondary"
          size="sm"
          fullWidth={false}
          onClick={handleAddAddress}
          disabled={addAddressMutation.isPending || updateAddressMutation.isPending}
        >
          {t("profile.addresses.add_new")}
        </AppButton>
      );
    }
  };

  // Создаем слайды из изображений предмета
  const slides =
    item?.images?.map((imageUrl, index) => ({
      id: index + 1,
      image: imageUrl,
    })) || [];

  const isFinished =
    item.salesMethod === "bidding" &&
    new Date(item.endDate || Date.now() + 24 * 60 * 60 * 1000) < new Date();

  const lastBet = bids?.pages.flatMap((page) => page.bids)[0];
  let lastBetName = "";
  if (lastBet) {
    if (lastBet.userId === user?._id) {
      lastBetName = lastBet.name;
    } else {
      lastBetName = lastBet.name.slice(0, 5) + "..." + lastBet.name.slice(-5);
    }
  }

  // Показываем состояние загрузки
  if (isLoading && !item) {
    return (
      <div className="flex flex-col gap-4 mx-auto py-16 mt-15 bg-[var(--bg-gray)]">
        <div className="container pb-10">
          <div className="text-center py-20">
            <div className="text-2xl text-[var(--text-primary)]">
              {t("common.loading", "Загрузка...")}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Показываем ошибку
  if (error || !item) {
    return (
      <div className="flex flex-col gap-4 mx-auto py-16 mt-15 bg-[var(--bg-gray)]">
        <div className="container pb-10">
          <div className="text-center py-20">
            <div className="text-2xl text-red-500">
              {t("productCard.notFound", "Товар не найден")}
            </div>
            <button
              onClick={() => navigate("/")}
              className="mt-4 px-6 py-2 bg-[var(--bg-dark)] text-[var(--text-secondary)] rounded-lg"
            >
              {t("common.back", "Назад")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 mx-auto pt-16 mt-0 sm:mt-5 lg:mt-15 bg-[var(--bg-gray)]">
      <div className="container pb-10">
        {/* Product info section */}
        <section className="single-product-info">
          <div className="flex flex-col gap-8 lg:flex-row lg:gap-14 ">
            <div className="w-dvw -ml-6.5 lg:-ml-0 lg:w-1/2 xl:w-[44.5rem] shrink-0 flex flex-col gap-5">
              <CarouselWithThumbs
                slides={slides}
                sourceId={item._id}
                sourceType="item"
                shareUrl={`${location.origin}/product/${item.slug}`}
                shareTitle={item.title}
                isLiked={item.isLiked}
              />
              <div className="block lg:hidden px-6.5 ">
                <ProductInfoBlock item={item} player={player} lastBetName={lastBetName} />
              </div>
              <div className="flex gap-14">
                {/* left */}
                <div className="w-full px-6.5 lg:px-0  xl:w-[44.5rem] shrink-0 flex flex-col gap-5">
                  {/* last bets */}
                  {item.salesMethod === "bidding" &&
                    (bids?.pages.flatMap((page) => page.bids).length || 0) > 0 && (
                      <>
                        <BetsAccordion
                          options={bids?.pages.flatMap((page) => page.bids) || []}
                          title={t("singleProduct.accordions.lastBets")}
                          btnMoreText={t("singleProduct.accordions.showAllBets", {
                            count: bids?.pages.flatMap((page) => page.bids).length || 0,
                          })}
                        />
                        <hr className={`text-lg text-[#DCDCDC]`} />
                      </>
                    )}
                  {/* details */}
                  {/* <OptionsAccordion
                    options={details || {}}
                    title={t("singleProduct.accordions.details")}
                    btnMoreText={t("singleProduct.accordions.moreDetails")}
                  /> */}

                  {/* <hr className={`text-lg text-[#DCDCDC]`} /> */}
                  {/* delivery */}
                  {!isFinished && (
                    <div className="flex flex-col ">
                      <div className="mb-3 text-lg sm:text-2xl text-[var(--text-primary)] font-medium uppercase">
                        {t("singleProduct.delivery.title")}
                      </div>
                      <div
                        className="text-sm sm:text-base font-light"
                        style={{ color: "var(--text-primary)" }}
                      >
                        Отправка осуществляется из г. Москвы.
                      </div>
                      <div
                        className="text-sm sm:text-base font-light"
                        style={{ color: "var(--text-primary)" }}
                      >
                        Ожидаемая дата доставки:{" "}
                        {formatDate(
                          cheapestDeliveryTariff?.delivery_date_range.min ||
                            new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString()
                        )}{" "}
                        -{" "}
                        {formatDate(
                          cheapestDeliveryTariff?.delivery_date_range.max ||
                            new Date(Date.now() + 1000 * 60 * 60 * 24 * 4).toISOString()
                        )}
                      </div>
                      <div
                        className="text-sm sm:text-base font-light"
                        style={{ color: "var(--text-primary)" }}
                      >
                        Предварительная стоимость доставки:{" "}
                        {cheapestDeliveryTariff?.delivery_sum || 1000} ₽.
                      </div>
                      {user && (
                        <div
                          className="text-sm sm:text-base font-light mt-2"
                          style={{ color: "var(--text-primary)" }}
                        >
                          Доставка до: {getAddress(user)}
                        </div>
                      )}
                    </div>
                  )}
                  <hr className={`text-lg text-[var(--border-muted)]`} />
                  <InfoBlock
                    title={"Упаковка товара"}
                    descr={[
                      "Каждый товар Fan’s Dream бережно упаковывается с учётом его особенностей. Для большинства лотов используется фирменная подарочная упаковка. Дополнительно все заказы защищаются внешней упаковкой для безопасной доставки.",
                    ]}
                  />

                  <hr className={`text-lg text-[var(--border-muted)]`} />
                  <InfoBlock
                    title={"Проверка подлинности"}
                    descr={[
                      "Мы сотрудничаем напрямую со спортсменами и клубами, что гарантирует подлинность каждого лота. Все товары сопровождаются сертификатом, а в отдельных категориях дополнительно используется NFC-чип, который можно отсканировать телефоном для подтверждения оригинальности.",
                    ]}
                    image={"/images/products/chip.png"}
                  />
                  <hr className={`text-lg text-[var(--border-muted)]`} />
                  {player?.team && (
                    <div className="flex w-fit items-center gap-2 sm:gap-6 py-3 sm:py-4 px-3 lg:pt-6 lg:px-7.5 lg:pb-7.5 border border-[var(--border-muted)] rounded-lg">
                      <div className="w-10.5 h-10.5 sm:w-15 sm:h-15 lg:w-20 lg:h-20 xl:w-27.5 xl:h-27.5 rounded-full bg-[var(--border-muted)] shrink-0 overflow-hidden">
                        <img
                          src={player?.team?.image || "/images/products/imageteamLogo.png"}
                          alt="team logo"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col gap-1 lg:gap-3">
                        <div className="text-sm sm:text-xl lg:text-2xl xl:text-3xl text-[var(--text-primary)] font-medium leading-normal sm:leading-9">
                          {player?.team?.name || t("singleProduct.team.name")}
                        </div>
                        <Button
                          className="flex items-center text-xs sm:text-sm lg:text-base xl:text-xl   px-3 py-1 sm:py-2 sm:px-6 xl:px-11 gap-2"
                          onClick={() => {
                            navigate(`/team/${player?.team?._id || id}`);
                          }}
                        >
                          <span className="text-nowrap">
                            {t("singleProduct.team.viewAllProducts")}
                          </span>

                          {width && width > 1024 ? <RiArrowRightLongLine size={24} /> : null}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* right */}
            <div className="hidden lg:block">
              <ProductInfoBlock
                item={item}
                player={player}
                lastBetName={lastBetName}
                event={item.event}
                blockClasses="sticky top-30"
              />
            </div>
          </div>
        </section>
      </div>
      {/* carousel */}
      {/* <section className="single-product-carousel">
        <div className="bg-[var(--bg-primary)] ">
          <div className="container">
            <div className="py-11">
              <ProductsCarousel
                products={productsWithExpiry}
                title={t("singleProduct.carousels.youMayLike")}
                heading="title"
              />
            </div>
            <div className="py-11">
              <ProductsCarousel
                products={productsWithExpiry}
                title={t("singleProduct.carousels.recentlyViewed")}
                heading="title"
              />
            </div>
          </div>
        </div>
      </section> */}
      {/* Диалог добавления/редактирования адреса */}
      <YandexConfigProvider value={yandexConfig}>
        <AddressDialog
          isOpen={showAddressDialog}
          onClose={handleCloseAddressDialog}
          onSave={handleSaveAddress}
          address={editingAddress}
          isLoading={addAddressMutation.isPending || updateAddressMutation.isPending}
        />
      </YandexConfigProvider>
    </div>
  );
}

export default SingleProduct;
