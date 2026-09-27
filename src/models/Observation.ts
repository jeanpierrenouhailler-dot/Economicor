export interface EconomicObservation {
  source: string;              // 'eurostat' | 'imf' | 'worldbank'
  dataset: string;             // dataset identifier (e.g., 'prc_hpi_q', 'WEO')
  indicator: string;           // unified indicator id
  indicatorLabel: string;      // Human label (e.g., 'House Price Index')
  country: string;             // Standard ISO-2 code (e.g. 'FR')
  countryIso3: string;         // Standard ISO-3 code (e.g. 'FRA')
  countryLabel: string;        // 'France'
  period: string;              // Normalized: '2024', '2024-Q3', '2024-05'
  periodDate?: string;         // Parsable ISO date for time sorting
  value: number | null;
  unit: string;                // '%', 'Index 2015=100', 'EUR', 'USD', etc.
  unitCategory: 'percent' | 'index' | 'currency' | 'ratio' | 'count';
  frequency: 'A' | 'Q' | 'M' | string;
  status?: string;             // 'provisional', 'estimated', 'normal'
  lastUpdated?: string;
  dimensions?: Record<string, string>;
}

export interface DataProvenance {
  source: string;
  dataset: string;
  indicator: string;
  endpoint?: string;
  retrievedAt: string;
  lastUpdated?: string;
  license?: string;
  sourceUrl?: string;
  cached?: boolean;
}
