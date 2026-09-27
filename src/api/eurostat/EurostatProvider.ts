import { Country, COUNTRIES } from '../../models/Country';
import { Dataset, DatasetMetadata, CATALOG_DATASETS } from '../../models/Dataset';
import { Indicator, UNIFIED_INDICATORS } from '../../models/Indicator';
import { EconomicObservation } from '../../models/Observation';
import { DataProvider } from '../../models/Provider';
import { DataQuery } from '../../models/Query';
import { EurostatClient } from './EurostatClient';
import { EurostatMapper } from './EurostatMapper';

export class EurostatProvider implements DataProvider {
  public readonly id = 'eurostat';
  public readonly name = 'Eurostat';
  public readonly description = 'Statistical Office of the European Union — Official European economic and social statistics.';

  private client: EurostatClient;

  constructor(client: EurostatClient = new EurostatClient()) {
    this.client = client;
  }

  public async getDatasets(): Promise<Dataset[]> {
    return CATALOG_DATASETS.filter(d => d.source === 'eurostat');
  }

  public async getIndicators(dataset?: string): Promise<Indicator[]> {
    const list = UNIFIED_INDICATORS.filter(ind => ind.source === 'eurostat');
    if (dataset) {
      return list.filter(ind => ind.dataset === dataset);
    }
    return list;
  }

  public async getCountries(): Promise<Country[]> {
    // Eurostat primarily covers EU member states plus candidate/EFTA countries
    return COUNTRIES.filter(c => c.isEU || c.region === 'Europe');
  }

  public async getMetadata(datasetCode: string): Promise<DatasetMetadata> {
    const dataset = CATALOG_DATASETS.find(d => d.code === datasetCode || d.id === datasetCode) || {
      id: `eurostat_${datasetCode}`,
      source: 'eurostat',
      code: datasetCode,
      name: `Eurostat Dataset (${datasetCode})`,
      description: 'Eurostat statistical dataset',
      frequency: ['Q', 'M', 'A']
    };

    return {
      dataset,
      agency: 'ESTAT (Eurostat)',
      availableFrequencies: dataset.frequency,
      availableCountries: COUNTRIES.filter(c => c.isEU).map(c => c.code),
      timePeriodRange: {
        start: '2010',
        end: '2026'
      },
      dimensions: dataset.dimensions || [],
      provenance: {
        source: 'Eurostat Dissemination Statistics API / SDMX 3.0',
        updatedAt: dataset.lastUpdated || new Date().toISOString(),
        license: 'Eurostat Open Data Policy (free reuse with citation)'
      }
    };
  }

  public async query(request: DataQuery): Promise<EconomicObservation[]> {
    const datasetCode = request.dataset || 'prc_hpi_q';
    const indicatorId = request.indicator || 'house_price_index';

    // Map requested country codes to Eurostat geo codes
    const geoCodes = (request.countries && request.countries.length > 0)
      ? request.countries.map(c => {
          if (c === 'EU') return 'EU27_2020';
          return c;
        })
      : ['FR', 'DE', 'IT', 'ES', 'NL', 'EU27_2020'];

    // Determine unit and parameters
    const unit = request.dimensions?.unit || (datasetCode.includes('hicp') ? 'I15' : 'I15_Q');

    const jsonStat = await this.client.getJsonStatData(datasetCode, {
      geo: geoCodes,
      unit,
      lastTimePeriod: 32,
      dimensions: request.dimensions
    });

    return EurostatMapper.mapJsonStat(jsonStat, request, indicatorId);
  }
}
