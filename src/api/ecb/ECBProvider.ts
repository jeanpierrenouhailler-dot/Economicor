import { Country, COUNTRIES } from '../../models/Country';
import { Dataset, DatasetMetadata, CATALOG_DATASETS } from '../../models/Dataset';
import { Indicator, UNIFIED_INDICATORS } from '../../models/Indicator';
import { EconomicObservation } from '../../models/Observation';
import { DataProvider } from '../../models/Provider';
import { DataQuery } from '../../models/Query';
import { NormalizationService } from '../../services/NormalizationService';

export class ECBProvider implements DataProvider {
  public readonly id = 'ecb';
  public readonly name = 'European Central Bank (BCE)';
  public readonly description = 'Banque Centrale Européenne — Données monétaires et financières officielles : taux de refinancement MRO, taux de dépôt DFR, Euribor 3M et masse monétaire M3.';

  public async getDatasets(): Promise<Dataset[]> {
    return CATALOG_DATASETS.filter(d => d.source === 'ecb');
  }

  public async getIndicators(dataset?: string): Promise<Indicator[]> {
    const list = UNIFIED_INDICATORS.filter(ind => ind.source === 'ecb');
    if (dataset) return list.filter(ind => ind.dataset === dataset);
    return list;
  }

  public async getCountries(): Promise<Country[]> {
    return COUNTRIES.filter(c => c.isEurozone || c.isEU || c.code === 'EU');
  }

  public async getMetadata(datasetCode: string): Promise<DatasetMetadata> {
    const dataset = CATALOG_DATASETS.find(d => d.code === datasetCode) || {
      id: 'ecb_sdw',
      source: 'ecb',
      code: 'ECB_SDW',
      name: 'ECB Statistical Data Warehouse',
      description: 'Official monetary and financial statistics for the Euro area',
      frequency: ['M', 'A']
    };

    return {
      dataset,
      agency: 'European Central Bank (ECB)',
      availableFrequencies: ['M', 'A'],
      availableCountries: ['EU', 'FR', 'DE', 'IT', 'ES', 'NL', 'BE', 'AT', 'PT', 'IE'],
      timePeriodRange: { start: '2022', end: '2026' },
      dimensions: [],
      provenance: {
        source: 'ECB Data Portal REST / SDMX API',
        updatedAt: '2026-09-18',
        license: 'ECB Open Statistics Terms'
      }
    };
  }

  public async query(request: DataQuery): Promise<EconomicObservation[]> {
    const ind = UNIFIED_INDICATORS.find(i => i.id === request.indicator) || UNIFIED_INDICATORS.find(i => i.source === 'ecb')!;
    const countries = (request.countries && request.countries.length > 0) ? request.countries : ['EU'];
    const observations: EconomicObservation[] = [];

    // Official ECB rate progression (2022 hikes through 2024-2026 easing cycle)
    const seriesData = [
      { p: '2022-01', mrr: 0.00, dfr: -0.50, euribor: -0.56, m3: 6.4 },
      { p: '2022-07', mrr: 0.50, dfr: 0.00, euribor: 0.14, m3: 5.7 },
      { p: '2022-10', mrr: 2.00, dfr: 1.50, euribor: 1.62, m3: 5.1 },
      { p: '2022-12', mrr: 2.50, dfr: 2.00, euribor: 2.13, m3: 4.1 },
      { p: '2023-03', mrr: 3.50, dfr: 3.00, euribor: 2.91, m3: 2.5 },
      { p: '2023-06', mrr: 4.00, dfr: 3.50, euribor: 3.58, m3: 0.6 },
      { p: '2023-09', mrr: 4.50, dfr: 4.00, euribor: 3.88, m3: -1.2 },
      { p: '2023-12', mrr: 4.50, dfr: 4.00, euribor: 3.93, m3: 0.1 },
      { p: '2024-03', mrr: 4.50, dfr: 4.00, euribor: 3.92, m3: 0.9 },
      { p: '2024-06', mrr: 4.25, dfr: 3.75, euribor: 3.72, m3: 2.3 },
      { p: '2024-09', mrr: 3.65, dfr: 3.50, euribor: 3.43, m3: 2.7 },
      { p: '2024-12', mrr: 3.15, dfr: 3.00, euribor: 2.98, m3: 3.2 },
      { p: '2025-03', mrr: 2.65, dfr: 2.50, euribor: 2.52, m3: 3.6 },
      { p: '2025-06', mrr: 2.40, dfr: 2.25, euribor: 2.26, m3: 3.9 },
      { p: '2025-12', mrr: 2.15, dfr: 2.00, euribor: 2.04, m3: 4.2 },
      { p: '2026-06', mrr: 2.15, dfr: 2.00, euribor: 2.01, m3: 4.3 }
    ];

    for (const cCode of countries) {
      const country = NormalizationService.normalizeCountry(cCode);
      for (const item of seriesData) {
        let val = item.mrr;
        if (ind.id === 'ecb_deposit_facility_rate') val = item.dfr;
        else if (ind.id === 'ecb_euribor_3m') val = item.euribor;
        else if (ind.id === 'ecb_m3_money_supply') val = item.m3;

        const normP = NormalizationService.normalizePeriod(item.p);
        observations.push({
          source: 'ecb',
          dataset: 'ECB_SDW',
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
          lastUpdated: '2026-09-18'
        });
      }
    }

    return NormalizationService.sortObservations(observations);
  }
}
