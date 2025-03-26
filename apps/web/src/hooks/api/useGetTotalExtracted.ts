import { QueryOptions, useQuery } from "@tanstack/react-query";
import axiosClient from "@/services/axiosClient";
import { GetMevTotalExtractedResponse } from "@/types/Mev";

const getTotalExtracted = async ({ queryKey }: { queryKey: QueryOptions["queryKey"] }) => {
  const address = queryKey![1];

  const res = await axiosClient.get("v1/mev/total-extracted", {
    params: {
      address,
    },
  });

  return res.data;
};

interface UseGetTotalExtractedReturn {
  isLoading: boolean;
  isFetching: boolean;
  data: GetMevTotalExtractedResponse | null;
  error: unknown;
  refetch: () => void;
}

const useGetTotalExtracted = (address: string): UseGetTotalExtractedReturn => {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["getTotalExtracted", address],
    queryFn: getTotalExtracted,
    enabled: !!address,
  });

  return {
    isLoading,
    isFetching,
    data: data?.d || null,
    error,
    refetch,
  };
};

export default useGetTotalExtracted;
