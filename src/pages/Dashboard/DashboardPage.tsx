import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Activity,
  Users,
  Landmark,
  Percent,
  Building2,
  Flame,
  Wheat,
  CircleDollarSign,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Layers,
  ChevronRight,
  FileText,
  Radio,
  Bell
} from 'lucide-react';
import { queryService } from '../../services/QueryService';
import { COUNTRIES, Country } from '../../models/Country';
import { EconomicObservation } from '../../models/Observation';
import { StatCardSkeleton } from '../../components/common/SkeletonLoader';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { Tooltip } from '../../components/common/Tooltip';
import {
  EconomicConceptId,
  MACRO_HEXAGON_CONCEPTS,
  SourceRouter,
  SOURCE_METADATA,
  ECONOMIC_CONCEPTS
} from '../../services/SourceRouter';
import { MacroCockpitBar } from '../../components/common/MacroCockpitBar';

interface PillarMetric {
  conceptId: EconomicConceptId;
  title: string;
  source: string;
  sourceBadge: string;
  routingReason: string;
  value: number | null;
  unit: string;
  period: string;
  indicatorId: string;
  dataset: string;
  icon: React.ElementType;
  alternatives: Array<{
    source: string;
    sourceName: string;
    indicatorId: string;
    dataset: string;
    label: string;
  }>;
}

const PILLAR_ICONS: Record<string, React.ElementType> = {
  gdp: TrendingUp,
  inflation: Activity,
  unemployment: Users,
  debt: Landmark,
  policy_rate: Percent,
  housing: Building2,
  energy: Flame,
  food: Wheat,
  credit_money: CircleDollarSign
};

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('FR');
  const [activeConcept, setActiveConcept] = useState<EconomicConceptId | null>(null);
  const [metrics, setMetrics] = useState<PillarMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const currentCountry = COUNTRIES.find(c => c.code === selectedCountryCode) || COUNTRIES[0];

  const loadDashboardData = async (force: boolean = false) => {
    setLoading(true);
    setError(null);

    try {
      // Resolve the 6 macro pillars for the selected country
      const resolutions = SourceRouter.resolveCockpit(MACRO_HEXAGON_CONCEPTS, selectedCountryCode);

      // Execute queries in parallel using resolved optimal sources
      const results = await Promise.allSettled(
        resolutions.map(res =>
          queryService.executeQuery(
            {
              source: res.source,
              dataset: res.dataset,
              indicator: res.indicatorId,
              countries: [selectedCountryCode],
              frequency: res.indicator.defaultFrequency
            },
            force
          )
        )
      );

      const loadedMetrics: PillarMetric[] = resolutions.map((res, index) => {
        const concept = ECONOMIC_CONCEPTS.find(c => c.id === res.conceptId)!;
        const meta = SOURCE_METADATA[res.source];
        const resOutcome = results[index];

        let latestObs: EconomicObservation | null = null;
        if (resOutcome.status === 'fulfilled') {
          const valid = (resOutcome.value.observations || []).filter(o => o.value !== null);
          if (valid.length > 0) {
            latestObs = valid[valid.length - 1];
          }
        }

        return {
          conceptId: res.conceptId,
          title: concept.labelFr,
          source: meta?.name || res.source.toUpperCase(),
          sourceBadge: meta?.badge || res.source.toUpperCase(),
          routingReason: res.reasonFr,
          value: latestObs ? latestObs.value : null,
          unit: res.indicator.unit,
          period: latestObs ? latestObs.period : '2025/2026',
          indicatorId: res.indicatorId,
          dataset: res.dataset,
          icon: PILLAR_ICONS[res.conceptId] || TrendingUp,
          alternatives: res.alternatives
        };
      });

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

  const handleInspect = (m: PillarMetric) => {
    navigate(
      `/explorer?source=${m.sourceBadge.toLowerCase().includes('eurostat') ? 'eurostat' : m.source.toLowerCase()}&indicator=${m.indicatorId}&countries=${selectedCountryCode}`
    );
  };

  const handleSelectPillarFromBar = (
    conceptId: EconomicConceptId,
    resolved: ReturnType<typeof SourceRouter.resolveBestSource>
  ) => {
    setActiveConcept(conceptId);
    navigate(
      `/explorer?source=${resolved.source}&indicator=${resolved.indicatorId}&dataset=${resolved.dataset}&countries=${selectedCountryCode}`
    );
  };

  const handleSelectCockpitHexagon = () => {
    navigate(`/explorer?countries=${selectedCountryCode}&source=auto`);
  };

  const majorCountries = COUNTRIES.filter(c =>
    ['FR', 'DE', 'IT', 'ES', 'NL', 'BE', 'EU', 'US', 'GB'].includes(c.code)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Top Welcome & Country Quick Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Executive Macro Intelligence</span>
            <span aria-hidden="true">·</span>
            <span>Routage Multi-Sources Intelligent</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> 12 Sources Officielles Connectées
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Cockpit Macroéconomique Universel
          </h1>
        </div>

        {/* Country Quick Tabs */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-x-auto max-w-full">
            {majorCountries.map(c => (
              <Tooltip key={c.code} content={`Afficher les 6 piliers pour : ${c.nameFr || c.name} (${c.region})`} position="bottom">
                <button
                  onClick={() => {
                    setSelectedCountryCode(c.code);
                    setActiveConcept(null);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap cursor-pointer ${
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

          <Tooltip content="Rafraîchir les 6 indicateurs officiels en direct" position="bottom">
            <button
              onClick={() => loadDashboardData(true)}
              className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              aria-label="Rafraîchir les données"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Intelligent Concept Router Quick Bar */}
      <MacroCockpitBar
        currentCountry={selectedCountryCode}
        activeConcept={activeConcept}
        onSelectConcept={handleSelectPillarFromBar}
        onSelectCockpitHexagon={handleSelectCockpitHexagon}
      />

      {/* Country Hero Header Card */}
      <div className="p-6 rounded-2xl bg-linear-to-r from-slate-950 via-slate-900 to-blue-950 text-white shadow-lg relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-15 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-300 text-xs font-medium">
              <span className="text-xl">{currentCountry.flag}</span>
              <span>{currentCountry.nameFr || currentCountry.name}</span>
              <span>·</span>
              <span>{currentCountry.isEU ? 'Zone Euro / Union Européenne' : 'Économie Internationale'}</span>
              <span>·</span>
              <span className="font-mono text-blue-400">Code: {currentCountry.code}</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight mt-1">
              Tableau de Bord des 6 Piliers Macroéconomiques
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Consolidation intelligente temps réel : <strong>PIB + Inflation + Chômage + Dette + Taux directeur + Immobilier</strong>.
              Chaque pilier est automatiquement extrait auprès de l'institution officielle souveraine la plus qualifiée (INSEE, BCE, Eurostat, FRED, BLS, FMI, Banque Mondiale).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 self-start md:self-center">
            <button
              onClick={() => navigate('/anomalies')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md active:scale-95 transition whitespace-nowrap cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Anomalies 🔔</span>
            </button>
            <button
              onClick={() => navigate(`/radar?country=${selectedCountryCode}`)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md active:scale-95 transition whitespace-nowrap cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Economic Radar 🌍</span>
            </button>
            <button
              onClick={() => navigate(`/scorecard?country=${selectedCountryCode}`)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md active:scale-95 transition whitespace-nowrap cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Fiche Pays</span>
            </button>
            <button
              onClick={handleSelectCockpitHexagon}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md active:scale-95 transition whitespace-nowrap cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Explorer les 6 Piliers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {error != null && <ErrorAlert error={error} onRetry={() => loadDashboardData(true)} />}

      {/* 6 Piliers Macro Cards Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Les 6 Piliers de l'Économie pour {currentCountry.nameFr || currentCountry.name}
            </h3>
          </div>
          {lastUpdated && (
            <span className="text-xs text-slate-400 font-mono">
              Mis à jour : {lastUpdated}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <StatCardSkeleton key={i} />)
            : metrics.map(m => {
                const Icon = m.icon;
                const isPositive = m.value !== null && m.value > 0;
                const isNegative = m.value !== null && m.value < 0;

                return (
                  <Tooltip
                    key={m.conceptId}
                    content={`${m.routingReason} Cliquez pour ouvrir l'analyse détaillée.`}
                    className="w-full"
                  >
                    <div
                      onClick={() => handleInspect(m)}
                      className="group w-full p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between"
                    >
                      <div>
                        {/* Source Badge with Flag */}
                        <div className="flex items-center justify-between gap-1 text-xs">
                          <span className="font-bold text-[11px] px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 truncate">
                            {m.sourceBadge}
                          </span>
                          <Icon className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors shrink-0" />
                        </div>

                        {/* Title */}
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-2 line-clamp-1">
                          {m.title}
                        </h4>

                        {/* Value & Unit */}
                        <div className="mt-2.5 flex items-baseline gap-1 font-mono tabular-nums">
                          <span
                            className={`text-xl font-extrabold tracking-tight ${
                              isNegative && (m.conceptId === 'gdp' || m.conceptId === 'housing')
                                ? 'text-rose-600 dark:text-rose-400'
                                : isPositive && m.conceptId === 'gdp'
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {m.value !== null
                              ? m.value > 0 && m.unit === '%'
                                ? `+${m.value}`
                                : m.value
                              : '—'}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                            {m.unit}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                        <div className="flex items-center justify-between font-mono">
                          <span>{m.period}</span>
                          <span className="text-blue-600 dark:text-blue-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center">
                            Détails →
                          </span>
                        </div>
                        {m.alternatives.length > 0 && (
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 truncate">
                            Alt: {m.alternatives.map(a => a.sourceName).join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </Tooltip>
                );
              })}
        </div>
      </div>

      {/* Quick Launchpad to Core Functions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div
          onClick={() => navigate('/explorer')}
          className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-600 transition cursor-pointer"
        >
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>Moteur de Requête Unifié</span>
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5">
            Explorateur Multi-Sources
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Consultez les 12 sources officielles, appliquez des filtres temporels et comparez les séries chronologiques en quelques clics.
          </p>
        </div>

        <div
          onClick={() => navigate('/compare')}
          className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-600 transition cursor-pointer"
        >
          <div className="flex items-center gap-2 text-amber-500 text-xs font-semibold">
            <Activity className="w-4 h-4" />
            <span>Comparateur Multi-Pays</span>
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5">
            Matrices & Benchmarks Internationaux
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Comparez la France, l'Allemagne, les États-Unis et l'UE côte à côte avec protection contre les mélanges d'unités incompatibles.
          </p>
        </div>

        <div
          onClick={() => navigate('/datasets')}
          className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-600 transition cursor-pointer"
        >
          <div className="flex items-center gap-2 text-emerald-500 text-xs font-semibold">
            <Building2 className="w-4 h-4" />
            <span>Catalogue des 12 Sources</span>
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5">
            Métadonnées & Spécifications SDMX
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Eurostat, FMI, Banque Mondiale, FRED, INSEE, BCE, BLS, OCDE, ONU, BRI, EIA et FAO : inspectez les flux et licences ouvertes.
          </p>
        </div>
      </div>
    </div>
  );
};
