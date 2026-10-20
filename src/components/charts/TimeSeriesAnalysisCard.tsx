import React, { useState } from 'react';
import { EconomicObservation } from '../../models/Observation';
import { TimeSeriesAnalysisService } from '../../services/TimeSeriesAnalysisService';
import { TimeSeriesAnalysis } from '../../models/TimeSeriesAnalysis';
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Sparkles,
  BarChart2,
  Calendar,
  Layers,
  Copy,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface TimeSeriesAnalysisCardProps {
  observations: EconomicObservation[];
  selectedCountry?: string;
  onSelectCountry?: (countryCode: string) => void;
  className?: string;
}

export const TimeSeriesAnalysisCard: React.FC<TimeSeriesAnalysisCardProps> = ({
  observations,
  selectedCountry,
  onSelectCountry,
  className = ''
}) => {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  // Get available countries in dataset
  const availableCountries = React.useMemo(() => {
    const set = new Set<string>();
    const list: { code: string; label: string }[] = [];
    for (const o of observations) {
      if (!set.has(o.country)) {
        set.add(o.country);
        list.push({ code: o.country, label: o.countryLabel || o.country });
      }
    }
    return list;
  }, [observations]);

  // Active country for analysis
  const activeCountryCode =
    selectedCountry || (availableCountries.length > 0 ? availableCountries[0].code : undefined);

  // Compute Time Series Analysis
  const analysis: TimeSeriesAnalysis | null = React.useMemo(() => {
    return TimeSeriesAnalysisService.analyzeSeries(observations, activeCountryCode);
  }, [observations, activeCountryCode]);

  if (!analysis) return null;

  const handleCopy = () => {
    const text = [
      `📊 ANALYSE TEMPORELLE — ${analysis.countryLabel} (${analysis.latestPeriod})`,
      `• Valeur actuelle : ${analysis.formattedCurrentValue} ${analysis.unit}`,
      analysis.periodVariation
        ? `• Variation périodique : ${analysis.periodVariation.formattedDelta} (vs ${analysis.periodVariation.previousPeriod})`
        : null,
      analysis.annualVariation
        ? `• Variation annuelle : ${analysis.annualVariation.formattedDelta} (vs ${analysis.annualVariation.comparisonPeriod})`
        : null,
      analysis.tenYearAverage !== null
        ? `• Moyenne 10 ans : ${analysis.formattedTenYearAverage} ${analysis.unit}`
        : null,
      analysis.spreadToAverage
        ? `• Écart à la moyenne : ${analysis.spreadToAverage.formattedSpread}`
        : null,
      `• Maximum historique : ${analysis.historicalMax.formattedValue} ${analysis.unit} (${analysis.historicalMax.period})`,
      `• Minimum historique : ${analysis.historicalMin.formattedValue} ${analysis.unit} (${analysis.historicalMin.period})`,
      `• Tendance : ${analysis.trend.durationLabel} (${analysis.trend.symbol})`
    ]
      .filter(Boolean)
      .join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Trend styling
  const isUp = analysis.trend.direction === 'up';
  const isDown = analysis.trend.direction === 'down';
  let trendColor = 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800';
  if (isUp) {
    trendColor = 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800/60';
  } else if (isDown) {
    trendColor = 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800/60';
  }

  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all ${className}`}
    >
      {/* Header Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Analyse Temporelle Approfondie
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                Statistiques Officielles
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Trajectoire conjoncturelle, cycles décennaux et extrêmes historiques pour{' '}
              <strong className="text-slate-800 dark:text-slate-200">
                {analysis.countryLabel}
              </strong>
            </p>
          </div>
        </div>

        {/* Multi-country pills if multiple countries present */}
        <div className="flex items-center gap-2 flex-wrap">
          {availableCountries.length > 1 && (
            <div className="flex items-center bg-slate-200/70 dark:bg-slate-800 p-0.5 rounded-lg">
              {availableCountries.map(c => (
                <button
                  key={c.code}
                  onClick={() => onSelectCountry && onSelectCountry(c.code)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                    c.code === activeCountryCode
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          )}

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition active:scale-95"
            title="Copier le diagnostic temporel complet"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Copié !</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Copier</span>
              </>
            )}
          </button>

          {/* Minimize / Expand Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title={isExpanded ? 'Réduire' : 'Agrandir'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      {isExpanded && (
        <div className="p-4 sm:p-6 space-y-6">
          {/* Flagship Headline Banner: 📈 Tendance + Valeur Actuelle */}
          <div className="p-4 sm:p-5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-linear-to-r from-slate-900 via-slate-850 to-blue-950 text-white">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-blue-300 uppercase tracking-wider mb-1">
                <span>Dernier point officiel</span>
                <span>·</span>
                <span>{analysis.latestPeriod}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono tabular-nums text-white">
                  {analysis.formattedCurrentValue}
                </span>
                <span className="text-sm text-slate-300 font-medium">{analysis.unit}</span>
              </div>
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                <span>Échantillon : {analysis.totalObservations} points</span>
                <span>·</span>
                <span>Période : {analysis.firstPeriod} → {analysis.latestPeriod}</span>
              </div>
            </div>

            {/* Signature Trend Badge */}
            <div className={`p-3.5 rounded-xl border flex items-center gap-3.5 ${trendColor}`}>
              <div className="text-3xl font-black">{analysis.trend.symbol}</div>
              <div>
                <div className="text-xs uppercase font-bold tracking-wider opacity-80">
                  Tendance Détectée
                </div>
                <div className="text-base sm:text-lg font-extrabold leading-tight">
                  {analysis.trend.durationLabel}
                </div>
                <div className="text-[11px] opacity-90 mt-0.5 max-w-xs">
                  {analysis.trend.summary}
                </div>
              </div>
            </div>
          </div>

          {/* The 6 Core Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* 1. Valeur actuelle */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Valeur actuelle
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono tabular-nums mt-1">
                {analysis.formattedCurrentValue}
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                {analysis.latestPeriod}
              </div>
            </div>

            {/* 2. Variation (MoM/QoQ) */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Variation
              </div>
              <div
                className={`text-xl sm:text-2xl font-black font-mono tabular-nums mt-1 flex items-center gap-1 ${
                  analysis.periodVariation?.isUp
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : analysis.periodVariation?.isDown
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <span>{analysis.periodVariation?.formattedDelta || '—'}</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">
                vs {analysis.periodVariation?.previousPeriod || 'précédent'}
              </div>
            </div>

            {/* 3. Variation annuelle (YoY) */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Variation annuelle
              </div>
              <div
                className={`text-xl sm:text-2xl font-black font-mono tabular-nums mt-1 flex items-center gap-1 ${
                  analysis.annualVariation?.isUp
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : analysis.annualVariation?.isDown
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <span>{analysis.annualVariation?.formattedDelta || '—'}</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">
                glissement 1 an
              </div>
            </div>

            {/* 4. Moyenne 10 ans */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Moyenne 10 ans
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono tabular-nums mt-1">
                {analysis.formattedTenYearAverage}
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                {analysis.tenYearPeriodRange}
              </div>
            </div>

            {/* 5. Écart à la moyenne */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Écart à la moyenne
              </div>
              <div
                className={`text-xl sm:text-2xl font-black font-mono tabular-nums mt-1 ${
                  analysis.spreadToAverage?.isAbove
                    ? 'text-blue-600 dark:text-blue-400'
                    : analysis.spreadToAverage?.isBelow
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-slate-600'
                }`}
              >
                {analysis.spreadToAverage?.formattedSpread || '0,0 %'}
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                {analysis.spreadToAverage?.isAbove ? 'au-dessus' : 'en-dessous'}
              </div>
            </div>

            {/* 6. Extrêmes Historiques (Max / Min) */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Extrêmes
                </div>
                <div className="mt-1 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500">Max :</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {analysis.historicalMax.formattedValue}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono mt-0.5">
                  <span className="text-slate-500">Min :</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {analysis.historicalMin.formattedValue}
                  </span>
                </div>
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-1 truncate">
                pic: {analysis.historicalMax.period}
              </div>
            </div>
          </div>

          {/* Historical Range Position Gauge */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Positionnement dans le tunnel historique [Min / Max]
              </span>
              <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">
                {analysis.rangePositionPercent}% du range historique
              </span>
            </div>

            {/* Range Bar */}
            <div className="relative w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-blue-500 via-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${analysis.rangePositionPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 pt-0.5">
              <span>
                Min : <strong>{analysis.historicalMin.formattedValue}</strong> ({analysis.historicalMin.period})
              </span>
              <span>
                Moyenne 10 ans : <strong>{analysis.formattedTenYearAverage}</strong>
              </span>
              <span>
                Max : <strong>{analysis.historicalMax.formattedValue}</strong> ({analysis.historicalMax.period})
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
