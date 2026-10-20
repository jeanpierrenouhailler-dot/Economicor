import { UNIFIED_INDICATORS, Indicator } from '../models/Indicator';
import { COUNTRIES, Country } from '../models/Country';
import { DataQuery } from '../models/Query';

export type EconomicConceptId =
  | 'gdp'
  | 'inflation'
  | 'unemployment'
  | 'debt'
  | 'policy_rate'
  | 'housing'
  | 'energy'
  | 'food'
  | 'credit_money'
  | 'population';

export interface SourceResolution {
  conceptId: EconomicConceptId;
  countryCode: string;
  source: string;
  sourceName: string;
  indicatorId: string;
  indicator: Indicator;
  dataset: string;
  reasonFr: string;
  reasonEn: string;
  priorityScore: number;
  alternatives: Array<{
    source: string;
    sourceName: string;
    indicatorId: string;
    dataset: string;
    label: string;
  }>;
}

export interface EconomicConcept {
  id: EconomicConceptId;
  labelFr: string;
  labelEn: string;
  descriptionFr: string;
  icon: string; // Lucide icon name or emoji
  unit: string;
  defaultFrequency: string;
}

export const ECONOMIC_CONCEPTS: EconomicConcept[] = [
  {
    id: 'gdp',
    labelFr: 'PIB (Croissance)',
    labelEn: 'GDP Growth',
    descriptionFr: 'Produit Intérieur Brut en volume, indicateur fondamental de création de richesse',
    icon: 'TrendingUp',
    unit: '%',
    defaultFrequency: 'Q'
  },
  {
    id: 'inflation',
    labelFr: 'Inflation (IPC / IPCH)',
    labelEn: 'Inflation (CPI / HICP)',
    descriptionFr: 'Indice des prix à la consommation mesurant le pouvoir d’achat et l’érosion monétaire',
    icon: 'Activity',
    unit: '%',
    defaultFrequency: 'M'
  },
  {
    id: 'unemployment',
    labelFr: 'Chômage (Taux)',
    labelEn: 'Unemployment Rate',
    descriptionFr: 'Proportion de la population active sans emploi à la recherche active de travail',
    icon: 'Users',
    unit: '%',
    defaultFrequency: 'M'
  },
  {
    id: 'debt',
    labelFr: 'Dette publique (% PIB)',
    labelEn: 'Public Debt (% of GDP)',
    descriptionFr: 'Engagements financiers bruts des administrations publiques rapportés au PIB',
    icon: 'Landmark',
    unit: '% of GDP',
    defaultFrequency: 'A'
  },
  {
    id: 'policy_rate',
    labelFr: 'Taux directeur (Banque Centrale)',
    labelEn: 'Policy Interest Rate',
    descriptionFr: 'Taux d’intérêt officiel fixé par la banque centrale souveraine (BCE, Fed, BRI)',
    icon: 'Percent',
    unit: '%',
    defaultFrequency: 'M'
  },
  {
    id: 'housing',
    labelFr: 'Immobilier (Indice des prix)',
    labelEn: 'House Price Index',
    descriptionFr: 'Indice transactionnel des prix des logements résidentiels neufs et anciens',
    icon: 'Building2',
    unit: 'Index 2015=100',
    defaultFrequency: 'Q'
  },
  {
    id: 'energy',
    labelFr: 'Énergie (Pétrole Brent & WTI)',
    labelEn: 'Energy & Oil Prices',
    descriptionFr: 'Cours de référence du pétrole brut et du gaz naturel (EIA)',
    icon: 'Flame',
    unit: 'USD/barrel',
    defaultFrequency: 'M'
  },
  {
    id: 'food',
    labelFr: 'Alimentation (Indice FAO)',
    labelEn: 'FAO Food Price Index',
    descriptionFr: 'Indice des cours mondiaux des denrées agricoles de base (ONU / FAO)',
    icon: 'Wheat',
    unit: 'Index 2014-2016=100',
    defaultFrequency: 'M'
  },
  {
    id: 'credit_money',
    labelFr: 'Crédit & Masse Monétaire',
    labelEn: 'Credit & Money Supply M3',
    descriptionFr: 'Agrégats monétaires larges et octroi de crédit bancaire (BCE & BRI)',
    icon: 'CircleDollarSign',
    unit: '%',
    defaultFrequency: 'M'
  },
  {
    id: 'population',
    labelFr: 'Population & IDH',
    labelEn: 'Population & HDI',
    descriptionFr: 'Démographie et Indice de Développement Humain (ONU)',
    icon: 'Globe',
    unit: 'Millions / Score',
    defaultFrequency: 'A'
  }
];

// The core 6 pillars requested: PIB + inflation + chômage + dette + taux directeur + immobilier
export const MACRO_HEXAGON_CONCEPTS: EconomicConceptId[] = [
  'gdp',
  'inflation',
  'unemployment',
  'debt',
  'policy_rate',
  'housing'
];

export const SOURCE_METADATA: Record<string, { name: string; badge: string; flag: string; specialty: string }> = {
  eurostat: { name: 'Eurostat', badge: '🇪🇺 Eurostat', flag: '🇪🇺', specialty: 'Statistiques harmonisées européennes (UE & Zone Euro)' },
  imf: { name: 'IMF (FMI)', badge: '🌍 FMI', flag: '🌍', specialty: 'Macroéconomie mondiale et perspectives WEO' },
  worldbank: { name: 'World Bank', badge: '🏦 Banque Mondiale', flag: '🏦', specialty: 'Développement mondial, PIB en USD et pauvreté' },
  fred: { name: 'FRED St. Louis', badge: '🇺🇸 FRED', flag: '🇺🇸', specialty: 'États-Unis et séries financières de la Réserve Fédérale' },
  insee: { name: 'INSEE', badge: '🇫🇷 INSEE', flag: '🇫🇷', specialty: 'Statistiques souveraines françaises à haute granularité' },
  ecb: { name: 'ECB (BCE)', badge: '🏦 BCE', flag: '🏦', specialty: 'Taux directeurs, masse monétaire M3 et crédit Zone Euro' },
  bls: { name: 'US BLS', badge: '🇺🇸 BLS', flag: '🇺🇸', specialty: 'Marché de l’emploi américain et inflation CPI-U' },
  oecd: { name: 'OECD (OCDE)', badge: '🏛️ OCDE', flag: '🏛️', specialty: 'Comparaisons standardisées entre pays développés' },
  undata: { name: 'UN Data', badge: '🌐 ONU', flag: '🌐', specialty: 'Démographie mondiale et Indice de Développement Humain' },
  bis: { name: 'BIS (BRI)', badge: '🏦 BRI / BIS', flag: '🏦', specialty: 'Banque des règlements internationaux et matrice des taux mondiaux' },
  eia: { name: 'U.S. EIA', badge: '🛢️ EIA', flag: '🛢️', specialty: 'Énergie mondiale, cours du pétrole brut et gaz naturel' },
  fao: { name: 'FAO', badge: '🌾 FAO', flag: '🌾', specialty: 'Indice mondial des prix alimentaires et matières premières agricoles' }
};

export class SourceRouter {
  /**
   * Intelligently resolves the optimal data source for a given economic concept and country.
   */
  public static resolveBestSource(conceptId: EconomicConceptId, countryCode: string = 'FR'): SourceResolution {
    const code = countryCode.toUpperCase();
    const isFrance = code === 'FR' || code === 'FRA';
    const isUS = code === 'US' || code === 'USA';
    const country = COUNTRIES.find(c => c.code === code || c.iso3 === code);
    const isEU = country?.isEU || country?.isEurozone || ['DE', 'IT', 'ES', 'NL', 'BE', 'AT', 'PT', 'IE', 'GR', 'FI'].includes(code);

    let chosenIndId = '';
    let reasonFr = '';
    let reasonEn = '';
    let priority = 100;
    const alternatives: SourceResolution['alternatives'] = [];

    switch (conceptId) {
      // -------------------------------------------------------------
      // 1. PIB / GDP
      // -------------------------------------------------------------
      case 'gdp':
        if (isFrance) {
          chosenIndId = 'insee_gdp_growth';
          reasonFr = 'INSEE sélectionné : comptabilité nationale souveraine trimestrielle de haute précision pour la France (CVS-CJO).';
          reasonEn = 'INSEE selected: Sovereign French national accounts quarterly series with highest precision.';
          alternatives.push(
            { source: 'eurostat', sourceName: 'Eurostat', indicatorId: 'eurostat_gdp_growth', dataset: 'namq_10_gdp', label: 'Eurostat PIB Harmonisé' },
            { source: 'imf', sourceName: 'IMF', indicatorId: 'real_gdp_growth', dataset: 'WEO', label: 'FMI WEO Prévisions PIB' }
          );
        } else if (isEU) {
          chosenIndId = 'eurostat_gdp_growth';
          reasonFr = 'Eurostat sélectionné : référence officielle européenne harmonisée (SEC 2010).';
          reasonEn = 'Eurostat selected: Official harmonised European standard (ESA 2010).';
          alternatives.push(
            { source: 'imf', sourceName: 'IMF', indicatorId: 'real_gdp_growth', dataset: 'WEO', label: 'FMI WEO' },
            { source: 'worldbank', sourceName: 'World Bank', indicatorId: 'wb_gdp_growth', dataset: 'WDI', label: 'Banque Mondiale WDI' }
          );
        } else if (isUS) {
          chosenIndId = 'real_gdp_growth';
          reasonFr = 'FMI / FRED sélectionné : données officielles de croissance du PIB en volume.';
          reasonEn = 'IMF / FRED selected: Official real GDP volume growth series.';
          alternatives.push(
            { source: 'worldbank', sourceName: 'World Bank', indicatorId: 'wb_gdp_growth', dataset: 'WDI', label: 'Banque Mondiale' }
          );
        } else {
          chosenIndId = 'wb_gdp_growth';
          reasonFr = 'Banque Mondiale sélectionnée : couverture multilatérale globale exhaustive.';
          reasonEn = 'World Bank selected: Comprehensive multilateral global coverage.';
          alternatives.push(
            { source: 'imf', sourceName: 'IMF', indicatorId: 'real_gdp_growth', dataset: 'WEO', label: 'FMI WEO' }
          );
        }
        break;

      // -------------------------------------------------------------
      // 2. INFLATION
      // -------------------------------------------------------------
      case 'inflation':
        if (isFrance) {
          chosenIndId = 'insee_cpi';
          reasonFr = 'INSEE sélectionné : IPC France officiel, baromètre souverain du pouvoir d’achat et revalorisation du SMIC.';
          reasonEn = 'INSEE selected: Official French national CPI benchmark.';
          alternatives.push(
            { source: 'eurostat', sourceName: 'Eurostat', indicatorId: 'eurostat_hicp_inflation', dataset: 'prc_hicp_midx', label: 'Eurostat IPCH Harmonisé' },
            { source: 'imf', sourceName: 'IMF', indicatorId: 'imf_inflation_rate', dataset: 'WEO', label: 'FMI Inflation Annuelle' }
          );
        } else if (isEU) {
          chosenIndId = 'eurostat_hicp_inflation';
          reasonFr = 'Eurostat sélectionné : IPCH officiel, indice cible de la Banque Centrale Européenne (objectif 2%).';
          reasonEn = 'Eurostat selected: Harmonised HICP index targeted by the ECB.';
          alternatives.push(
            { source: 'oecd', sourceName: 'OECD', indicatorId: 'oecd_cpi_inflation', dataset: 'OECD_MEI', label: 'OCDE CPI Harmonisé' },
            { source: 'imf', sourceName: 'IMF', indicatorId: 'imf_inflation_rate', dataset: 'WEO', label: 'FMI Inflation WEO' }
          );
        } else if (isUS) {
          chosenIndId = 'bls_cpi_u';
          reasonFr = 'BLS sélectionné : CPI-U américain, mesure phare officielle de l’inflation aux États-Unis.';
          reasonEn = 'BLS selected: Official US Consumer Price Index headline measure.';
          alternatives.push(
            { source: 'imf', sourceName: 'IMF', indicatorId: 'imf_inflation_rate', dataset: 'WEO', label: 'FMI WEO Inflation' }
          );
        } else {
          chosenIndId = 'imf_inflation_rate';
          reasonFr = 'FMI WEO sélectionné : indice standardisé pour comparaisons internationales.';
          reasonEn = 'IMF WEO selected: Standardized index for international comparisons.';
          alternatives.push(
            { source: 'oecd', sourceName: 'OECD', indicatorId: 'oecd_cpi_inflation', dataset: 'OECD_MEI', label: 'OCDE Inflation' }
          );
        }
        break;

      // -------------------------------------------------------------
      // 3. CHÔMAGE / UNEMPLOYMENT
      // -------------------------------------------------------------
      case 'unemployment':
        if (isFrance) {
          chosenIndId = 'insee_unemployment';
          reasonFr = 'INSEE sélectionné : Taux de chômage au sens du BIT de l’enquête Emploi trimestrielle Insee.';
          reasonEn = 'INSEE selected: Official French ILO unemployment survey rate.';
          alternatives.push(
            { source: 'eurostat', sourceName: 'Eurostat', indicatorId: 'eurostat_unemployment_rate', dataset: 'une_rt_m', label: 'Eurostat Chômage Harmonisé' },
            { source: 'imf', sourceName: 'IMF', indicatorId: 'unemployment_rate', dataset: 'WEO', label: 'FMI Chômage Annuel' }
          );
        } else if (isEU) {
          chosenIndId = 'eurostat_unemployment_rate';
          reasonFr = 'Eurostat sélectionné : taux de chômage mensuel harmonisé pour l’Union européenne.';
          reasonEn = 'Eurostat selected: Monthly harmonised EU unemployment rate.';
          alternatives.push(
            { source: 'oecd', sourceName: 'OECD', indicatorId: 'oecd_hur', dataset: 'OECD_MEI', label: 'OCDE Taux Harmonisé HUR' }
          );
        } else if (isUS) {
          chosenIndId = 'bls_unemployment_u3';
          reasonFr = 'BLS sélectionné : Taux officiel U-3 de la population active civile américaine.';
          reasonEn = 'BLS selected: Official civilian U-3 unemployment rate.';
          alternatives.push(
            { source: 'imf', sourceName: 'IMF', indicatorId: 'unemployment_rate', dataset: 'WEO', label: 'FMI Chômage' }
          );
        } else {
          chosenIndId = 'oecd_hur';
          reasonFr = 'OCDE / FMI sélectionné : méthodologie BIT standardisée pour comparaisons fiables.';
          reasonEn = 'OECD / IMF selected: Standardized ILO methodology.';
          alternatives.push(
            { source: 'imf', sourceName: 'IMF', indicatorId: 'unemployment_rate', dataset: 'WEO', label: 'FMI Chômage' }
          );
        }
        break;

      // -------------------------------------------------------------
      // 4. DETTE PUBLIQUE / PUBLIC DEBT
      // -------------------------------------------------------------
      case 'debt':
        if (isFrance) {
          chosenIndId = 'insee_public_debt';
          reasonFr = 'INSEE sélectionné : dette publique officielle au sens du traité de Maastricht pour la France.';
          reasonEn = 'INSEE selected: Official Maastricht Treaty sovereign debt for France.';
          alternatives.push(
            { source: 'imf', sourceName: 'IMF', indicatorId: 'general_govt_debt', dataset: 'WEO', label: 'FMI Dette Publique Brute' },
            { source: 'worldbank', sourceName: 'World Bank', indicatorId: 'wb_central_govt_debt', dataset: 'WDI', label: 'Banque Mondiale' }
          );
        } else if (isUS) {
          chosenIndId = 'fred_us_public_debt_gdp';
          reasonFr = 'FRED / US Treasury sélectionné : dette publique totale fédérale américaine en % du PIB.';
          reasonEn = 'FRED / US Treasury selected: Total public debt as % of US GDP.';
          alternatives.push(
            { source: 'imf', sourceName: 'IMF', indicatorId: 'general_govt_debt', dataset: 'WEO', label: 'FMI WEO Dette' }
          );
        } else {
          chosenIndId = 'general_govt_debt';
          reasonFr = 'FMI WEO sélectionné : référence mondiale sur les engagements bruts des administrations publiques.';
          reasonEn = 'IMF WEO selected: Global benchmark for general government gross debt.';
          alternatives.push(
            { source: 'worldbank', sourceName: 'World Bank', indicatorId: 'wb_central_govt_debt', dataset: 'WDI', label: 'Banque Mondiale Dette' },
            { source: 'bis', sourceName: 'BIS', indicatorId: 'bis_credit_gdp', dataset: 'BIS_STATS', label: 'BRI Crédit Secteur Non-Financier' }
          );
        }
        break;

      // -------------------------------------------------------------
      // 5. TAUX DIRECTEUR / POLICY RATE
      // -------------------------------------------------------------
      case 'policy_rate':
        if (isFrance || isEU) {
          chosenIndId = 'ecb_refinancing_rate';
          reasonFr = 'BCE sélectionnée : autorité monétaire souveraine de l’Eurosystème fixant le coût de la liquidité en France et en Europe.';
          reasonEn = 'ECB selected: Sovereign central banking authority setting liquidity costs for France and the Eurozone.';
          alternatives.push(
            { source: 'ecb', sourceName: 'ECB', indicatorId: 'ecb_deposit_facility_rate', dataset: 'ECB_SDW', label: 'BCE Facilité de Dépôt' },
            { source: 'ecb', sourceName: 'ECB', indicatorId: 'ecb_euribor_3m', dataset: 'ECB_SDW', label: 'Euribor 3 Mois' },
            { source: 'bis', sourceName: 'BIS', indicatorId: 'bis_policy_rate', dataset: 'BIS_STATS', label: 'BRI Taux Directeurs Comparés' }
          );
        } else if (isUS) {
          chosenIndId = 'fred_fed_funds_rate';
          reasonFr = 'FRED / Fed sélectionné : Taux effectif des Fed Funds fixé par le Federal Open Market Committee (FOMC).';
          reasonEn = 'FRED / Fed selected: Federal Funds Effective Rate set by the FOMC.';
          alternatives.push(
            { source: 'fred', sourceName: 'FRED', indicatorId: 'fred_10y_treasury', dataset: 'FRED_FIN', label: 'Taux US à 10 ans' },
            { source: 'bis', sourceName: 'BIS', indicatorId: 'bis_policy_rate', dataset: 'BIS_STATS', label: 'BRI Matrice des Taux' }
          );
        } else {
          chosenIndId = 'bis_policy_rate';
          reasonFr = 'BRI (Banque des Règlements Internationaux) sélectionnée : matrice globale unifiée des taux directeurs centraux.';
          reasonEn = 'BIS selected: Unified global matrix of central bank policy rates.';
          alternatives.push(
            { source: 'fred', sourceName: 'FRED', indicatorId: 'fred_fed_funds_rate', dataset: 'FRED_FIN', label: 'Fed Funds US' },
            { source: 'ecb', sourceName: 'ECB', indicatorId: 'ecb_refinancing_rate', dataset: 'ECB_SDW', label: 'Taux BCE MRO' }
          );
        }
        break;

      // -------------------------------------------------------------
      // 6. IMMOBILIER / HOUSING
      // -------------------------------------------------------------
      case 'housing':
        if (isFrance) {
          chosenIndId = 'insee_housing_index';
          reasonFr = 'INSEE sélectionné : Indice officiel des prix des logements anciens Notaires-Insee, référence incontestable en France.';
          reasonEn = 'INSEE selected: Notaires-Insee official existing home price index for France.';
          alternatives.push(
            { source: 'eurostat', sourceName: 'Eurostat', indicatorId: 'house_price_index', dataset: 'prc_hpi_q', label: 'Eurostat HPI Logements' }
          );
        } else if (isUS) {
          chosenIndId = 'fred_case_shiller_housing';
          reasonFr = 'FRED sélectionné : Indice S&P/Case-Shiller, baromètre de référence de l’immobilier résidentiel américain.';
          reasonEn = 'FRED selected: S&P/Case-Shiller Home Price Index for US housing.';
          alternatives.push(
            { source: 'eurostat', sourceName: 'Eurostat', indicatorId: 'house_price_index', dataset: 'prc_hpi_q', label: 'Eurostat HPI' }
          );
        } else {
          chosenIndId = 'house_price_index';
          reasonFr = 'Eurostat HPI sélectionné : norme internationale de comptabilité des transactions résidentielles.';
          reasonEn = 'Eurostat HPI selected: International standard for residential transactions.';
          alternatives.push(
            { source: 'fred', sourceName: 'FRED', indicatorId: 'fred_case_shiller_housing', dataset: 'FRED_FIN', label: 'Case-Shiller US' }
          );
        }
        break;

      // -------------------------------------------------------------
      // 7. ÉNERGIE / ENERGY
      // -------------------------------------------------------------
      case 'energy':
        chosenIndId = 'eia_brent_oil';
        reasonFr = 'EIA (Energy Information Administration) sélectionnée : référence officielle mondiale pour les cotations énergétiques.';
        reasonEn = 'EIA selected: Official global energy agency benchmark.';
        alternatives.push(
          { source: 'eia', sourceName: 'EIA', indicatorId: 'eia_wti_oil', dataset: 'EIA_STEO', label: 'Pétrole WTI Spot' },
          { source: 'eia', sourceName: 'EIA', indicatorId: 'eia_henry_hub_gas', dataset: 'EIA_STEO', label: 'Gaz Naturel Henry Hub' }
        );
        break;

      // -------------------------------------------------------------
      // 8. ALIMENTATION / FOOD
      // -------------------------------------------------------------
      case 'food':
        chosenIndId = 'fao_food_price_index';
        reasonFr = 'FAO (ONU) sélectionnée : indice universel officiel des cours des produits alimentaires de base.';
        reasonEn = 'FAO (UN) selected: Universal official index of global staple food prices.';
        alternatives.push(
          { source: 'fao', sourceName: 'FAO', indicatorId: 'fao_cereal_price_index', dataset: 'FAO_FAOSTAT', label: 'FAO Indice Céréales' }
        );
        break;

      // -------------------------------------------------------------
      // 9. CRÉDIT & MONNAIE / CREDIT & MONEY
      // -------------------------------------------------------------
      case 'credit_money':
        if (isFrance || isEU) {
          chosenIndId = 'ecb_m3_money_supply';
          reasonFr = 'BCE sélectionnée : agrégat de monnaie M3 et suivi de la création de liquidité bancaire en zone euro.';
          reasonEn = 'ECB selected: Broad money M3 aggregate and liquidity monitoring.';
          alternatives.push(
            { source: 'bis', sourceName: 'BIS', indicatorId: 'bis_credit_gdp', dataset: 'BIS_STATS', label: 'BRI Crédit Secteur Non-Financier' }
          );
        } else {
          chosenIndId = 'bis_credit_gdp';
          reasonFr = 'BRI sélectionnée : ratio de crédit au secteur privé non financier standardisé.';
          reasonEn = 'BIS selected: Standardized credit to private non-financial sector.';
          alternatives.push(
            { source: 'ecb', sourceName: 'ECB', indicatorId: 'ecb_m3_money_supply', dataset: 'ECB_SDW', label: 'BCE Monnaie M3' }
          );
        }
        break;

      // -------------------------------------------------------------
      // 10. POPULATION & DÉVELOPPEMENT
      // -------------------------------------------------------------
      case 'population':
        chosenIndId = 'un_total_population';
        reasonFr = 'ONU Division de la Population sélectionnée : estimations démographiques officielles globales.';
        reasonEn = 'UN Population Division selected: Official multilateral demographic estimates.';
        alternatives.push(
          { source: 'undata', sourceName: 'UN Data', indicatorId: 'un_hdi', dataset: 'UN_WPP', label: 'ONU Indice de Développement Humain (IDH)' },
          { source: 'worldbank', sourceName: 'World Bank', indicatorId: 'wb_gdp_per_capita', dataset: 'WDI', label: 'Banque Mondiale PIB/Habitant' }
        );
        break;
    }

    const indicator = UNIFIED_INDICATORS.find(i => i.id === chosenIndId) || UNIFIED_INDICATORS[0];
    const sourceMeta = SOURCE_METADATA[indicator.source] || { name: indicator.source.toUpperCase() };

    return {
      conceptId,
      countryCode: code,
      source: indicator.source,
      sourceName: sourceMeta.name,
      indicatorId: indicator.id,
      indicator,
      dataset: indicator.dataset,
      reasonFr,
      reasonEn,
      priorityScore: priority,
      alternatives
    };
  }

  /**
   * Resolves the full multi-concept cockpit (e.g. the 6 macro pillars)
   * PIB + inflation + chômage + dette + taux directeur + immobilier
   */
  public static resolveCockpit(
    conceptIds: EconomicConceptId[] = MACRO_HEXAGON_CONCEPTS,
    countryCode: string = 'FR'
  ): SourceResolution[] {
    return conceptIds.map(id => this.resolveBestSource(id, countryCode));
  }

  /**
   * Creates executable DataQuery objects from a list of resolved concept resolutions.
   */
  public static buildQueries(resolutions: SourceResolution[], countryCode: string = 'FR'): DataQuery[] {
    return resolutions.map(res => ({
      source: res.source,
      dataset: res.dataset,
      indicator: res.indicatorId,
      countries: [countryCode],
      frequency: res.indicator.defaultFrequency
    }));
  }
}
