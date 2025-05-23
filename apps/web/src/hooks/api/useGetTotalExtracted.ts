"use client";

import axiosClient from "@/services/axiosClient";
import { GetMevTotalExtractedResponse } from "@/types/Mev";
import { QueryOptions, useQuery } from "@tanstack/react-query";

const getTotalExtracted = async ({
  queryKey,
}: {
  queryKey: QueryOptions["queryKey"];
}): Promise<GetMevTotalExtractedResponse> => {
  const address = queryKey![1];

  const res = await axiosClient.get("v1/mev/total-extracted", {
    params: {
      address,
    },
  });

  return res.data;
};

const useGetTotalExtracted = (address: string, initialData?: GetMevTotalExtractedResponse) => {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["getTotalExtracted", address],
    queryFn: getTotalExtracted,
    enabled: !!address && initialData?.processingBlocks?.completed === initialData?.processingBlocks?.total,
    initialData,
    refetchInterval: 10_000,
  });

  return {
    isLoading,
    isFetching,
    data: data || null,
    error,
    refetch,
  };
};

export default useGetTotalExtracted;
