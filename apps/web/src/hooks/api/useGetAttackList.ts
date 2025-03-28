import { QueryOptions, useInfiniteQuery } from "@tanstack/react-query";
import axiosClient from "@/services/axiosClient";
import { MevAttack, MevAttacksOrderBy } from "@/types/Mev";
import { PaginatedResponse, SortDirection } from "@/types/Pagination";
import { useState } from "react";

const getAttackList = async ({
  queryKey,
  pageParam = 0,
}: {
  queryKey: QueryOptions["queryKey"];
  pageParam?: number;
}): Promise<PaginatedResponse<MevAttack>> => {
  const [, address, orderBy, direction, limit] = queryKey!;

  const res = await axiosClient.get("v1/mev/attacks", {
    params: {
      address,
      limit,
      offset: pageParam,
      orderBy,
      direction,
    },
  });

  return res.data;
};

const useGetAttackList = (address: string) => {
  const [orderBy, setOrderBy] = useState<MevAttacksOrderBy>(MevAttacksOrderBy.DATE);
  const [direction, setDirection] = useState<SortDirection>(SortDirection.DESC);
  const [limit, setLimit] = useState<number>(3);

  const { data, error, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ["getAttackList", address, orderBy, direction, limit],
    queryFn: getAttackList,
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.limit + lastPage.offset > lastPage.total ? null : lastPage.limit + lastPage.offset,
  });

  const fetchMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const setSort = (newOrderBy: MevAttacksOrderBy, newDirection: SortDirection) => {
    setOrderBy(newOrderBy);
    setDirection(newDirection);
  };

  const items = data?.pages?.flatMap((page) => page.result) || [];

  return {
    isFetching,
    data: items,
    error,
    loadMore: fetchMore,
    isLoadingMore: isFetchingNextPage,
    hasMore: hasNextPage,
    setSort,
    setLimit,
    orderBy,
    direction,
  };
};

export default useGetAttackList;
