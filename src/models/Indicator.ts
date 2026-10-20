export type IndicatorCategory = 
  | 'Macroeconomics'
  | 'Housing'
  | 'Prices & Inflation'
  | 'Labor Market'
  | 'Public Finance'
  | 'Monetary & Banking'
  | 'Energy'
  | 'Agriculture & Food'
  | 'Development & Society'
  | 'External Sector';

export interface Indicator {
  id: string;                          // Unified ID: e.g. 'real_gdp_growth', 'house_price_index'
  label: string;                       // English label
  labelFr?: string;                    // French label
  description?: string;                // Detailed explanation
  category: IndicatorCategory;
  source: string;                      // 'eurostat' | 'imf' | 'worldbank' | 'fred' | 'insee' | 'ecb' | 'bls' | 'oecd' | 'undata' | 'bis' | 'eia' | 'fao'
  dataset: string;                     // Provider's dataset code
  nativeCode: string;                  // Native indicator code
  unit: string;                        // '%', 'Index 2015=100'
  unitCategory: 'percent' | 'index' | 'currency' | 'ratio' | 'count';
  frequency: ('A' | 'Q' | 'M' | string)[];
  defaultFrequency: string;
  countries?: string[];                // available countries (optional filter)
  metadata?: Record<string, unknown>;
}

export const UNIFIED_INDICATORS: Indicator[] = [
  // ==========================================
  // 1. 🇪🇺 EUROSTAT (Europe)
  // ==========================================
  {
    id: 'house_price_index',
    label: 'House Price Index (HPI)',
    labelFr: 'Indice des prix des logements (HPI)',
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
    labelFr: 'Indice des prix à la consommation harmonisé (IPCH)',
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
  {
    id: 'eurostat_unemployment_rate',
    label: 'Harmonised Unemployment Rate',
    labelFr: 'Taux de chômage harmonisé UE',
    description: 'Monthly harmonised unemployment rate representing unemployed persons as a percentage of the total labour force.',
    category: 'Labor Market',
    source: 'eurostat',
    dataset: 'une_rt_m',
    nativeCode: 'TOTAL',
    unit: '%',
    unitCategory: 'percent',
    frequency: ['M', 'A'],
    defaultFrequency: 'M',
    metadata: {
      providerName: 'Eurostat',
      documentationUrl: 'https://ec.europa.eu/eurostat/statistics-explained/index.php?title=Unemployment_statistics'
    }
  },
  {
    id: 'eurostat_gdp_growth',
    label: 'Real GDP Growth Rate (EU / Euro Area)',
    labelFr: 'Croissance du PIB réel (UE & Zone Euro)',
    description: 'Quarterly and annual real GDP volume growth rate adjusted for seasonality and calendar days.',
    category: 'Macroeconomics',
    source: 'eurostat',
    dataset: 'namq_10_gdp',
    nativeCode: 'CLV_PCH_PRE',
    unit: '%',
    unitCategory: 'percent',
    frequency: ['Q', 'A'],
    defaultFrequency: 'Q',
    metadata: {
      providerName: 'Eurostat National Accounts'
    }
  },

  // ==========================================
  // 2. 🌍 IMF (Macro mondiale)
  // ==========================================
  {
    id: 'real_gdp_growth',
    label: 'Real GDP Growth (WEO)',
    labelFr: 'Croissance du PIB réel (FMI WEO)',
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
    labelFr: 'Taux d’inflation annuel moyen (FMI)',
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
    labelFr: 'Dette publique brute (% du PIB, FMI)',
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
    label: 'Unemployment Rate (IMF)',
    labelFr: 'Taux de chômage mondial (FMI)',
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
  },

  // ==========================================
  // 3. 🏦 WORLD BANK (Développement, pauvreté, PIB)
  // ==========================================
  {
    id: 'wb_gdp_usd',
    label: 'GDP in Current US$ (World Bank)',
    labelFr: 'PIB en dollars courants (Banque Mondiale)',
    description: 'Gross domestic product at purchaser prices in current US Dollars, the primary benchmark for global economic size.',
    category: 'Macroeconomics',
    source: 'worldbank',
    dataset: 'WDI',
    nativeCode: 'NY.GDP.MKTP.CD',
    unit: 'USD (Trillions/Billions)',
    unitCategory: 'currency',
    frequency: ['A'],
    defaultFrequency: 'A',
    metadata: {
      providerName: 'World Bank Open Data API',
      documentationUrl: 'https://data.worldbank.org/indicator/NY.GDP.MKTP.CD'
    }
  },
  {
    id: 'wb_gdp_growth',
    label: 'GDP Growth Annual % (World Bank)',
    labelFr: 'Croissance annuelle du PIB % (Banque Mondiale)',
    description: 'Annual percentage growth rate of GDP at market prices based on constant local currency.',
    category: 'Macroeconomics',
    source: 'worldbank',
    dataset: 'WDI',
    nativeCode: 'NY.GDP.MKTP.KD.ZG',
    unit: '%',
    unitCategory: 'percent',
    frequency: ['A'],
    defaultFrequency: 'A',
    metadata: {
      providerName: 'World Bank WDI'
    }
  },
  {
    id: 'wb_gdp_per_capita',
    label: 'GDP Per Capita, PPP (Current Intl $)',
    labelFr: 'PIB par habitant en PPA (Banque Mondiale)',
    description: 'Gross domestic product converted to international dollars using purchasing power parity rates divided by total population.',
    category: 'Development & Society',
    source: 'worldbank',
    dataset: 'WDI',
    nativeCode: 'NY.GDP.PCAP.PP.CD',
    unit: 'USD',
    unitCategory: 'currency',
    frequency: ['A'],
    defaultFrequency: 'A',
    metadata: {
      providerName: 'World Bank WDI'
    }
  },
  {
    id: 'wb_central_govt_debt',
    label: 'Central Government Debt, Total (% of GDP)',
    labelFr: 'Dette de l’État central (% du PIB, BM)',
    description: 'Debt is the entire stock of direct government fixed-term contractual obligations to others outstanding on a particular date.',
    category: 'Public Finance',
    source: 'worldbank',
    dataset: 'WDI',
    nativeCode: 'GC.DOD.TOTL.GD.ZS',
    unit: '% of GDP',
    unitCategory: 'percent',
    frequency: ['A'],
    defaultFrequency: 'A',
    metadata: {
      providerName: 'World Bank WDI'
    }
  },

  // ==========================================
  // 4. 🇺🇸 FRED (États-Unis + séries financières)
  // ==========================================
  {
    id: 'fred_fed_funds_rate',
    label: 'Federal Funds Effective Rate (EFFR)',
    labelFr: 'Taux directeur Fed Funds (Réserve Fédérale)',
    description: 'The core policy rate of the US Federal Reserve, representing the volume-weighted median of overnight fed funds transactions.',
    category: 'Monetary & Banking',
    source: 'fred',
    dataset: 'FRED_FIN',
    nativeCode: 'FEDFUNDS',
    unit: '%',
    unitCategory: 'percent',
    frequency: ['M', 'A'],
    defaultFrequency: 'M',
    metadata: {
      providerName: 'Federal Reserve Bank of St. Louis (FRED)',
      documentationUrl: 'https://fred.stlouisfed.org/series/FEDFUNDS'
    }
  },
  {
    id: 'fred_10y_treasury',
    label: '10-Year Treasury Constant Maturity Rate',
    labelFr: 'Rendement du Trésor US à 10 ans (T-Note 10Y)',
    description: 'Benchmark sovereign long-term interest rate for the United States and global bond markets.',
    category: 'Monetary & Banking',
    source: 'fred',
    dataset: 'FRED_FIN',
    nativeCode: 'DGS10',
    unit: '%',
    unitCategory: 'percent',
    frequency: ['M', 'A'],
    defaultFrequency: 'M',
    metadata: {
      providerName: 'FRED / Federal Reserve Board'
    }
  },
  {
    id: 'fred_case_shiller_housing',
    label: 'S&P/Case-Shiller U.S. National Home Price Index',
    labelFr: 'Indice immobilier Case-Shiller (États-Unis)',
    description: 'Leading measure of US residential real estate prices tracking changes in the value of single-family housing.',
    category: 'Housing',
    source: 'fred',
    dataset: 'FRED_FIN',
    nativeCode: 'CSUSHPINSA',
    unit: 'Index Jan 2000=100',
    unitCategory: 'index',
    frequency: ['M', 'A'],
    defaultFrequency: 'M',
    metadata: {
      providerName: 'FRED / S&P Dow Jones Indices'
    }
  },
  {
    id: 'fred_us_public_debt_gdp',
    label: 'Federal Debt: Total Public Debt as % of GDP',
    labelFr: 'Dette publique fédérale US (% du PIB)',
    description: 'Total public debt outstanding of the United States Federal Government expressed as a percentage of GDP.',
    category: 'Public Finance',
    source: 'fred',
    dataset: 'FRED_FIN',
    nativeCode: 'GFDEGDQ188S',
    unit: '% of GDP',
    unitCategory: 'percent',
    frequency: ['Q', 'A'],
    defaultFrequency: 'Q',
    metadata: {
      providerName: 'FRED / US Treasury & BEA'
    }
  },

  // ==========================================
  // 5. 🇫🇷 INSEE (France détaillée)
  // ==========================================
  {
    id: 'insee_cpi',
    label: 'Consumer Price Index (IPC France)',
    labelFr: 'Indice des Prix à la Consommation (IPC France Insee)',
    description: 'Indice officiel souverain mesurant l’évolution du niveau moyen des prix des biens et services consommés par les ménages en France.',
    category: 'Prices & Inflation',
    source: 'insee',
    dataset: 'INSEE_BDM',
    nativeCode: '001763852',
    unit: 'Index 2015=100',
    unitCategory: 'index',
    frequency: ['M', 'A'],
    defaultFrequency: 'M',
    metadata: {
      providerName: 'INSEE - Banque de Données Macroéconomiques',
      documentationUrl: 'https://www.insee.fr/fr/statistiques/serie/001763852'
    }
  },
  {
    id: 'insee_unemployment',
    label: 'ILO Unemployment Rate in France (Taux de chômage BIT)',
    labelFr: 'Taux de chômage au sens du BIT (France métropolitaine)',
    description: 'Taux de chômage mesuré au sens du Bureau International du Travail (BIT) par l’enquête Emploi trimestrielle de l’INSEE.',
    category: 'Labor Market',
    source: 'insee',
    dataset: 'INSEE_BDM',
    nativeCode: '001688527',
    unit: '%',
    unitCategory: 'percent',
    frequency: ['Q', 'A'],
    defaultFrequency: 'Q',
    metadata: {
      providerName: 'INSEE',
      documentationUrl: 'https://www.insee.fr/fr/statistiques/serie/001688527'
    }
  },
  {
    id: 'insee_housing_index',
    label: 'Notaires-Insee Existing House Price Index',
    labelFr: 'Indice des prix des logements anciens (Notaires-Insee France)',
    description: 'Indice de référence de l’immobilier résidentiel ancien en France métropolitaine calculé conjointement par les Notaires de France et l’INSEE.',
    category: 'Housing',
    source: 'insee',
    dataset: 'INSEE_BDM',
    nativeCode: '001763137',
    unit: 'Index 2015=100',
    unitCategory: 'index',
    frequency: ['Q', 'A'],
    defaultFrequency: 'Q',
    metadata: {
      providerName: 'INSEE & Conseil Supérieur du Notariat'
    }
  },
  {
    id: 'insee_gdp_growth',
    label: 'France Real GDP Quarterly Growth',
    labelFr: 'Croissance trimestrielle du PIB en volume (INSEE)',
    description: 'Évolution trimestrielle du produit intérieur brut en volume corrigé des variations saisonnières et des jours ouvrables (CVS-CJO).',
    category: 'Macroeconomics',
    source: 'insee',
    dataset: 'INSEE_BDM',
    nativeCode: '010565692',
    unit: '%',
    unitCategory: 'percent',
    frequency: ['Q', 'A'],
    defaultFrequency: 'Q',
    metadata: {
      providerName: 'INSEE Comptes Nationaux'
    }
  },
  {
    id: 'insee_public_debt',
    label: 'France Maastricht Public Debt (% of GDP)',
    labelFr: 'Dette publique de la France au sens de Maastricht (% PIB)',
    description: 'Dette brute des administrations publiques françaises au sens du traité de Maastricht, évaluée trimestriellement en pourcentage du PIB.',
    category: 'Public Finance',
    source: 'insee',
    dataset: 'INSEE_BDM',
    nativeCode: '010565800',
    unit: '% of GDP',
    unitCategory: 'percent',
    frequency: ['Q', 'A'],
    defaultFrequency: 'Q',
    metadata: {
      providerName: 'INSEE Finances Publiques'
    }
  },

  // ==========================================
  // 6. 🏦 ECB (BCE : taux, crédit, monnaie)
  // ==========================================
  {
    id: 'ecb_refinancing_rate',
    label: 'ECB Main Refinancing Operations Rate (MRO)',
    labelFr: 'Taux des opérations principales de refinancement (BCE)',
    description: 'Taux d’intérêt directeur principal fixé par le Conseil des gouverneurs de la Banque Centrale Européenne régissant le coût de la liquidité en zone euro.',
    category: 'Monetary & Banking',
    source: 'ecb',
    dataset: 'ECB_SDW',
    nativeCode: 'FM.B.U2.EUR.4F.KR.MRR_MBR.LEV',
    unit: '%',
    unitCategory: 'percent',
    frequency: ['M', 'A'],
    defaultFrequency: 'M',
    metadata: {
      providerName: 'European Central Bank Data Portal',
      documentationUrl: 'https://data.ecb.europa.eu'
    }
  },
  {
    id: 'ecb_deposit_facility_rate',
    label: 'ECB Deposit Facility Rate (DFR)',
    labelFr: 'Taux de la facilité de dépôt (BCE)',
    description: 'Taux d’intérêt que les banques commerciales perçoivent pour leurs dépôts au jour le jour auprès de l’Eurosystème, pivot central de la politique monétaire européenne.',
    category: 'Monetary & Banking',
    source: 'ecb',
    dataset: 'ECB_SDW',
    nativeCode: 'FM.B.U2.EUR.4F.KR.DFR.LEV',
    unit: '%',
    unitCategory: 'percent',
    frequency: ['M', 'A'],
    defaultFrequency: 'M',
    metadata: {
      providerName: 'European Central Bank Data Portal'
    }
  },
  {
    id: 'ecb_euribor_3m',
    label: 'Euribor 3-Month Interest Rate',
    labelFr: 'Taux Euribor 3 mois (Marché interbancaire)',
    description: 'Euro Interbank Offered Rate à échéance 3 mois, référence centrale des prêts bancaires et des obligations en Europe.',
    category: 'Monetary & Banking',
    source: 'ecb',
    dataset: 'ECB_SDW',
    nativeCode: 'FM.M.U2.EUR.RT.MM.EURIBOR3MD_.HSTA',
    unit: '%',
    unitCategory: 'percent',
    frequency: ['M', 'A'],
    defaultFrequency: 'M',
    metadata: {
      providerName: 'ECB / European Money Markets Institute'
    }
  },
  {
    id: 'ecb_m3_money_supply',
    label: 'Euro Area M3 Broad Money Supply Growth',
    labelFr: 'Croissance de la masse monétaire M3 Zone Euro (% an)',
    description: 'Taux de croissance annuel de l’agrégat monétaire large M3 au sein de la zone euro, pilier de l’analyse monétaire de la BCE.',
    category: 'Monetary & Banking',
    source: 'ecb',
    dataset: 'ECB_SDW',
    nativeCode: 'BSI.M.U2.Y.V.M30.X.I.U2.2300.Z01.A',
    unit: '%',
    unitCategory: 'percent',
    frequency: ['M', 'A'],
    defaultFrequency: 'M',
    metadata: {
      providerName: 'European Central Bank Data Portal'
    }
  },

  // ==========================================
  // 7. 🇺🇸 BLS (Emploi / inflation US)
  // ==========================================
  {
    id: 'bls_unemployment_u3',
    label: 'U.S. Civilian Unemployment Rate U-3 (BLS)',
    labelFr: 'Taux de chômage officiel U-3 aux États-Unis (BLS)',
    description: 'Official monthly headline unemployment rate of the civilian noninstitutional population aged 16 and over in the United States.',
    category: 'Labor Market',
    source: 'bls',
    dataset: 'BLS_LABOR',
    nativeCode: 'LNS14000000',
    unit: '%',
    unitCategory: 'percent',
    frequency: ['M', 'A'],
    defaultFrequency: 'M',
    metadata: {
      providerName: 'US Bureau of Labor Statistics',
      documentationUrl: 'https://www.bls.gov'
    }
  },
  {
    id: 'bls_nonfarm_payrolls',
    label: 'U.S. Total Nonfarm Payrolls (Jobs in Thousands)',
    labelFr: 'Créations d’emplois non-agricoles US (Nonfarm Payrolls)',
    description: 'Total number of paid workers in the United States excluding farm employees, private household employees, and non-profit employees.',
    category: 'Labor Market',
    source: 'bls',
    dataset: 'BLS_LABOR',
    nativeCode: 'CES0000000001',
    unit: 'Thousands of Jobs',
    unitCategory: 'count',
    frequency: ['M', 'A'],
    defaultFrequency: 'M',
    metadata: {
      providerName: 'US Bureau of Labor Statistics'
    }
  },
  {
    id: 'bls_cpi_u',
    label: 'U.S. Consumer Price Index for All Urban Consumers (CPI-U)',
    labelFr: 'Indice des prix à la consommation américain CPI-U (BLS)',
    description: 'Monthly index tracking the average change over time in prices paid by urban consumers in the United States.',
    category: 'Prices & Inflation',
    source: 'bls',
    dataset: 'BLS_LABOR',
    nativeCode: 'CUSR0000SA0',
    unit: 'Index 1982-1984=100',
    unitCategory: 'index',
    frequency: ['M', 'A'],
    defaultFrequency: 'M',
    metadata: {
      providerName: 'US Bureau of Labor Statistics'
    }
  },

  // ==========================================
  // 8. 🏛️ OECD (Comparaisons internationales)
  // ==========================================
  {
    id: 'oecd_cli',
    label: 'OECD Composite Leading Indicator (CLI)',
    labelFr: 'Indicateur Composite Avancé de l’OCDE (CLI)',
    description: 'Designed to anticipate turning points in economic activity relative to trend 6-9 months ahead across advanced economies.',
    category: 'Macroeconomics',
    source: 'oecd',
    dataset: 'OECD_MEI',
    nativeCode: 'CLI_AMPLIT',
    unit: 'Index (Trend=100)',
    unitCategory: 'index',
    frequency: ['M', 'A'],
    defaultFrequency: 'M',
    metadata: {
      providerName: 'OECD Data Explorer',
      documentationUrl: 'https://data-explorer.oecd.org'
    }
  },
  {
    id: 'oecd_hur',
    label: 'OECD Harmonised Unemployment Rate',
    labelFr: 'Taux de chômage harmonisé OCDE',
    description: 'Standardized rate enabling direct like-for-like unemployment comparisons across all 38 OECD member nations.',
    category: 'Labor Market',
    source: 'oecd',
    dataset: 'OECD_MEI',
    nativeCode: 'HUR_RATE',
    unit: '%',
    unitCategory: 'percent',
    frequency: ['M', 'A'],
    defaultFrequency: 'M',
    metadata: {
      providerName: 'OECD Data Explorer'
    }
  },
  {
    id: 'oecd_cpi_inflation',
    label: 'OECD Standardised CPI Year-on-Year Inflation',
    labelFr: 'Inflation annuelle harmonisée OCDE (% an)',
    description: 'Year-over-year percentage change in national consumer price indices compiled using standardized OECD methodologies.',
    category: 'Prices & Inflation',
    source: 'oecd',
    dataset: 'OECD_MEI',
    nativeCode: 'CPI_GY',
    unit: '%',
    unitCategory: 'percent',
    frequency: ['M', 'A'],
    defaultFrequency: 'M',
    metadata: {
      providerName: 'OECD Data Explorer'
    }
  },

  // ==========================================
  // 9. 🌐 UN DATA (Données internationales)
  // ==========================================
  {
    id: 'un_total_population',
    label: 'Total Population (UN World Population Prospects)',
    labelFr: 'Population totale mondiale et par pays (ONU)',
    description: 'Official United Nations demographic estimates of total population in millions of persons.',
    category: 'Development & Society',
    source: 'undata',
    dataset: 'UN_WPP',
    nativeCode: 'POP_TOTAL',
    unit: 'Millions of persons',
    unitCategory: 'count',
    frequency: ['A'],
    defaultFrequency: 'A',
    metadata: {
      providerName: 'UN Population Division / UN Data',
      documentationUrl: 'https://population.un.org'
    }
  },
  {
    id: 'un_hdi',
    label: 'Human Development Index (HDI)',
    labelFr: 'Indice de Développement Humain (IDH, ONU)',
    description: 'Composite index measuring average achievement in three key dimensions: long healthy life, knowledge, and decent standard of living.',
    category: 'Development & Society',
    source: 'undata',
    dataset: 'UN_WPP',
    nativeCode: 'HDI_INDEX',
    unit: 'Score (0 to 1)',
    unitCategory: 'index',
    frequency: ['A'],
    defaultFrequency: 'A',
    metadata: {
      providerName: 'UNDP Human Development Reports'
    }
  },

  // ==========================================
  // 10. 🏦 BIS (Banque, crédit, dette)
  // ==========================================
  {
    id: 'bis_policy_rate',
    label: 'Central Bank Policy Rates (BIS Comparative Matrix)',
    labelFr: 'Taux directeurs des banques centrales mondiales (BRI / BIS)',
    description: 'Comparative policy rates across global central banks (Federal Reserve, ECB, Bank of Japan, Bank of England, Swiss National Bank, PBoC).',
    category: 'Monetary & Banking',
    source: 'bis',
    dataset: 'BIS_STATS',
    nativeCode: 'CB_POLICY_RATE',
    unit: '%',
    unitCategory: 'percent',
    frequency: ['M', 'A'],
    defaultFrequency: 'M',
    metadata: {
      providerName: 'Bank for International Settlements (BIS)',
      documentationUrl: 'https://www.bis.org/statistics'
    }
  },
  {
    id: 'bis_credit_gdp',
    label: 'Credit to Non-Financial Sector (% of GDP)',
    labelFr: 'Crédit au secteur privé non-financier (% du PIB, BRI)',
    description: 'Total credit extended to non-financial corporations and households as a percentage of gross domestic product.',
    category: 'Monetary & Banking',
    source: 'bis',
    dataset: 'BIS_STATS',
    nativeCode: 'CREDIT_NONFIN_GDP',
    unit: '% of GDP',
    unitCategory: 'percent',
    frequency: ['Q', 'A'],
    defaultFrequency: 'Q',
    metadata: {
      providerName: 'Bank for International Settlements'
    }
  },
  {
    id: 'bis_reer',
    label: 'Real Effective Exchange Rate Index (REER)',
    labelFr: 'Taux de change effectif réel (REER, BRI)',
    description: 'Trade-weighted exchange rates deflated by consumer prices, reflecting national external price competitiveness.',
    category: 'External Sector',
    source: 'bis',
    dataset: 'BIS_STATS',
    nativeCode: 'REER_CPI_INDEX',
    unit: 'Index 2020=100',
    unitCategory: 'index',
    frequency: ['M', 'A'],
    defaultFrequency: 'M',
    metadata: {
      providerName: 'Bank for International Settlements'
    }
  },

  // ==========================================
  // 11. 🛢️ EIA (Énergie)
  // ==========================================
  {
    id: 'eia_brent_oil',
    label: 'Brent Crude Oil Spot Price (USD/Barrel)',
    labelFr: 'Pétrole Brut Brent spot (USD par baril, EIA)',
    description: 'International benchmark price for North Sea light sweet crude oil, the global pricing standard for two thirds of internationally traded crude.',
    category: 'Energy',
    source: 'eia',
    dataset: 'EIA_STEO',
    nativeCode: 'PET.RBRTE.D',
    unit: 'USD/barrel',
    unitCategory: 'currency',
    frequency: ['M', 'A'],
    defaultFrequency: 'M',
    metadata: {
      providerName: 'U.S. Energy Information Administration (EIA)',
      documentationUrl: 'https://www.eia.gov'
    }
  },
  {
    id: 'eia_wti_oil',
    label: 'WTI Crude Oil Spot Price (USD/Barrel)',
    labelFr: 'Pétrole Brut WTI spot (USD par baril, EIA)',
    description: 'West Texas Intermediate crude oil spot price at Cushing, Oklahoma, benchmark for US oil markets.',
    category: 'Energy',
    source: 'eia',
    dataset: 'EIA_STEO',
    nativeCode: 'PET.RWTC.D',
    unit: 'USD/barrel',
    unitCategory: 'currency',
    frequency: ['M', 'A'],
    defaultFrequency: 'M',
    metadata: {
      providerName: 'U.S. Energy Information Administration'
    }
  },
  {
    id: 'eia_henry_hub_gas',
    label: 'Henry Hub Natural Gas Spot Price (USD/MMBtu)',
    labelFr: 'Gaz naturel spot Henry Hub (USD par MMBtu, EIA)',
    description: 'Pricing benchmark for natural gas in the United States and global LNG export valuation.',
    category: 'Energy',
    source: 'eia',
    dataset: 'EIA_STEO',
    nativeCode: 'NG.RNGWHHD.M',
    unit: 'USD/MMBtu',
    unitCategory: 'currency',
    frequency: ['M', 'A'],
    defaultFrequency: 'M',
    metadata: {
      providerName: 'U.S. Energy Information Administration'
    }
  },

  // ==========================================
  // 12. 🌾 FAO (Agriculture / Alimentation)
  // ==========================================
  {
    id: 'fao_food_price_index',
    label: 'FAO Food Price Index (World Benchmark)',
    labelFr: 'Indice mondial FAO des prix des denrées alimentaires',
    description: 'Indice de référence mesurant la variation mensuelle des cours internationaux d’un panier de produits alimentaires de base (céréales, huiles, viande, produits laitiers, sucre).',
    category: 'Agriculture & Food',
    source: 'fao',
    dataset: 'FAO_FAOSTAT',
    nativeCode: 'FAO_FFPI',
    unit: 'Index 2014-2016=100',
    unitCategory: 'index',
    frequency: ['M', 'A'],
    defaultFrequency: 'M',
    metadata: {
      providerName: 'Food and Agriculture Organization (FAO)',
      documentationUrl: 'https://www.fao.org/worldfoodsituation/foodpricesindex'
    }
  },
  {
    id: 'fao_cereal_price_index',
    label: 'FAO Cereal Price Index (Wheat, Maize, Rice)',
    labelFr: 'Indice FAO des prix des céréales (Blé, Maïs, Riz)',
    description: 'Sous-indice FAO suivant les cours internationaux des céréales majeures (blé, maïs, riz et grains secondaires).',
    category: 'Agriculture & Food',
    source: 'fao',
    dataset: 'FAO_FAOSTAT',
    nativeCode: 'FAO_CEREAL',
    unit: 'Index 2014-2016=100',
    unitCategory: 'index',
    frequency: ['M', 'A'],
    defaultFrequency: 'M',
    metadata: {
      providerName: 'Food and Agriculture Organization'
    }
  }
];

