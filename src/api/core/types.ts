export interface HttpOptions {
  headers?: Record<string, string>;
  timeoutMs?: number;
  params?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
}

export interface HttpResponse<T> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
  url: string;
}
