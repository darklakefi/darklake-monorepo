"use client";

import axiosClient from "@/services/axiosClient";
import { CheckAddressExistResponse } from "@/types/Mev";
import { QueryOptions, useQuery } from "@tanstack/react-query";

const checkAddressExist = async ({
  queryKey,
}: {
  queryKey: QueryOptions["queryKey"];
}): Promise<CheckAddressExistResponse> => {
  const address = queryKey![1];

  const res = await axiosClient.get("v1/mev/check-address-exist", {
    params: {
      address,
    },
  });

  return res.data;
};

const useCheckAddressExist = (address: string) => {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["checkAddressExist", address],
    queryFn: checkAddressExist,
    enabled: !!address,
  });

  return {
    isLoading,
    isFetching,
    isAddressExist: data?.addressExist,
    error,
    refetch,
  };
};

export default useCheckAddressExist;
