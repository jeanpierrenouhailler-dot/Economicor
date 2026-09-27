import React, { useState, useEffect } from 'react';
import {
  GitCompare,
  AlertCircle,
  TrendingUp,
  Activity,
  Layers,
  Check,
  RefreshCw,
  Table as TableIcon
} from 'lucide-react';
import { queryService } from '../../services/QueryService';
import { UNIFIED_INDICATORS, Indicator } from '../../models/Indicator';
import { COUNTRIES, Country } from '../../models/Country';
import { EconomicObservation } from '../../models/Observation';
import { NormalizationService } from '../../services/NormalizationService';
import { LineChart } from '../../components/charts/LineChart';
import { ObservationTable } from '../../components/tables/ObservationTable';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { ErrorAlert } from '../../components/common/ErrorAlert';

export const ComparePage: React.FC = () => {
  // Selected multi-countries
  const [selectedCountries, setSelectedCountries] = useState<string[]>(['FR', 'DE', 'IT', 'ES']);
  // Selected primary indicator
  const [primaryIndicatorId, setPrimaryIndicatorId] = useState<string>('real_gdp_growth');
  // Secondary indicator for correlation/comparison
  const [secondaryIndicatorId, setSecondaryIndicatorId] = useState<string>('imf_inflation_rate');

  const [observationsA, setObservationsA] = useState<EconomicObservation[]>([]);
  const [observationsB, setObservationsB] = useState<EconomicObservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [compareMode, setCompareMode] = useState<'countries' | 'indicators'>('countries');

  const indicatorA = UNIFIED_INDICATORS.find(i => i.id === primaryIndicatorId) || UNIFIED_INDICATORS[0];
  const indicatorB = UNIFIED_INDICATORS.find(i => i.id === secondaryIndicatorId) || UNIFIED_INDICATORS[1];

  const unitsCompatible = NormalizationService.areUnitsCompatible(indicatorA.unit, indicatorB.unit);

  const loadData = async (force: boolean = false) => {
    setLoading(true);
    setError(null);

    try {
      // 1. Fetch Primary Indicator
      const resA = await queryService.executeQuery({
        source: indicatorA.source,
        dataset: indicatorA.dataset,
        indicator: indicatorA.id,
        countries: selectedCountries,
        startPeriod: '2018',
        endPeriod: '2026',
        frequency: indicatorA.defaultFrequency
      }, force);
      setObservationsA(resA.observations);

      // 2. Fetch Secondary Indicator
      if (compareMode === 'indicators') {
        const resB = await queryService.executeQuery({
          source: indicatorB.source,
          dataset: indicatorB.dataset,
          indicator: indicatorB.id,
          countries: selectedCountries,
          startPeriod: '2018',
          endPeriod: '2026',
          frequency: indicatorB.defaultFrequency
        }, force);
        setObservationsB(resB.observations);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCountries, primaryIndicatorId, secondaryIndicatorId, compareMode]);

  const toggleCountry = (code: string) => {
    if (selectedCountries.includes(code)) {
      if (selectedCountries.length > 1) {
        setSelectedCountries(selectedCountries.filter(c => c !== code));
      }
    } else {
      setSelectedCountries([...selectedCountries, code]);
    }
  };

  const majorCountries = COUNTRIES.filter(c => ['FR', 'DE', 'IT', 'ES', 'NL', 'BE', 'EU', 'US', 'GB'].includes(c.code));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Multi-Dimensional Analysis</span>
            <span aria-hidden="true">·</span>
            <span>Unit compatibility validation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Macroeconomic Comparison
          </h1>
        </div>

        {/* Mode selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setCompareMode('countries')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                compareMode === 'countries'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Compare Countries
            </button>
            <button
              onClick={() => setCompareMode('indicators')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                compareMode === 'indicators'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Compare Two Indicators
            </button>
          </div>

          <button
            onClick={() => loadData(true)}
            className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Refresh comparison"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Selectors card */}
      <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        {/* Country Multi-Select Chips */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Selected Benchmark Economies ({selectedCountries.length})
          </label>
          <div className="flex flex-wrap gap-1.5">
            {majorCountries.map(c => {
              const isSelected = selectedCountries.includes(c.code);
              return (
                <button
                  key={c.code}
                  onClick={() => toggleCountry(c.code)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{c.flag}</span>
                  <span>{c.name}</span>
                  {isSelected && <Check className="w-3 h-3 ml-0.5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Indicators Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Primary Indicator (Metric A)</span>
              <span className="font-mono text-blue-600 dark:text-blue-400">Unit: {indicatorA.unit}</span>
            </label>
            <select
              value={primaryIndicatorId}
              onChange={e => setPrimaryIndicatorId(e.target.value)}
              className="w-full text-xs py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:ring-1 focus:ring-blue-500"
            >
              {UNIFIED_INDICATORS.map(ind => (
                <option key={ind.id} value={ind.id}>
                  {ind.label} ({ind.source.toUpperCase()}) — [{ind.unit}]
                </option>
              ))}
            </select>
          </div>

          {compareMode === 'indicators' && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Secondary Indicator (Metric B)</span>
                <span className="font-mono text-amber-600 dark:text-amber-400">Unit: {indicatorB.unit}</span>
              </label>
              <select
                value={secondaryIndicatorId}
                onChange={e => setSecondaryIndicatorId(e.target.value)}
                className="w-full text-xs py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:ring-1 focus:ring-blue-500"
              >
                {UNIFIED_INDICATORS.map(ind => (
                  <option key={ind.id} value={ind.id}>
                    {ind.label} ({ind.source.toUpperCase()}) — [{ind.unit}]
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Unit Incompatibility Warning */}
        {compareMode === 'indicators' && !unitsCompatible && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              <strong>Unit Incompatibility Safeguard:</strong> Metric A ({indicatorA.unit}) and Metric B ({indicatorB.unit}) operate on different dimensional units. They are rendered on distinct sub-panels to prevent misleading vertical scales.
            </span>
          </div>
        )}
      </div>

      {error != null && <ErrorAlert error={error} onRetry={() => loadData(true)} />}

      {/* Primary Comparison Chart */}
      {loading ? (
        <SkeletonLoader rows={6} />
      ) : (
        <div className="space-y-6">
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {indicatorA.label}
                </h3>
                <p className="text-xs text-slate-500">
                  {indicatorA.source.toUpperCase()} · Unit: {indicatorA.unit}
                </p>
              </div>
            </div>
            <LineChart observations={observationsA} unit={indicatorA.unit} height={360} />
          </div>

          {/* Secondary Indicator Chart if in two-indicator mode */}
          {compareMode === 'indicators' && (
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {indicatorB.label}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {indicatorB.source.toUpperCase()} · Unit: {indicatorB.unit}
                  </p>
                </div>
              </div>
              <LineChart observations={observationsB} unit={indicatorB.unit} height={360} />
            </div>
          )}

          {/* High-density comparative raw data grid */}
          <ObservationTable
            observations={observationsA}
            unit={indicatorA.unit}
            sourceName={`${indicatorA.label} (${indicatorA.source.toUpperCase()})`}
          />
        </div>
      )}
    </div>
  );
};
