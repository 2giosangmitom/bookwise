// import { functional } from "@bookwise/sdk";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
// import { API_CONNECTION } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// export function callApiWithAutoRefresh(refreshToken: string) {
//   const queue = [];
//   let accessToken: string | null = null;

//   return async <T>(fn: () => Promise<T>) => {
//     if (!accessToken) {
//       try {
//         const refreshRes = await functional.api.auth.refresh(API_CONNECTION);
//         accessToken = refreshRes.data.accessToken;
//       } catch (error) {
//         await functional.api.auth.signout(API_CONNECTION);
//       }
//     }

//     try {
//       const data = await fn();
//     } catch (error) {}
//   };
// }
