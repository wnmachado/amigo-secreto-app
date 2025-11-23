import { AxiosRequestConfig, AxiosResponse } from "axios";
import useSWR, { SWRConfiguration } from "swr";
import api from "@/services/httpClient";

interface IParams {
  url?: string;
  params?: any;
  config?: SWRConfiguration;
  isBlob?: boolean;
}

export default function useFetch<Data>({
  url,
  params,
  config,
  isBlob,
}: IParams) {
  const newConfig = {
    ...config,
    revalidateIfStale: true,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    revalidateOnMount: true,
  };

  const { data, error, isLoading, isValidating } = useSWR<Data>(
    url,
    async (url) => {
      try {
        const t: AxiosRequestConfig<any> = isBlob
          ? { responseType: "blob" }
          : {};

        const response: AxiosResponse = await api.get(url, {
          ...t,
          params: { ...params },
        });

        return response.data;
      } catch (error) {
        return { data: [] };
      }
    },
    newConfig
  );

  return { data, error, isLoading, isValidating };
}
