import { type InfiniteData, type UseInfiniteQueryResult} from "@tanstack/react-query";
import type { MRT_RowData, MRT_TableOptions } from "material-react-table";
import { AppButton } from "~/shared/buttons/AppButton";

export function getLoadMoreQueryProps<T extends MRT_RowData, X>(
  query: UseInfiniteQueryResult<InfiniteData<X>>
): Partial<MRT_TableOptions<T>> {
  return {
    renderBottomToolbarCustomActions: () =>
      query.hasNextPage ? (
        <div className="flex gap-2">
          <AppButton
            type="button"
            variant="secondary"
            size="sm"
            disabled={query.isFetchingNextPage}
            onClick={() => {
              query.fetchNextPage();
            }}
          >
            {query.isFetchingNextPage ? "Loading" : "Load More"}
          </AppButton>
        </div>
      ) : null,
  };
}