import { useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { useSearchItems } from "~/queries/public";
import ProductCard from "~/shared/carousel/ProductCard";
import { cn } from "~/lib/utils";
import { Spinner } from "~/shared/Spinner";

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const query = searchParams.get("q") || "";

  const { data, isLoading, error } = useSearchItems(query, query.length >= 2);

  const items = data?.items || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
          {t("search.results_title", "Результаты поиска")}
        </h1>
        {query && (
          <p className="text-lg text-gray-600">
            {t("search.query_results", "Результаты по запросу: \"{{query}}\"", {
              query,
            })}
          </p>
        )}
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <Spinner />
          <span className="ml-2 text-gray-500">{t("search.loading")}</span>
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <p className="text-red-500 text-lg">{t("search.error")}</p>
        </div>
      )}

      {!isLoading && !error && query.length < 2 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">{t("search.min_chars")}</p>
        </div>
      )}

      {!isLoading && !error && query.length >= 2 && items.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">{t("search.no_results")}</p>
        </div>
      )}

      {!isLoading && !error && items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {items.map((item) => (
            <ProductCard key={item._id} product={item} />
          ))}
        </div>
      )}
    </div>
  );
} 
