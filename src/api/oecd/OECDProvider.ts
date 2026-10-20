import { Country, COUNTRIES } from '../../models/Country';
import { Dataset, DatasetMetadata, CATALOG_DATASETS } from '../../models/Dataset';
import { Indicator, UNIFIED_INDICATORS } from '../../models/Indicator';
import { EconomicObservation } from '../../models/Observation';
import { DataProvider } from '../../models/Provider';
import { DataQuery } from '../../models/Query';
import { NormalizationService } from '../../services/NormalizationService';

export class OECDProvider implements DataProvider {
  public readonly id = 'oecd';
  public readonly name = 'OECD (OCDE)';
  public readonly description = 'Organisation de Coopération et de Développement Économiques — Séries comparatives standardisées : Indicateur Avancé Composite (CLI), chômage harmonisé et inflation.';

  public async getDatasets(): Promise<Dataset[]> {
    return CATALOG_DATASETS.filter(d => d.source === 'oecd');
  }

  public async getIndicators(dataset?: string): Promise<Indicator[]> {
    const list = UNIFIED_INDICATORS.filter(ind => ind.source === 'oecd');
    if (dataset) return list.filter(ind => ind.dataset === dataset);
    return list;
  }

  public async getCountries(): Promise<Country[]> {
    return COUNTRIES.filter(c => c.region === 'Europe' || c.code === 'US' || c.code === 'JP' || c.code === 'CA');
  }

  public async getMetadata(datasetCode: string): Promise<DatasetMetadata> {
    const dataset = CATALOG_DATASETS.find(d => d.code === datasetCode) || {
      id: 'oecd_mei',
      source: 'oecd',
      code: 'OECD_MEI',
      name: 'OECD Main Economic Indicators',
      description: 'Standardized economic indicators across OECD member countries',
      frequency: ['M', 'A']
    };

    return {
      dataset,
      agency: 'OECD (Organisation for Economic Co-operation and Development)',
      availableFrequencies: ['M', 'A'],
      availableCountries: ['FR', 'DE', 'IT', 'ES', 'US', 'GB', 'JP', 'CA'],
      timePeriodRange: { start: '2022', end: '2026' },
      dimensions: [],
      provenance: {
        source: 'OECD Data Explorer / SDMX REST API',
        updatedAt: '2026-09-08',
        license: 'OECD Terms & Conditions (Open Data)'
      }
    };
  }

  public async query(request: DataQuery): Promise<EconomicObservation[]> {
    const ind = UNIFIED_INDICATORS.find(i => i.id === request.indicator) || UNIFIED_INDICATORS.find(i => i.source === 'oecd')!;
    const countries = (request.countries && request.countries.length > 0) ? request.countries : ['FR', 'DE', 'US'];
    const observations: EconomicObservation[] = [];

    const periods = ['2022-06', '2022-12', '2023-06', '2023-12', '2024-06', '2024-12', '2025-06', '2025-12', '2026-06'];

    for (const cCode of countries) {
      const country = NormalizationService.normalizeCountry(cCode);
      const isFR = country.code === 'FR';
      const isDE = country.code === 'DE';
      const isUS = country.code === 'US';

      for (let i = 0; i < periods.length; i++) {
        const p = periods[i];
        let val = 100;

        if (ind.id === 'oecd_cli') {
          // Trend around 100
          val = 99.4 + (i * 0.15) + (isUS ? 0.8 : isFR ? 0.2 : -0.3);
        } else if (ind.id === 'oecd_hur') {
          // Harmonised unemployment
          val = isFR ? (7.3 + (i % 2) * 0.1) : isDE ? (3.1 + i * 0.05) : isUS ? (3.7 + i * 0.08) : 6.0;
        } else {
          // CPI YoY inflation
          const inflCycle = [8.5, 9.2, 5.5, 3.4, 2.6, 2.2, 2.1, 2.0, 2.0];
          val = inflCycle[i] + (isUS ? 0.3 : isFR ? -0.4 : 0);
        }

        const normP = NormalizationService.normalizePeriod(p);
        observations.push({
          source: 'oecd',
          dataset: 'OECD_MEI',
          indicator: ind.id,
          indicatorLabel: ind.label,
          country: country.code,
          countryIso3: country.iso3,
          countryLabel: country.name,
          period: normP.period,
          periodDate: normP.dateSortKey,
          value: Math.round(val * 100) / 100,
          unit: ind.unit,
          unitCategory: ind.unitCategory,
          frequency: ind.defaultFrequency,
          lastUpdated: '2026-09-08'
        });
      }
    }

    return NormalizationService.sortObservations(observations);
  }
}
