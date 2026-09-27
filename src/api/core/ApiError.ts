export type ApiErrorCode =
  | 'API_UNAVAILABLE'
  | 'DATASET_UNAVAILABLE'
  | 'NO_DATA_FOR_PERIOD'
  | 'INVALID_DIMENSION'
  | 'RATE_LIMIT'
  | 'NETWORK_UNAVAILABLE'
  | 'CACHED_DATA_UNAVAILABLE'
  | 'UNKNOWN_ERROR';

export class ApiError extends Error {
  public readonly code: ApiErrorCode;
  public readonly source?: string;
  public readonly status?: number;
  public readonly details?: unknown;
  public readonly timestamp: string;

  constructor(
    message: string,
    code: ApiErrorCode = 'UNKNOWN_ERROR',
    options?: {
      source?: string;
      status?: number;
      details?: unknown;
    }
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.source = options?.source;
    this.status = options?.status;
    this.details = options?.details;
    this.timestamp = new Date().toISOString();
  }

  public get userFriendlyMessage(): string {
    switch (this.code) {
      case 'API_UNAVAILABLE':
        return `The statistical service${this.source ? ` (${this.source.toUpperCase()})` : ''} is currently unavailable. Please verify your connection or try again shortly.`;
      case 'DATASET_UNAVAILABLE':
        return `The requested dataset could not be found or is not currently disseminated.`;
      case 'NO_DATA_FOR_PERIOD':
        return `No data available for the selected country and time period. Try expanding the date range.`;
      case 'INVALID_DIMENSION':
        return `The selected dimensions or parameters are incompatible with this dataset structure.`;
      case 'RATE_LIMIT':
        return `Temporary request threshold reached on the external provider. Please wait a moment before refreshing.`;
      case 'NETWORK_UNAVAILABLE':
        return `Network offline. Please check your internet connection or use cached local observations.`;
      case 'CACHED_DATA_UNAVAILABLE':
        return `No cached data exists for this query while offline.`;
      default:
        return this.message || 'An unexpected error occurred while querying economic data.';
    }
  }
}
