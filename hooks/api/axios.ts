import { getCookie } from "cookies-next";
import { Api, HttpClient } from "./generated";

export const httpClient = new HttpClient<{ accessToken?: string | null }>({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // withCredentials: true,
  securityWorker: async (securityData) => {
    const cookieAccessToken = await getCookie("x-access-token");
    const accessToken = cookieAccessToken || securityData?.accessToken;
    if (!accessToken) return {};

    return { headers: { Authorization: `Bearer ${accessToken}` } };
  },
});

httpClient.instance.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(
      new Error(error?.response?.data?.message || error?.message)
    );
  }
);

export const api = new Api(httpClient);
