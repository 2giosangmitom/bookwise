import { type signUpDTO, type SignUpResponse } from "@bookwise/shared";
import { HttpClient } from "../http";

function signUp(client: HttpClient, body: signUpDTO): Promise<SignUpResponse> {
  return client.post("/api/account/signup", {
    body,
  });
}

function createAccountApi(client: HttpClient) {
  return {
    signUp: (body: signUpDTO) => signUp(client, body),
  };
}

export { createAccountApi };
