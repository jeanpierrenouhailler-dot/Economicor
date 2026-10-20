import { EurostatProvider } from '../api/eurostat/EurostatProvider';
import { IMFProvider } from '../api/imf/IMFProvider';
import { WorldBankProvider } from '../api/worldbank/WorldBankProvider';
import { FREDProvider } from '../api/fred/FREDProvider';
import { INSEEProvider } from '../api/insee/INSEEProvider';
import { ECBProvider } from '../api/ecb/ECBProvider';
import { BLSProvider } from '../api/bls/BLSProvider';
import { OECDProvider } from '../api/oecd/OECDProvider';
import { UNDataProvider } from '../api/undata/UNDataProvider';
import { BISProvider } from '../api/bis/BISProvider';
import { EIAProvider } from '../api/eia/EIAProvider';
import { FAOProvider } from '../api/fao/FAOProvider';
import { Country, COUNTRIES } from '../models/Country';
import { Dataset, DatasetMetadata, CATALOG_DATASETS } from '../models/Dataset';
import { Indicator, UNIFIED_INDICATORS } from '../models/Indicator';
import { EconomicObservation } from '../models/Observation';
import { DataProvider } from '../models/Provider';
import { DataQuery, QueryResult } from '../models/Query';
import { CacheService } from './CacheService';
import { HistoryService } from './HistoryService';
import { NormalizationService } from './NormalizationService';
import { SourceRouter, SOURCE_METADATA } from './SourceRouter';

export class QueryService {
  private static instance: QueryService;
  private providers: Map<string, DataProvider> = new Map();

  private constructor() {
    // Register all 12 structural economic data providers
    this.registerProvider(new EurostatProvider());
    this.registerProvider(new IMFProvider());
    this.registerProvider(new WorldBankProvider());
    this.registerProvider(new FREDProvider());
    this.registerProvider(new INSEEProvider());
    this.registerProvider(new ECBProvider());
    this.registerProvider(new BLSProvider());
    this.registerProvider(new OECDProvider());
    this.registerProvider(new UNDataProvider());
    this.registerProvider(new BISProvider());
    this.registerProvider(new EIAProvider());
    this.registerProvider(new FAOProvider());
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
    if (source && source !== 'all' && source !== 'auto') {
      const p = this.getProvider(source);
      return p ? p.getDatasets() : [];
    }
    return CATALOG_DATASETS;
  }

  public async getIndicators(source?: string, dataset?: string): Promise<Indicator[]> {
    let list = UNIFIED_INDICATORS;
    if (source && source !== 'all' && source !== 'auto') {
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
   * Features automatic source routing when source is 'auto' or omitted.
   */
  public async executeQuery(query: DataQuery, forceRefresh: boolean = false): Promise<QueryResult> {
    let sourceId = query.source;
    let routingReason: string | undefined = undefined;

    // Intelligent source resolution if 'auto' or unspecified
    if (!sourceId || sourceId === 'all' || sourceId === 'auto') {
      const primaryCountry = (query.countries && query.countries.length > 0) ? query.countries[0] : 'FR';
      
      // If indicator is mapped, check its default source
      const ind = UNIFIED_INDICATORS.find(i => i.id === query.indicator);
      if (ind) {
        sourceId = ind.source;
        const meta = SOURCE_METADATA[sourceId];
        routingReason = `Source officielle sélectionnée : ${meta?.name || sourceId.toUpperCase()} (${meta?.specialty || ''})`;
      } else {
        sourceId = 'eurostat';
      }
    }

    const provider = this.getProvider(sourceId);
    if (!provider) {
      throw new Error(`Data provider '${sourceId}' is not registered`);
    }

    const meta = SOURCE_METADATA[sourceId];

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
            sourceBadge: meta?.badge || provider.name,
            routingReason,
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
      const indLabel = indicatorObj?.labelFr || indicatorObj?.label || query.indicator || 'Données Économiques';
      const cLabels = (query.countries && query.countries.length > 0)
        ? query.countries.map(c => NormalizationService.normalizeCountry(c).nameFr || NormalizationService.normalizeCountry(c).name).join(', ')
        : 'Toutes régions';

      HistoryService.addEntry(
        query,
        `${indLabel} (${cLabels})`,
        `${meta?.badge || provider.name} · ${observations.length} observations`,
        observations.length
      );

      return {
        query,
        observations,
        provenance: {
          source: provider.name,
          sourceBadge: meta?.badge || provider.name,
          routingReason,
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
            sourceBadge: meta?.badge || provider.name,
            routingReason,
            dataset: query.dataset || 'cached',
            indicator: query.indicator || '',
            retrievedAt: new Date(expiredCached.timestamp).toISOString(),
            lastUpdated: new Date(expiredCached.timestamp).toLocaleDateString(),
            cached: true
          },
          fromCache: true,
          cachedAt: new Date(expiredCached.timestamp).toISOString(),
          error: `Live fetch failed (${err instanceof Error ? err.message : String(err)}). Affichage des données en cache local.`
        };
      }

      throw err;
    }
  }
}

export const queryService = QueryService.getInstance();
