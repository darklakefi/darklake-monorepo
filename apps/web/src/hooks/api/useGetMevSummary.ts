import { useQuery } from "@tanstack/react-query";
import axiosClient from "@/services/axiosClient";
import { GetMevSummaryResponse } from "@/types/Mev";

const getMevSummary = async (): Promise<GetMevSummaryResponse> => {
  const res = await axiosClient.get("v1/mev/summary");
  return res.data;
};

const useGetMevSummary = () => {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["getMevSummary"],
    queryFn: getMevSummary,
    refetchInterval: 10_000,
  });

  return {
    isLoading,
    isFetching,
    data,
    error,
    refetch,
  };
};

export default useGetMevSummary;
