export interface DataQuery {
  source?: string;                     // 'eurostat' | 'imf' | 'worldbank' | 'all'
  dataset?: string;                    // dataset code
  indicator?: string;                  // indicator code (e.g., 'real_gdp_growth')
  countries?: string[];                // normalized ISO codes (e.g. ['FR', 'DE'])
  startPeriod?: string;                // e.g. '2015' or '2015-Q1'
  endPeriod?: string;                  // e.g. '2025' or '2025-Q4'
  frequency?: 'A' | 'Q' | 'M' | string;
  dimensions?: Record<string, string>; // additional provider dimensions
}

export interface QueryResult {
  query: DataQuery;
  observations: import('./Observation').EconomicObservation[];
  provenance: import('./Observation').DataProvenance;
  fromCache: boolean;
  cachedAt?: string;
  error?: string;
}
