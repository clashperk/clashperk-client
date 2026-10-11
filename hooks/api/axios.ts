import type { InternalAxiosRequestConfig } from "axios";
import { getSession } from "next-auth/react";
import { Api, HttpClient } from "./generated";

// Browser-only: holds the signed-in user's API token, so server code must use `serverApi`.
let accessToken: string | undefined;

export const setApiToken = (token: string | undefined) => {
  // Client components also render on the server, where this module is shared by every user.
  if (typeof window === "undefined") return;
  accessToken = token;
};

export const httpClient = new HttpClient({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  securityWorker: () =>
    accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : {},
});

type RetryConfig = InternalAxiosRequestConfig & { retried?: boolean };

httpClient.instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config: RetryConfig | undefined = error?.config;
    // An expired token gets a 401; fetching the session issues a new one, so retry once.
    if (error?.response?.status === 401 && config && !config.retried) {
      config.retried = true;
      const session = await getSession();
      if (session?.accessToken) {
        accessToken = session.accessToken;
        config.headers.Authorization = `Bearer ${accessToken}`;
        return httpClient.instance(config);
      }
    }
    return Promise.reject(
      new Error(error?.response?.data?.message || error?.message),
    );
  },
);

export const api = new Api(httpClient);
