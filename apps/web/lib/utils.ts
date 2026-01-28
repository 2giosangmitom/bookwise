import { functional, HttpError } from "@bookwise/sdk";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { API_CONNECTION } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type CallApiFn<T = unknown> = (token: string | null) => Promise<T>;

export function createAutoRefreshClient() {
  let queue: CallApiFn[] = [];
  let accessToken: string | null = null;
  let isRefreshing = false;

  const refresh = async () => {
    try {
      isRefreshing = true;
      const refreshResponse = await functional.api.auth.refresh(API_CONNECTION);
      accessToken = refreshResponse.data.accessToken;
    } catch (error) {
      if (error instanceof HttpError && error.status === 401) {
        // Sign out if refresh failed
        await functional.api.auth.signout(API_CONNECTION);
      }
    } finally {
      isRefreshing = false;
    }
  };

  const subscribeTokenRefresh = (cb: CallApiFn) => {
    queue.push(cb);
  };

  refresh();

  return async <T = undefined>(fn: CallApiFn<T>) => {
    try {
      return await fn(accessToken);
    } catch (error) {
      if (!(error instanceof HttpError) || error.status !== 401) throw error;

      if (isRefreshing) {
        return new Promise<T>((resolve) => {
          subscribeTokenRefresh(async (token) => {
            resolve(await fn(token));
          });
        });
      }

      // Start refresh
      await refresh();

      // Process queue
      for (const request of queue) {
        request(accessToken);
      }
      queue = [];

      // Process current request
      return fn(accessToken);
    }
  };
}
