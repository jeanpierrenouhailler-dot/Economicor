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
  // 1. Eurostat
  {
    id: 'eurostat_prc_hpi_q',
    source: 'eurostat',
    code: 'prc_hpi_q',
    name: 'House Price Index (Quarterly)',
    description: 'Quarterly transaction prices of all residential properties purchased by households, covering purchases of new and existing houses and apartments.',
    frequency: ['Q', 'A'],
    lastUpdated: '2026-07-02',
    docUrl: 'https://ec.europa.eu/eurostat/cache/metadata/en/prc_hpi_inx_esms.htm',
    indicatorCount: 1
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
    indicatorCount: 1
  },
  {
    id: 'eurostat_une_rt_m',
    source: 'eurostat',
    code: 'une_rt_m',
    name: 'Harmonised Unemployment Rate (Monthly)',
    description: 'Standardized monthly unemployment rates across European Union member countries.',
    frequency: ['M', 'A'],
    lastUpdated: '2026-08-30',
    indicatorCount: 1
  },
  {
    id: 'eurostat_namq_10_gdp',
    source: 'eurostat',
    code: 'namq_10_gdp',
    name: 'GDP and Main Aggregates (Quarterly)',
    description: 'Real GDP volume and key national accounts aggregates for EU member states and Eurozone.',
    frequency: ['Q', 'A'],
    lastUpdated: '2026-08-15',
    indicatorCount: 1
  },

  // 2. IMF
  {
    id: 'imf_weo',
    source: 'imf',
    code: 'WEO',
    name: 'IMF World Economic Outlook (WEO)',
    description: 'Comprehensive global macroeconomic data, analysis and projections produced by IMF economists, updated semiannually.',
    frequency: ['A'],
    lastUpdated: '2026-04-16',
    docUrl: 'https://www.imf.org/en/Publications/WEO',
    indicatorCount: 4
  },

  // 3. World Bank
  {
    id: 'wb_wdi',
    source: 'worldbank',
    code: 'WDI',
    name: 'World Bank - World Development Indicators (WDI)',
    description: 'The premier compilation of relevant, high-quality international development statistics covering poverty, GDP, and structural metrics.',
    frequency: ['A'],
    lastUpdated: '2026-07-01',
    docUrl: 'https://data.worldbank.org',
    indicatorCount: 4
  },

  // 4. FRED
  {
    id: 'fred_fin',
    source: 'fred',
    code: 'FRED_FIN',
    name: 'FRED - Federal Reserve Economic Data',
    description: 'Premier economic and financial database of the Federal Reserve Bank of St. Louis covering interest rates, monetary policy, and US macro.',
    frequency: ['M', 'Q', 'A'],
    lastUpdated: '2026-09-20',
    docUrl: 'https://fred.stlouisfed.org',
    indicatorCount: 4
  },

  // 5. INSEE
  {
    id: 'insee_bdm',
    source: 'insee',
    code: 'INSEE_BDM',
    name: 'INSEE - Banque de Données Macroéconomiques (France)',
    description: 'Séries chronologiques officielles de l’Institut National de la Statistique et des Études Économiques pour la France.',
    frequency: ['M', 'Q', 'A'],
    lastUpdated: '2026-09-15',
    docUrl: 'https://www.insee.fr',
    indicatorCount: 5
  },

  // 6. ECB
  {
    id: 'ecb_sdw',
    source: 'ecb',
    code: 'ECB_SDW',
    name: 'European Central Bank - Statistical Data Warehouse & Portal',
    description: 'Statistiques monétaires et financières officielles de l’Eurosystème : taux directeurs, agrégats de monnaie M3, taux Euribor et crédit.',
    frequency: ['M', 'A'],
    lastUpdated: '2026-09-18',
    docUrl: 'https://data.ecb.europa.eu',
    indicatorCount: 4
  },

  // 7. BLS
  {
    id: 'bls_labor',
    source: 'bls',
    code: 'BLS_LABOR',
    name: 'US Bureau of Labor Statistics (BLS)',
    description: 'Statistiques officielles américaines du marché de l’emploi (chômage U-3, créations de postes Nonfarm Payrolls) et inflation CPI-U.',
    frequency: ['M', 'A'],
    lastUpdated: '2026-09-12',
    docUrl: 'https://www.bls.gov',
    indicatorCount: 3
  },

  // 8. OECD
  {
    id: 'oecd_mei',
    source: 'oecd',
    code: 'OECD_MEI',
    name: 'OECD Main Economic Indicators (MEI)',
    description: 'Indicateurs macroéconomiques internationaux harmonisés par l’OCDE pour ses 38 pays membres.',
    frequency: ['M', 'Q', 'A'],
    lastUpdated: '2026-09-08',
    docUrl: 'https://data-explorer.oecd.org',
    indicatorCount: 3
  },

  // 9. UN Data
  {
    id: 'un_wpp',
    source: 'undata',
    code: 'UN_WPP',
    name: 'United Nations - World Population & Human Development',
    description: 'Données démographiques et indicateurs de développement humain (IDH) compilés par la division de la population des Nations Unies et le PNUD.',
    frequency: ['A'],
    lastUpdated: '2026-06-25',
    docUrl: 'https://data.un.org',
    indicatorCount: 2
  },

  // 10. BIS
  {
    id: 'bis_stats',
    source: 'bis',
    code: 'BIS_STATS',
    name: 'Bank for International Settlements (BRI / BIS)',
    description: 'Statistiques de la banque centrale des banques centrales : matrice comparée des taux directeurs mondiaux, crédit au secteur privé, taux de change effectifs réels.',
    frequency: ['M', 'Q', 'A'],
    lastUpdated: '2026-09-10',
    docUrl: 'https://www.bis.org/statistics',
    indicatorCount: 3
  },

  // 11. EIA
  {
    id: 'eia_steo',
    source: 'eia',
    code: 'EIA_STEO',
    name: 'U.S. Energy Information Administration (EIA)',
    description: 'Séries de référence sur l’énergie mondiale : cours du pétrole brut Brent & WTI, cours du gaz naturel Henry Hub et bilans énergétiques.',
    frequency: ['M', 'A'],
    lastUpdated: '2026-09-14',
    docUrl: 'https://www.eia.gov',
    indicatorCount: 3
  },

  // 12. FAO
  {
    id: 'fao_faostat',
    source: 'fao',
    code: 'FAO_FAOSTAT',
    name: 'FAO - Food and Agriculture Organization (FAOSTAT)',
    description: 'Indice mondial des prix alimentaires de l’ONU et cours internationaux des denrées agricoles stratégiques (céréales, huiles, produits laitiers).',
    frequency: ['M', 'A'],
    lastUpdated: '2026-09-05',
    docUrl: 'https://www.fao.org/worldfoodsituation/foodpricesindex',
    indicatorCount: 2
  }
];
