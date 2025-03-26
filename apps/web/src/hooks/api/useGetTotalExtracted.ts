import { QueryOptions, useQuery } from "@tanstack/react-query";
import axiosClient from "@/services/axiosClient";

const getTotalExtracted = async ({ queryKey }: { queryKey: QueryOptions["queryKey"] }) => {
  const address = queryKey![1];

  const res = await axiosClient.get("v1/mev/total-extracted", {
    params: {
      address,
    },
  });

  return res.data;
};

const useGetTotalExtracted = (address: string) => {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["getTotalExtracted", address],
    queryFn: getTotalExtracted,
    enabled: !!address,
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
