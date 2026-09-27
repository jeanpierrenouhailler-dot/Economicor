import { ApiError } from './ApiError';
import { HttpOptions, HttpResponse } from './types';

export class HttpClient {
  private defaultTimeout: number;

  constructor(defaultTimeoutMs: number = 15000) {
    this.defaultTimeout = defaultTimeoutMs;
  }

  public async get<T>(url: string, options?: HttpOptions): Promise<HttpResponse<T>> {
    const controller = new AbortController();
    const timeout = options?.timeoutMs ?? this.defaultTimeout;
    const timer = setTimeout(() => controller.abort(), timeout);

    // Merge external abort signal if provided
    if (options?.signal) {
      options.signal.addEventListener('abort', () => controller.abort());
    }

    // Build URL with query params
    let fullUrl = url;
    if (options?.params) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(options.params)) {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      }
      const qs = searchParams.toString();
      if (qs) {
        fullUrl += (fullUrl.includes('?') ? '&' : '?') + qs;
      }
    }

    try {
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          ...options?.headers
        },
        signal: controller.signal
      });

      clearTimeout(timer);

      if (!response.ok) {
        let errorDetails: unknown = null;
        try {
          errorDetails = await response.json();
        } catch {
          errorDetails = await response.text();
        }

        if (response.status === 404) {
          throw new ApiError('Dataset or resource not found', 'DATASET_UNAVAILABLE', {
            status: response.status,
            details: errorDetails
          });
        }

        if (response.status === 429) {
          throw new ApiError('API rate limit reached', 'RATE_LIMIT', {
            status: response.status,
            details: errorDetails
          });
        }

        throw new ApiError(`HTTP Error ${response.status}: ${response.statusText}`, 'API_UNAVAILABLE', {
          status: response.status,
          details: errorDetails
        });
      }

      const contentType = response.headers.get('content-type') || '';
      let data: T;
      if (contentType.includes('application/json') || contentType.includes('application/vnd.sdmx.structure+json')) {
        data = (await response.json()) as T;
      } else {
        const text = await response.text();
        try {
          data = JSON.parse(text) as T;
        } catch {
          data = text as unknown as T;
        }
      }

      return {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        url: response.url
      };
    } catch (err: unknown) {
      clearTimeout(timer);

      if (err instanceof ApiError) {
        throw err;
      }

      if (err instanceof DOMException && err.name === 'AbortError') {
        throw new ApiError('Request timed out or was aborted', 'API_UNAVAILABLE', {
          details: `Timeout after ${timeout}ms`
        });
      }

      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        throw new ApiError('Network connection is offline', 'NETWORK_UNAVAILABLE', {
          details: err
        });
      }

      throw new ApiError(
        err instanceof Error ? err.message : 'Network request failed',
        'API_UNAVAILABLE',
        { details: err }
      );
    }
  }
}

export const defaultHttpClient = new HttpClient();
