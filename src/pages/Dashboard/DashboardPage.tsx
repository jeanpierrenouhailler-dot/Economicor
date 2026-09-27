import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Activity,
  Building,
  DollarSign,
  Users,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { queryService } from '../../services/QueryService';
import { COUNTRIES, Country } from '../../models/Country';
import { EconomicObservation } from '../../models/Observation';
import { StatCardSkeleton } from '../../components/common/SkeletonLoader';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { Tooltip } from '../../components/common/Tooltip';

interface MetricCardData {
  id: string;
  title: string;
  source: string;
  value: number | null;
  unit: string;
  period: string;
  change?: number;
  indicatorId: string;
  dataset: string;
  icon: React.ElementType;
}

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('FR');
  const [metrics, setMetrics] = useState<MetricCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const currentCountry = COUNTRIES.find(c => c.code === selectedCountryCode) || COUNTRIES[0];

  const loadDashboardData = async (force: boolean = false) => {
    setLoading(true);
    setError(null);

    try {
      // 1. Fetch Real GDP Growth (IMF)
      const gdpResult = await queryService.executeQuery({
        source: 'imf',
        dataset: 'WEO',
        indicator: 'real_gdp_growth',
        countries: [selectedCountryCode],
        startPeriod: '2023',
        endPeriod: '2026',
        frequency: 'A'
      }, force);

      // 2. Fetch Inflation (IMF or Eurostat)
      const inflationResult = await queryService.executeQuery({
        source: 'imf',
        dataset: 'WEO',
        indicator: 'imf_inflation_rate',
        countries: [selectedCountryCode],
        startPeriod: '2023',
        endPeriod: '2026',
        frequency: 'A'
      }, force);

      // 3. Fetch Public Debt (IMF)
      const debtResult = await queryService.executeQuery({
        source: 'imf',
        dataset: 'WEO',
        indicator: 'general_govt_debt',
        countries: [selectedCountryCode],
        startPeriod: '2023',
        endPeriod: '2026',
        frequency: 'A'
      }, force);

      // 4. Fetch Unemployment (IMF)
      const unempResult = await queryService.executeQuery({
        source: 'imf',
        dataset: 'WEO',
        indicator: 'unemployment_rate',
        countries: [selectedCountryCode],
        startPeriod: '2023',
        endPeriod: '2026',
        frequency: 'A'
      }, force);

      // 5. Fetch House Price Index (Eurostat)
      let hpiResult = null;
      try {
        hpiResult = await queryService.executeQuery({
          source: 'eurostat',
          dataset: 'prc_hpi_q',
          indicator: 'house_price_index',
          countries: [selectedCountryCode],
          startPeriod: '2023-Q1',
          endPeriod: '2025-Q4',
          frequency: 'Q',
          dimensions: { unit: 'I15_Q', purchase: 'TOTAL' }
        }, force);
      } catch {
        // HPI might not be available for non-EU countries
      }

      // Helper to extract latest observation
      const getLatest = (obs: EconomicObservation[]) => {
        if (!obs || obs.length === 0) return null;
        const valid = obs.filter(o => o.value !== null);
        return valid.length > 0 ? valid[valid.length - 1] : null;
      };

      const latestGdp = getLatest(gdpResult.observations);
      const latestInflation = getLatest(inflationResult.observations);
      const latestDebt = getLatest(debtResult.observations);
      const latestUnemp = getLatest(unempResult.observations);
      const latestHpi = hpiResult ? getLatest(hpiResult.observations) : null;

      const loadedMetrics: MetricCardData[] = [
        {
          id: 'gdp',
          title: 'Real GDP Growth',
          source: 'IMF WEO',
          value: latestGdp ? latestGdp.value : null,
          unit: '%',
          period: latestGdp ? latestGdp.period : '2025',
          indicatorId: 'real_gdp_growth',
          dataset: 'WEO',
          icon: TrendingUp
        },
        {
          id: 'inflation',
          title: 'Consumer Price Inflation',
          source: 'IMF WEO',
          value: latestInflation ? latestInflation.value : null,
          unit: '%',
          period: latestInflation ? latestInflation.period : '2025',
          indicatorId: 'imf_inflation_rate',
          dataset: 'WEO',
          icon: Activity
        },
        {
          id: 'debt',
          title: 'Public Debt (% of GDP)',
          source: 'IMF WEO',
          value: latestDebt ? latestDebt.value : null,
          unit: '% of GDP',
          period: latestDebt ? latestDebt.period : '2025',
          indicatorId: 'general_govt_debt',
          dataset: 'WEO',
          icon: DollarSign
        },
        {
          id: 'unemployment',
          title: 'Unemployment Rate',
          source: 'IMF WEO',
          value: latestUnemp ? latestUnemp.value : null,
          unit: '%',
          period: latestUnemp ? latestUnemp.period : '2025',
          indicatorId: 'unemployment_rate',
          dataset: 'WEO',
          icon: Users
        },
        {
          id: 'housing',
          title: 'House Price Index (HPI)',
          source: 'Eurostat',
          value: latestHpi ? latestHpi.value : null,
          unit: 'Index 2015=100',
          period: latestHpi ? latestHpi.period : '2024-Q4',
          indicatorId: 'house_price_index',
          dataset: 'prc_hpi_q',
          icon: Building
        }
      ];

      setMetrics(loadedMetrics);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [selectedCountryCode]);

  const handleInspect = (m: MetricCardData) => {
    navigate(`/explorer?source=${m.source.toLowerCase().includes('eurostat') ? 'eurostat' : 'imf'}&indicator=${m.indicatorId}&countries=${selectedCountryCode}`);
  };

  const majorCountries = COUNTRIES.filter(c => ['FR', 'DE', 'IT', 'ES', 'NL', 'BE', 'EU', 'US', 'GB'].includes(c.code));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Top Welcome & Country Quick Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Executive Macro Intelligence</span>
            <span aria-hidden="true">·</span>
            <span>Real-time official stats</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified APIs
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Global Economic Monitor
          </h1>
        </div>

        {/* Country Quick Tabs */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-x-auto max-w-full">
            {majorCountries.map(c => (
              <Tooltip key={c.code} content={`Afficher les indicateurs : ${c.name} (${c.region})`} position="bottom">
                <button
                  onClick={() => setSelectedCountryCode(c.code)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                    selectedCountryCode === c.code
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>{c.flag}</span>
                  <span>{c.code}</span>
                </button>
              </Tooltip>
            ))}
          </div>

          <Tooltip content="Rafraîchir les données officielles en direct" position="bottom">
            <button
              onClick={() => loadDashboardData(true)}
              className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Rafraîchir les chiffres"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Country Hero Header Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-300 text-xs font-medium">
              <span className="text-xl">{currentCountry.flag}</span>
              <span>{currentCountry.region}</span>
              <span>·</span>
              <span>{currentCountry.isEU ? 'European Union Member' : 'Global Economy'}</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight mt-1">
              {currentCountry.name}
            </h2>
            <p className="text-xs text-slate-300 max-w-xl mt-1 leading-relaxed">
              Consolidated macroeconomic indicator cards sourced directly from Eurostat Dissemination and the International Monetary Fund WEO series.
            </p>
          </div>

          <button
            onClick={() => navigate(`/explorer?source=all&countries=${selectedCountryCode}`)}
            className="self-start md:self-center flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md active:scale-95 transition whitespace-nowrap"
          >
            <span>Open in Explorer</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {error != null && <ErrorAlert error={error} onRetry={() => loadDashboardData(true)} />}

      {/* 5 Indicator Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <StatCardSkeleton key={i} />)
          : metrics.map(m => {
              const Icon = m.icon;
              const isPositive = m.value !== null && m.value > 0;
              const isNegative = m.value !== null && m.value < 0;

              return (
                <Tooltip
                  key={m.id}
                  content={`Cliquer pour analyser ${m.title} (${m.source}) dans l'Explorateur interactif`}
                  className="w-full"
                >
                  <div
                    onClick={() => handleInspect(m)}
                    className="group w-full p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-medium text-slate-400 dark:text-slate-500 text-[11px] uppercase tracking-wider">
                          {m.source}
                        </span>
                        <Icon className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                      </div>

                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-2 line-clamp-1">
                        {m.title}
                      </h4>

                      <div className="mt-3 flex items-baseline gap-1 font-mono tabular-nums">
                        <span className={`text-2xl font-extrabold tracking-tight ${
                          isNegative && m.id === 'gdp'
                            ? 'text-rose-600 dark:text-rose-400'
                            : isPositive && m.id === 'gdp'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-900 dark:text-white'
                        }`}>
                          {m.value !== null ? (m.value > 0 && m.unit === '%' ? `+${m.value}` : m.value) : '—'}
                        </span>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          {m.unit}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-mono">Period: {m.period}</span>
                      <span className="text-blue-600 dark:text-blue-400 font-medium group-hover:translate-x-0.5 transition-transform flex items-center">
                        Analyze →
                      </span>
                    </div>
                  </div>
                </Tooltip>
              );
            })}
      </div>

      {/* Quick Launchpad to Core Functions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div
          onClick={() => navigate('/explorer')}
          className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-600 transition cursor-pointer"
        >
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>Interactive Explorer</span>
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5">
            Query Multi-Source Datasets
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Customize indicators, filter country matrices, select time sliders, and view cross-cutting charts.
          </p>
        </div>

        <div
          onClick={() => navigate('/compare')}
          className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-600 transition cursor-pointer"
        >
          <div className="flex items-center gap-2 text-amber-500 text-xs font-semibold">
            <Activity className="w-4 h-4" />
            <span>Comparative Matrix</span>
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5">
            Multi-Country Benchmarks
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Compare France, Germany, Italy, Spain and others side-by-side with unit compatibility protection.
          </p>
        </div>

        <div
          onClick={() => navigate('/datasets')}
          className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-600 transition cursor-pointer"
        >
          <div className="flex items-center gap-2 text-emerald-500 text-xs font-semibold">
            <Building className="w-4 h-4" />
            <span>Catalog & Metadata</span>
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5">
            SDMX 3.0 & Codelists
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Inspect raw dimensions, code lists, data structure definitions, and official release notes.
          </p>
        </div>
      </div>
    </div>
  );
};
