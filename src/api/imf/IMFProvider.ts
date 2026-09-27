import { Country, COUNTRIES } from '../../models/Country';
import { Dataset, DatasetMetadata, CATALOG_DATASETS } from '../../models/Dataset';
import { Indicator, UNIFIED_INDICATORS } from '../../models/Indicator';
import { EconomicObservation } from '../../models/Observation';
import { DataProvider } from '../../models/Provider';
import { DataQuery } from '../../models/Query';
import { NormalizationService } from '../../services/NormalizationService';
import { IMFClient } from './IMFClient';
import { IMFMapper } from './IMFMapper';

export class IMFProvider implements DataProvider {
  public readonly id = 'imf';
  public readonly name = 'International Monetary Fund (IMF)';
  public readonly description = 'International Monetary Fund — Global macroeconomic indicators, projections, and World Economic Outlook (WEO).';

  private client: IMFClient;

  constructor(client: IMFClient = new IMFClient()) {
    this.client = client;
  }

  public async getDatasets(): Promise<Dataset[]> {
    return CATALOG_DATASETS.filter(d => d.source === 'imf');
  }

  public async getIndicators(dataset?: string): Promise<Indicator[]> {
    const list = UNIFIED_INDICATORS.filter(ind => ind.source === 'imf');
    if (dataset) {
      return list.filter(ind => ind.dataset === dataset);
    }
    return list;
  }

  public async getCountries(): Promise<Country[]> {
    return COUNTRIES;
  }

  public async getMetadata(datasetCode: string): Promise<DatasetMetadata> {
    const dataset = CATALOG_DATASETS.find(d => d.code === datasetCode || d.id === datasetCode) || {
      id: 'imf_weo',
      source: 'imf',
      code: 'WEO',
      name: 'IMF World Economic Outlook (WEO)',
      description: 'IMF global macroeconomic projections and historical series',
      frequency: ['A']
    };

    return {
      dataset,
      agency: 'IMF (International Monetary Fund)',
      availableFrequencies: ['A'],
      availableCountries: COUNTRIES.map(c => c.code),
      timePeriodRange: {
        start: '2010',
        end: '2026'
      },
      dimensions: dataset.dimensions || [],
      provenance: {
        source: 'IMF DataMapper API v2 / SDMX',
        updatedAt: dataset.lastUpdated || new Date().toISOString(),
        license: 'IMF Open Data Terms (free public use with citation)'
      }
    };
  }

  public async query(request: DataQuery): Promise<EconomicObservation[]> {
    // Map unified indicator id to IMF native code
    const unifiedInd = UNIFIED_INDICATORS.find(i => i.id === request.indicator);
    const nativeCode = unifiedInd?.nativeCode || request.indicator || 'NGDP_RPCH';

    // Map countries to ISO-3 codes for IMF
    const iso3Codes = request.countries && request.countries.length > 0
      ? request.countries.map(c => NormalizationService.normalizeCountry(c).iso3)
      : ['FRA', 'DEU', 'ITA', 'ESP', 'NLD', 'BEL', 'USA'];

    const data = await this.client.getDataMapperIndicator(nativeCode, iso3Codes);

    return IMFMapper.mapDataMapper(data, request, request.indicator || 'real_gdp_growth');
  }
}
