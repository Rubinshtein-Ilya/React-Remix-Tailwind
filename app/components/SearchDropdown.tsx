import React from "react";
import { Link, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useSearchItems } from "~/queries/public";
import { cn } from "~/lib/utils";
import type { LikeResponse } from "~/types/item";
import type { IItem } from "server/models/Item";

interface SearchDropdownProps {
  searchQuery: string;
  isOpen: boolean;
  onClose: () => void;
  onItemClick?: () => void;
}

export function SearchDropdown({
  searchQuery,
  isOpen,
  onClose,
  onItemClick,
}: SearchDropdownProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, isLoading, error } = useSearchItems(searchQuery, isOpen);

  if (!isOpen) return null;

  const items = data?.items || [];

  const handleViewAllResults = () => {
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    onClose();
  };

  return (
    <div className="absolute top-full left-0 w-full bg-white rounded-lg shadow-lg border border-gray-200 mt-2 z-50 max-h-96 overflow-y-auto">
      {isLoading && (
        <div className="p-4 text-center text-gray-500">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm">{t("search.loading")}</p>
        </div>
      )}

      {error && (
        <div className="p-4 text-center text-red-500">
          <p className="text-sm">{t("search.error")}</p>
        </div>
      )}

      {!isLoading &&
        !error &&
        items.length === 0 &&
        searchQuery.length >= 2 && (
          <div className="p-4 text-center text-gray-500">
            <p className="text-sm">{t("search.no_results")}</p>
          </div>
        )}

      {!isLoading && !error && items.length > 0 && (
        <div className="py-2">
          <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
            {t("search.products")} ({items.length})
          </div>
          {items.slice(0, 8).map((item: LikeResponse<IItem>) => (
            <Link
              key={item._id}
              to={`/product/${item.slug}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
              onClick={() => {
                onItemClick?.();
                onClose();
              }}
            >
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                <img
                  src={
                    item.thumbnail ||
                    item.images?.[0] ||
                    "/images/placeholder-item.png"
                  }
                  alt={item.title}
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {item.title}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  {item.price ? (
                    <span className="text-sm font-semibold text-gray-900">
                      {Intl.NumberFormat().format(item.price)}₽
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500">
                      {t("productCard.priceNotAvailable")}
                    </span>
                  )}
                  {item.salesMethod === "bidding" && (
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                      {t("productCard.bid")}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
          {items.length > 8 && (
            <div className="px-4 py-3 text-center border-t">
              <button
                onClick={handleViewAllResults}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                {t("search.view_all_results", { count: items.length })}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
