import axios, { AxiosRequestConfig } from "axios";

const configs: AxiosRequestConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
    "Access-Control-Allow-Origin": "*",
  },
  timeout: 60000,
};

const axiosClient = axios.create(configs);

// setup other case for handle error
// instance.interceptors.request.use(async (request) => {
//   const accessToken = StorageUtils.getToken();
//   if (accessToken) {
//     request.headers.Authorization = `Bearer ${accessToken}`;
//   }
//   return request;
// });

export default axiosClient;
