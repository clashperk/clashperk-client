import { getCookie } from "cookies-next";
import { Api, HttpClient } from "./generated";

// Module-level and shared across server requests: the token must come from the
// request's own cookie, never from state stored on this client.
export const httpClient = new HttpClient({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // withCredentials: true,
  securityWorker: async () => {
    const accessToken = await getCookie("x-access-token");
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
