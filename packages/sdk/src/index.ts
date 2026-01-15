import { HttpClient } from "./http";
import { createAccountApi } from "./modules/account";

export function createApiClient(baseURL: string) {
  const client = new HttpClient(baseURL);

  return {
    account: createAccountApi(client),
  };
}
