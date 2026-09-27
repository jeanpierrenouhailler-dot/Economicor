export interface DimensionValue {
  id: string;
  label: string;
}

export interface DatasetDimension {
  id: string;
  label: string;
  values: DimensionValue[];
  defaultValue?: string;
}

export interface Dataset {
  id: string;
  source: string;              // 'eurostat' | 'imf' | 'worldbank'
  code: string;                // 'prc_hpi_q', 'WEO', etc.
  name: string;
  description: string;
  frequency: string[];
  lastUpdated?: string;
  dimensions?: DatasetDimension[];
  docUrl?: string;
  indicatorCount?: number;
}

export interface DatasetMetadata {
  dataset: Dataset;
  agency: string;
  availableFrequencies: string[];
  availableCountries: string[];
  timePeriodRange?: {
    start: string;
    end: string;
  };
  dimensions: DatasetDimension[];
  provenance: {
    source: string;
    updatedAt: string;
    license: string;
  };
}

export const CATALOG_DATASETS: Dataset[] = [
  {
    id: 'eurostat_prc_hpi_q',
    source: 'eurostat',
    code: 'prc_hpi_q',
    name: 'House Price Index (Quarterly)',
    description: 'Quarterly transaction prices of all residential properties purchased by households, covering purchases of new and existing houses and apartments.',
    frequency: ['Q', 'A'],
    lastUpdated: '2026-07-02',
    docUrl: 'https://ec.europa.eu/eurostat/cache/metadata/en/prc_hpi_inx_esms.htm',
    indicatorCount: 1,
    dimensions: [
      {
        id: 'unit',
        label: 'Unit of measure',
        values: [
          { id: 'I15_Q', label: 'Index (2015=100)' },
          { id: 'PCH_Q1', label: 'Percentage change over previous quarter' },
          { id: 'PCH_Q4', label: 'Percentage change over same quarter previous year' }
        ],
        defaultValue: 'I15_Q'
      },
      {
        id: 'purchase',
        label: 'Type of dwelling',
        values: [
          { id: 'TOTAL', label: 'Total purchases' },
          { id: 'NEW', label: 'Newly built dwellings' },
          { id: 'EXIST', label: 'Existing dwellings' }
        ],
        defaultValue: 'TOTAL'
      }
    ]
  },
  {
    id: 'eurostat_prc_hicp_midx',
    source: 'eurostat',
    code: 'prc_hicp_midx',
    name: 'Harmonised Indices of Consumer Prices (Monthly)',
    description: 'Monthly consumer inflation indices designed for international comparisons of consumer price inflation.',
    frequency: ['M', 'A'],
    lastUpdated: '2026-08-18',
    docUrl: 'https://ec.europa.eu/eurostat/cache/metadata/en/prc_hicp_esms.htm',
    indicatorCount: 1,
    dimensions: [
      {
        id: 'unit',
        label: 'Unit of measure',
        values: [
          { id: 'I15', label: 'Index (2015=100)' }
        ],
        defaultValue: 'I15'
      },
      {
        id: 'coicop',
        label: 'Classification of Individual Consumption',
        values: [
          { id: 'CP00', label: 'All-items HICP' },
          { id: 'FOOD', label: 'Food and non-alcoholic beverages' },
          { id: 'NRG', label: 'Energy' }
        ],
        defaultValue: 'CP00'
      }
    ]
  },
  {
    id: 'imf_weo',
    source: 'imf',
    code: 'WEO',
    name: 'IMF World Economic Outlook (WEO)',
    description: 'Comprehensive global macroeconomic data, analysis and projections produced by IMF economists, updated semiannually.',
    frequency: ['A'],
    lastUpdated: '2026-04-16',
    docUrl: 'https://www.imf.org/en/Publications/WEO',
    indicatorCount: 4,
    dimensions: [
      {
        id: 'indicator',
        label: 'Macroeconomic Indicator',
        values: [
          { id: 'NGDP_RPCH', label: 'Real GDP growth (% change)' },
          { id: 'PCPIPCH', label: 'Inflation, average consumer prices (%)' },
          { id: 'GGXWDG_NGDP', label: 'General government gross debt (% of GDP)' },
          { id: 'LUR', label: 'Unemployment rate (%)' }
        ],
        defaultValue: 'NGDP_RPCH'
      }
    ]
  }
];
