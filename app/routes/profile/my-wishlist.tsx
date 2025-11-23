import React from "react";
import { useTranslation } from "react-i18next";
import { AppButton } from "~/shared/buttons/AppButton";
import { useUserLikes } from "~/queries/user";
import ProductCard from "~/shared/carousel/ProductCard";
import { useNavigate } from "react-router";

const MyWishlist: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    data: wishlistData,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading,
  } = useUserLikes("item");

  const wishlistItems = wishlistData?.pages.flatMap((page) => page.likes) ?? [];

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight * 1.5) {
      if (hasNextPage && !isFetching) {
        fetchNextPage();
      }
    }
  };

  return (
    <div className="space-y-6 bg-white rounded-lg shadow px-[50px] py-[36px]">
      {/* Заголовок */}
      <h2 className="text-lg font-medium text-gray-900">{t("profile.wishlist.title")}</h2>

      {/* Загрузка */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-sm text-gray-500">{t("profile.wishlist.loading")}</p>
        </div>
      )}

      {/* Список избранных товаров */}
      {!isLoading && wishlistItems.length > 0 && (
        <div className="space-y-6 max-h-[600px] overflow-y-auto" onScroll={handleScroll}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              <div key={item._id} className="w-full">
                <ProductCard
                  product={
                    {
                      _id: item.sourceId,
                      title: item.name,
                      slug: item.slug,
                      images: item.image ? [item.image] : [],
                      price: 0, // UserLike не содержит цену, будет загружена из API
                      endDate: new Date(), // Аналогично для даты окончания
                      labels: [], // И для меток
                      isLiked: true, // В вишлисте все товары по определению понравились
                    } as any
                  }
                  loadFullData={true} // Загружаем полные данные для вишлиста
                />
              </div>
            ))}
          </div>

          {/* Индикатор загрузки следующей страницы */}
          {isFetching && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
            </div>
          )}
        </div>
      )}

      {/* Пустое состояние */}
      {!isLoading && wishlistItems.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t("profile.wishlist.empty")}</h3>
          <p className="text-sm text-gray-500 mb-4">{t("profile.wishlist.empty_desc")}</p>
          <AppButton variant="primary" onClick={() => navigate("/")}>
            {t("profile.wishlist.continue_shopping")}
          </AppButton>
        </div>
      )}
    </div>
  );
};

export default MyWishlist;
