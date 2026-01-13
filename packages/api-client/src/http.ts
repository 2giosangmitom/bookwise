import { ofetch } from "ofetch";

type FetchOpts<T> = Parameters<typeof ofetch<T>>[1];

export class HttpClient {
  private fetchApi: ReturnType<typeof ofetch.create>;

  public constructor(baseURL: string) {
    this.fetchApi = ofetch.create({
      baseURL,
    });
  }

  public get<T>(path: string, opts: FetchOpts<T>) {
    return this.fetchApi<T>(path, {
      ...opts,
      method: "GET",
    });
  }

  public post<T>(path: string, opts: FetchOpts<T>) {
    return this.fetchApi<T>(path, {
      ...opts,
      method: "POST",
    });
  }

  public put<T>(path: string, opts: FetchOpts<T>) {
    return this.fetchApi<T>(path, {
      ...opts,
      method: "PUT",
    });
  }

  public delete<T>(path: string, opts: FetchOpts<T>) {
    return this.fetchApi<T>(path, {
      ...opts,
      method: "DELETE",
    });
  }

  public patch<T>(path: string, opts: FetchOpts<T>) {
    return this.fetchApi<T>(path, {
      ...opts,
      method: "PATCH",
    });
  }
}
