import { Api, HttpClient } from "@/hooks/api/generated";
import { isAxiosError } from "axios";

/**
 * Server-only API client authenticated with the service API key.
 * Used by public pages (`/web/*`) that have no user session. Never import from client components.
 */
export const serverApi = new Api(
  new HttpClient({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    headers: { "x-api-key": process.env.SERVICE_API_KEY },
  }),
);

/** Resolves to the response body, or `null` when the API answers 404. */
export const dataOrNull = async <T>(
  request: Promise<{ data: T }>,
): Promise<T | null> => {
  try {
    const { data } = await request;
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) return null;
    throw error;
  }
};
