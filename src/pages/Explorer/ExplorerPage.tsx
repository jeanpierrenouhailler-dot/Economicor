import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Bookmark,
  BookmarkCheck,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { queryService } from '../../services/QueryService';
import { UNIFIED_INDICATORS, Indicator } from '../../models/Indicator';
import { CATALOG_DATASETS, Dataset } from '../../models/Dataset';
import { COUNTRIES } from '../../models/Country';
import { EconomicObservation, DataProvenance } from '../../models/Observation';
import { ChartContainer } from '../../components/charts/ChartContainer';
import { CountrySelector } from '../../components/filters/CountrySelector';
import { PeriodRangeSlider } from '../../components/filters/PeriodRangeSlider';
import { IndicatorSelector } from '../../components/filters/IndicatorSelector';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { FavoritesService } from '../../services/FavoritesService';
import { OfflineBanner } from '../../components/layout/OfflineIndicator';
import { Tooltip } from '../../components/common/Tooltip';

export const ExplorerPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Query state initialized from URL search params or defaults
  const [source, setSource] = useState<string>(() => searchParams.get('source') || 'all');
  const [dataset, setDataset] = useState<string>(() => searchParams.get('dataset') || 'prc_hpi_q');
  const [indicator, setIndicator] = useState<string>(() => searchParams.get('indicator') || 'house_price_index');
  const [countries, setCountries] = useState<string[]>(() => {
    const fromParam = searchParams.get('countries');
    if (fromParam) return fromParam.split(',').filter(Boolean);
    return ['FR', 'DE', 'IT'];
  });
  const [startYear, setStartYear] = useState<number>(() => {
    const fromParam = searchParams.get('from');
    return fromParam ? parseInt(fromParam, 10) : 2018;
  });
  const [endYear, setEndYear] = useState<number>(() => {
    const toParam = searchParams.get('to');
    return toParam ? parseInt(toParam, 10) : 2026;
  });

  // UI state
  const [observations, setObservations] = useState<EconomicObservation[]>([]);
  const [provenance, setProvenance] = useState<DataProvenance | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<unknown>(null);
  const [cachedAt, setCachedAt] = useState<string | undefined>(undefined);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState<boolean>(false);

  // Sync state to URL search params
  const syncToUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (source !== 'all') params.set('source', source);
    params.set('dataset', dataset);
    params.set('indicator', indicator);
    if (countries.length > 0) params.set('countries', countries.join(','));
    params.set('from', String(startYear));
    params.set('to', String(endYear));
    setSearchParams(params, { replace: true });
  }, [source, dataset, indicator, countries, startYear, endYear, setSearchParams]);

  // Execute query via Query Engine
  const executeQuery = async (force: boolean = false) => {
    setLoading(true);
    setError(null);
    syncToUrl();

    try {
      const activeIndicator = UNIFIED_INDICATORS.find(i => i.id === indicator);
      const isQuarterly = activeIndicator?.defaultFrequency === 'Q';

      const res = await queryService.executeQuery({
        source,
        dataset,
        indicator,
        countries,
        startPeriod: isQuarterly ? `${startYear}-Q1` : `${startYear}`,
        endPeriod: isQuarterly ? `${endYear}-Q4` : `${endYear}`,
        frequency: activeIndicator?.defaultFrequency || 'A'
      }, force);

      setObservations(res.observations);
      setProvenance(res.provenance);
      setCachedAt(res.cachedAt);
      setIsFavorite(FavoritesService.isFavorite(indicator, countries));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeQuery();
  }, []);

  const handleToggleFavorite = () => {
    const indObj = UNIFIED_INDICATORS.find(i => i.id === indicator);
    const countryLabels = countries.map(c => COUNTRIES.find(x => x.code === c)?.name || c).join(', ');
    const title = `${countryLabels} — ${indObj?.label || indicator}`;

    if (isFavorite) {
      // Find and remove
      const favs = FavoritesService.getFavorites();
      const existing = favs.find(f => f.indicatorId === indicator && (f.query.countries || []).join(',') === countries.join(','));
      if (existing) {
        FavoritesService.removeFavorite(existing.id);
        setIsFavorite(false);
      }
    } else {
      FavoritesService.addFavorite({
        title,
        subtitle: `${indObj?.source.toUpperCase()} · ${indObj?.dataset}`,
        query: {
          source,
          dataset,
          indicator,
          countries,
          startPeriod: String(startYear),
          endPeriod: String(endYear)
        },
        source,
        indicatorId: indicator,
        tags: [indObj?.category || 'Economic']
      });
      setIsFavorite(true);
    }
  };

  const activeInd = UNIFIED_INDICATORS.find(i => i.id === indicator);
  const activeDs = CATALOG_DATASETS.find(d => d.code === dataset);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <OfflineBanner cachedAt={cachedAt} />

      {/* Header & Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Query Engine</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-slate-400">REST & SDMX 3.0</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Data Explorer
          </h1>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2.5">
          <Tooltip content={isFavorite ? 'Retirer cette analyse des favoris' : 'Enregistrer cette requête dans vos favoris hors ligne'} position="bottom">
            <button
              onClick={handleToggleFavorite}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                isFavorite
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {isFavorite ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
              <span>{isFavorite ? 'Saved to Favorites' : 'Add to Favorites'}</span>
            </button>
          </Tooltip>

          <Tooltip content="Réexécuter la requête auprès des serveurs Eurostat et FMI" position="bottom">
            <button
              onClick={() => executeQuery(true)}
              disabled={loading}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition disabled:opacity-50 shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh Query</span>
            </button>
          </Tooltip>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="md:hidden flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {mobileFiltersOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Parameters Filter Card */}
      <div className={`p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5 ${
        mobileFiltersOpen ? 'block' : 'hidden md:block'
      }`}>
        {/* Source / Dataset / Indicator Selectors */}
        <IndicatorSelector
          selectedSource={source}
          selectedDataset={dataset}
          selectedIndicator={indicator}
          onSourceChange={setSource}
          onDatasetChange={setDataset}
          onIndicatorChange={setIndicator}
        />

        {/* Countries Selector */}
        <CountrySelector
          selectedCountries={countries}
          onChange={setCountries}
        />

        {/* Period Range Slider */}
        <PeriodRangeSlider
          startYear={startYear}
          endYear={endYear}
          minYear={2010}
          maxYear={2026}
          onChange={(start, end) => {
            setStartYear(start);
            setEndYear(end);
          }}
        />

        {/* Analyze CTA */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={() => executeQuery(false)}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-lg shadow-md transition disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>ANALYZE DATA</span>
          </button>
        </div>
      </div>

      {/* Error state */}
      {error != null && (
        <ErrorAlert
          error={error}
          onRetry={() => executeQuery(true)}
          lastCachedDate={cachedAt}
          onUseCache={() => executeQuery(false)}
        />
      )}

      {/* Data Visualization Output Container */}
      {loading ? (
        <SkeletonLoader rows={6} />
      ) : provenance ? (
        <ChartContainer
          observations={observations}
          provenance={provenance}
          unit={activeInd?.unit}
          frequency={activeInd?.defaultFrequency}
          indicatorTitle={activeInd?.label || indicator}
          indicatorSubtitle={`${provenance.source} · Dataset: ${activeDs?.name || dataset}`}
          onSelectCountry={(c) => {
            if (!countries.includes(c)) {
              setCountries([...countries, c]);
            }
          }}
        />
      ) : null}
    </div>
  );
};
