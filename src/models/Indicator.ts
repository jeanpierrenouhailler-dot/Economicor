export type IndicatorCategory = 
  | 'Macroeconomics'
  | 'Housing'
  | 'Prices & Inflation'
  | 'Labor Market'
  | 'Public Finance'
  | 'External Sector';

export interface Indicator {
  id: string;                          // Unified ID: e.g. 'real_gdp_growth', 'house_price_index'
  label: string;                       // English label
  description?: string;                // Detailed explanation
  category: IndicatorCategory;
  source: string;                      // 'eurostat' | 'imf' | 'worldbank'
  dataset: string;                     // Provider's dataset code
  nativeCode: string;                  // Native indicator code (e.g. 'NGDP_RPCH', 'prc_hpi_q')
  unit: string;                        // '%', 'Index 2015=100'
  unitCategory: 'percent' | 'index' | 'currency' | 'ratio' | 'count';
  frequency: ('A' | 'Q' | 'M' | string)[];
  defaultFrequency: string;
  countries?: string[];                // available countries (optional filter)
  metadata?: Record<string, unknown>;
}

export const UNIFIED_INDICATORS: Indicator[] = [
  // --- EUROSTAT INDICATORS ---
  {
    id: 'house_price_index',
    label: 'House Price Index (HPI)',
    description: 'Quarterly index measuring the price changes of all residential properties purchased by households (flats, detached houses, terraced houses).',
    category: 'Housing',
    source: 'eurostat',
    dataset: 'prc_hpi_q',
    nativeCode: 'TOTAL',
    unit: 'Index 2015=100',
    unitCategory: 'index',
    frequency: ['Q', 'A'],
    defaultFrequency: 'Q',
    metadata: {
      providerName: 'Eurostat Dissemination API',
      sdmxDataflow: 'ESTAT:prc_hpi_q(1.0)',
      documentationUrl: 'https://ec.europa.eu/eurostat/statistics-explained/index.php?title=Housing_price_statistics_-_house_price_index'
    }
  },
  {
    id: 'eurostat_hicp_inflation',
    label: 'Harmonised Index of Consumer Prices (HICP)',
    description: 'Monthly harmonised consumer price index tracking overall inflation across EU and Euro area member states.',
    category: 'Prices & Inflation',
    source: 'eurostat',
    dataset: 'prc_hicp_midx',
    nativeCode: 'CP00',
    unit: 'Index 2015=100',
    unitCategory: 'index',
    frequency: ['M', 'A'],
    defaultFrequency: 'M',
    metadata: {
      providerName: 'Eurostat Dissemination API',
      sdmxDataflow: 'ESTAT:prc_hicp_midx(1.0)',
      documentationUrl: 'https://ec.europa.eu/eurostat/statistics-explained/index.php?title=Inflation_in_the_euro_area'
    }
  },

  // --- IMF WEO INDICATORS ---
  {
    id: 'real_gdp_growth',
    label: 'Real GDP Growth',
    description: 'Annual percentage change in constant-price gross domestic product according to the IMF World Economic Outlook.',
    category: 'Macroeconomics',
    source: 'imf',
    dataset: 'WEO',
    nativeCode: 'NGDP_RPCH',
    unit: '%',
    unitCategory: 'percent',
    frequency: ['A'],
    defaultFrequency: 'A',
    metadata: {
      providerName: 'IMF DataMapper / WEO',
      documentationUrl: 'https://www.imf.org/en/Publications/WEO'
    }
  },
  {
    id: 'imf_inflation_rate',
    label: 'Inflation Rate (Average Consumer Prices)',
    description: 'Annual percentage change in the average consumer price index according to the IMF World Economic Outlook.',
    category: 'Prices & Inflation',
    source: 'imf',
    dataset: 'WEO',
    nativeCode: 'PCPIPCH',
    unit: '%',
    unitCategory: 'percent',
    frequency: ['A'],
    defaultFrequency: 'A',
    metadata: {
      providerName: 'IMF DataMapper / WEO',
      documentationUrl: 'https://www.imf.org/en/Publications/WEO'
    }
  },
  {
    id: 'general_govt_debt',
    label: 'General Government Gross Debt (% of GDP)',
    description: 'Gross debt consists of all liabilities that require payment or payments of interest and/or principal by the debtor to the creditor in the future.',
    category: 'Public Finance',
    source: 'imf',
    dataset: 'WEO',
    nativeCode: 'GGXWDG_NGDP',
    unit: '% of GDP',
    unitCategory: 'percent',
    frequency: ['A'],
    defaultFrequency: 'A',
    metadata: {
      providerName: 'IMF DataMapper / WEO',
      documentationUrl: 'https://www.imf.org/external/datamapper/GGXWDG_NGDP'
    }
  },
  {
    id: 'unemployment_rate',
    label: 'Unemployment Rate',
    description: 'Percentage of the total labor force that is without work but available for and seeking employment.',
    category: 'Labor Market',
    source: 'imf',
    dataset: 'WEO',
    nativeCode: 'LUR',
    unit: '%',
    unitCategory: 'percent',
    frequency: ['A'],
    defaultFrequency: 'A',
    metadata: {
      providerName: 'IMF DataMapper / WEO',
      documentationUrl: 'https://www.imf.org/external/datamapper/LUR'
    }
  }
];
