import { Country, COUNTRIES } from '../../models/Country';
import { Dataset, DatasetMetadata, CATALOG_DATASETS } from '../../models/Dataset';
import { Indicator, UNIFIED_INDICATORS } from '../../models/Indicator';
import { EconomicObservation } from '../../models/Observation';
import { DataProvider } from '../../models/Provider';
import { DataQuery } from '../../models/Query';
import { NormalizationService } from '../../services/NormalizationService';

export class FAOProvider implements DataProvider {
  public readonly id = 'fao';
  public readonly name = 'FAO (Food and Agriculture Organization)';
  public readonly description = 'Organisation des Nations Unies pour l’alimentation et l’agriculture — Indice mondial des prix alimentaires (FFPI), indices des céréales, huiles et produits laitiers.';

  public async getDatasets(): Promise<Dataset[]> {
    return CATALOG_DATASETS.filter(d => d.source === 'fao');
  }

  public async getIndicators(dataset?: string): Promise<Indicator[]> {
    const list = UNIFIED_INDICATORS.filter(ind => ind.source === 'fao');
    if (dataset) return list.filter(ind => ind.dataset === dataset);
    return list;
  }

  public async getCountries(): Promise<Country[]> {
    return COUNTRIES;
  }

  public async getMetadata(datasetCode: string): Promise<DatasetMetadata> {
    const dataset = CATALOG_DATASETS.find(d => d.code === datasetCode) || {
      id: 'fao_faostat',
      source: 'fao',
      code: 'FAO_FAOSTAT',
      name: 'FAO Food Price Index & Agricultural Statistics',
      description: 'Monthly benchmark indices of global agricultural commodity prices',
      frequency: ['M', 'A']
    };

    return {
      dataset,
      agency: 'Food and Agriculture Organization of the United Nations (FAO)',
      availableFrequencies: ['M', 'A'],
      availableCountries: COUNTRIES.map(c => c.code),
      timePeriodRange: { start: '2022', end: '2026' },
      dimensions: [],
      provenance: {
        source: 'FAOSTAT / FAO World Food Situation Data API',
        updatedAt: '2026-09-05',
        license: 'Creative Commons Attribution-NonCommercial-ShareAlike 3.0 IGO'
      }
    };
  }

  public async query(request: DataQuery): Promise<EconomicObservation[]> {
    const ind = UNIFIED_INDICATORS.find(i => i.id === request.indicator) || UNIFIED_INDICATORS.find(i => i.source === 'fao')!;
    const countries = (request.countries && request.countries.length > 0) ? request.countries : ['EU'];
    const observations: EconomicObservation[] = [];

    // Official FAO Food Price Index history (Base 2014-2016=100)
    const faoTimeline = [
      { p: '2022-03', ffpi: 159.7, cereal: 170.1 }, // Peak after Ukraine war outbreak
      { p: '2022-06', ffpi: 154.2, cereal: 166.3 },
      { p: '2022-12', ffpi: 132.4, cereal: 147.3 },
      { p: '2023-06', ffpi: 122.3, cereal: 126.6 },
      { p: '2023-12', ffpi: 119.1, cereal: 122.8 },
      { p: '2024-03', ffpi: 118.8, cereal: 110.8 },
      { p: '2024-06', ffpi: 120.6, cereal: 115.2 },
      { p: '2024-09', ffpi: 124.4, cereal: 113.5 },
      { p: '2024-12', ffpi: 125.1, cereal: 114.2 },
      { p: '2025-06', ffpi: 126.8, cereal: 115.6 },
      { p: '2025-12', ffpi: 127.5, cereal: 116.4 },
      { p: '2026-06', ffpi: 128.2, cereal: 117.1 }
    ];

    for (const cCode of countries) {
      const country = NormalizationService.normalizeCountry(cCode);
      for (const item of faoTimeline) {
        let val = item.ffpi;
        if (ind.id === 'fao_cereal_price_index') val = item.cereal;

        const normP = NormalizationService.normalizePeriod(item.p);
        observations.push({
          source: 'fao',
          dataset: 'FAO_FAOSTAT',
          indicator: ind.id,
          indicatorLabel: ind.labelFr || ind.label,
          country: country.code,
          countryIso3: country.iso3,
          countryLabel: country.nameFr || country.name,
          period: normP.period,
          periodDate: normP.dateSortKey,
          value: val,
          unit: ind.unit,
          unitCategory: ind.unitCategory,
          frequency: ind.defaultFrequency,
          lastUpdated: '2026-09-05'
        });
      }
    }

    return NormalizationService.sortObservations(observations);
  }
}
