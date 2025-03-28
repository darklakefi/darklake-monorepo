import { QueryOptions, useQuery } from "@tanstack/react-query";
import axiosClient from "@/services/axiosClient";
import { MevAttack, MevAttacksOrderBy } from "@/types/Mev";
import { PaginatedResponse } from "@/types/Pagination";

const LIMIT_TOP = 3;

const getTopAttacks = async ({
  queryKey,
}: {
  queryKey: QueryOptions["queryKey"];
}): Promise<PaginatedResponse<MevAttack[]>> => {
  const [, address, LIMIT_TOP] = queryKey!;

  const res = await axiosClient.get("v1/mev/attacks", {
    params: {
      address,
      limit: LIMIT_TOP,
      offset: 0,
      orderBy: MevAttacksOrderBy.AMOUNT_DRAINED,
      direction: "desc",
    },
  });

  return res.data;
};

const useGetTopAttacks = (address: string) => {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["getTopAttacks", address, LIMIT_TOP],
    queryFn: getTopAttacks,
    enabled: !!address,
    refetchInterval: 10_000,
  });

  return {
    isLoading,
    isFetching,
    data: data || { result: [], total: 0 },
    error,
    refetch,
  };
};

export default useGetTopAttacks;
