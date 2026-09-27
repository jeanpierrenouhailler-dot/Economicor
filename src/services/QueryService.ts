import { EurostatProvider } from '../api/eurostat/EurostatProvider';
import { IMFProvider } from '../api/imf/IMFProvider';
import { Country, COUNTRIES } from '../models/Country';
import { Dataset, DatasetMetadata, CATALOG_DATASETS } from '../models/Dataset';
import { Indicator, UNIFIED_INDICATORS } from '../models/Indicator';
import { EconomicObservation } from '../models/Observation';
import { DataProvider } from '../models/Provider';
import { DataQuery, QueryResult } from '../models/Query';
import { CacheService } from './CacheService';
import { HistoryService } from './HistoryService';
import { NormalizationService } from './NormalizationService';

export class QueryService {
  private static instance: QueryService;
  private providers: Map<string, DataProvider> = new Map();

  private constructor() {
    this.registerProvider(new EurostatProvider());
    this.registerProvider(new IMFProvider());
  }

  public static getInstance(): QueryService {
    if (!QueryService.instance) {
      QueryService.instance = new QueryService();
    }
    return QueryService.instance;
  }

  public registerProvider(provider: DataProvider): void {
    this.providers.set(provider.id.toLowerCase(), provider);
  }

  public getProvider(sourceId: string): DataProvider | undefined {
    return this.providers.get(sourceId.toLowerCase());
  }

  public getAllProviders(): DataProvider[] {
    return Array.from(this.providers.values());
  }

  public async getDatasets(source?: string): Promise<Dataset[]> {
    if (source && source !== 'all') {
      const p = this.getProvider(source);
      return p ? p.getDatasets() : [];
    }
    return CATALOG_DATASETS;
  }

  public async getIndicators(source?: string, dataset?: string): Promise<Indicator[]> {
    let list = UNIFIED_INDICATORS;
    if (source && source !== 'all') {
      list = list.filter(i => i.source === source);
    }
    if (dataset) {
      list = list.filter(i => i.dataset === dataset);
    }
    return list;
  }

  public async getCountries(): Promise<Country[]> {
    return COUNTRIES;
  }

  public async getDatasetMetadata(source: string, datasetCode: string): Promise<DatasetMetadata | null> {
    const p = this.getProvider(source);
    if (!p) return null;
    return p.getMetadata(datasetCode);
  }

  /**
   * Main query execution method with caching, provenance, and history logging.
   */
  public async executeQuery(query: DataQuery, forceRefresh: boolean = false): Promise<QueryResult> {
    // Determine provider
    let sourceId = query.source;
    if (!sourceId || sourceId === 'all') {
      // Find indicator source
      const ind = UNIFIED_INDICATORS.find(i => i.id === query.indicator);
      sourceId = ind ? ind.source : 'eurostat';
    }

    const provider = this.getProvider(sourceId);
    if (!provider) {
      throw new Error(`Data provider '${sourceId}' is not registered`);
    }

    // Generate unique deterministic cache key
    const sortedCountries = (query.countries || []).slice().sort().join(',');
    const cacheKey = `query_${sourceId}_${query.indicator || 'def'}_${sortedCountries}_${query.startPeriod || 'all'}_${query.endPeriod || 'all'}_${query.frequency || 'def'}`;

    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

    // Check IndexedDB cache if not forcing refresh
    if (!forceRefresh) {
      const cached = await CacheService.get<EconomicObservation[]>(cacheKey, !isOnline);
      if (cached && cached.data && cached.data.length > 0) {
        return {
          query,
          observations: cached.data,
          provenance: {
            source: provider.name,
            dataset: query.dataset || 'standard',
            indicator: query.indicator || '',
            retrievedAt: new Date(cached.timestamp).toISOString(),
            lastUpdated: new Date(cached.timestamp).toLocaleDateString(),
            cached: true
          },
          fromCache: true,
          cachedAt: new Date(cached.timestamp).toISOString()
        };
      }
    }

    // Execute provider query
    try {
      const observations = await provider.query(query);

      // Save to IndexedDB cache
      await CacheService.set(
        cacheKey,
        observations,
        'observations',
        undefined,
        { query, source: sourceId }
      );

      // Format query title for history
      const indicatorObj = UNIFIED_INDICATORS.find(i => i.id === query.indicator);
      const indLabel = indicatorObj ? indicatorObj.label : query.indicator || 'Economic Data';
      const cLabels = (query.countries && query.countries.length > 0)
        ? query.countries.map(c => NormalizationService.normalizeCountry(c).name).join(', ')
        : 'All regions';

      HistoryService.addEntry(
        query,
        `${indLabel} (${cLabels})`,
        `${provider.name} · ${observations.length} observations`,
        observations.length
      );

      return {
        query,
        observations,
        provenance: {
          source: provider.name,
          dataset: query.dataset || indicatorObj?.dataset || 'default',
          indicator: query.indicator || '',
          retrievedAt: new Date().toISOString(),
          lastUpdated: observations[0]?.lastUpdated || new Date().toISOString().split('T')[0],
          cached: false
        },
        fromCache: false
      };
    } catch (err: unknown) {
      // If error occurs and we have any expired cached result, fallback to it
      const expiredCached = await CacheService.get<EconomicObservation[]>(cacheKey, true);
      if (expiredCached && expiredCached.data && expiredCached.data.length > 0) {
        return {
          query,
          observations: expiredCached.data,
          provenance: {
            source: provider.name,
            dataset: query.dataset || 'cached',
            indicator: query.indicator || '',
            retrievedAt: new Date(expiredCached.timestamp).toISOString(),
            lastUpdated: new Date(expiredCached.timestamp).toLocaleDateString(),
            cached: true
          },
          fromCache: true,
          cachedAt: new Date(expiredCached.timestamp).toISOString(),
          error: `Live fetch failed (${err instanceof Error ? err.message : String(err)}). Displaying cached offline observations.`
        };
      }

      throw err;
    }
  }
}

export const queryService = QueryService.getInstance();
