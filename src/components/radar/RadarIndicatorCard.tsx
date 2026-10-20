import React, { useState } from 'react';
import { RadarMetric } from '../../models/Radar';
import { ScorecardSparkline } from '../scorecard/ScorecardSparkline';
import { ExternalLink, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RadarIndicatorCardProps {
  metric: RadarMetric;
  countryCode: string;
}

export const RadarIndicatorCard: React.FC<RadarIndicatorCardProps> = ({ metric, countryCode }) => {
  const [showMethodology, setShowMethodology] = useState(false);

  // Directional arrow color logic
  let symbolColor = 'text-slate-500';
  let symbolBg = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';

  if (metric.direction === 'up') {
    symbolColor = 'text-emerald-600 dark:text-emerald-400';
    symbolBg = 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60';
  } else if (metric.direction === 'down') {
    symbolColor = 'text-rose-600 dark:text-rose-400';
    symbolBg = 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60';
  }

  const explorerUrl = metric.explorerIndicatorId
    ? `/explorer?indicator=${encodeURIComponent(metric.explorerIndicatorId)}&country=${encodeURIComponent(countryCode)}`
    : `/explorer?country=${encodeURIComponent(countryCode)}`;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-4 transition-all hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xs flex flex-col justify-between">
      <div>
        {/* Top: Category & Source */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {metric.category}
          </span>

          <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <span>{metric.sourceFlag}</span>
            <span>{metric.sourceName}</span>
          </span>
        </div>

        {/* Center: Title + Huge Trajectory Arrow & Value */}
        <div className="flex items-start justify-between gap-3 my-2">
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
              {metric.label}
            </h3>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tabular-nums tracking-tight mt-1">
              {metric.formattedValue}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              {metric.period} · {metric.directionLabel}
            </div>
          </div>

          {/* Big Direction Arrow Badge */}
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-black shrink-0 border ${symbolBg} shadow-xs`}
            title={`Trajectoire : ${metric.directionLabel}`}
          >
            {metric.symbol}
          </div>
        </div>

        {/* Sparkline Visualisation */}
        {metric.sparkline && metric.sparkline.length > 0 && (
          <div className="my-2.5 flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <span className="text-[10px] font-mono text-slate-400">
              Historique ({metric.sparkline[0].period} → {metric.sparkline[metric.sparkline.length - 1].period})
            </span>
            <ScorecardSparkline
              points={metric.sparkline.map(p => ({ period: p.period, value: p.value }))}
              color={metric.direction === 'down' ? '#e11d48' : '#2563eb'}
              width={100}
              height={28}
            />
          </div>
        )}
      </div>

      {/* Transparent Methodology Drawer */}
      <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={() => setShowMethodology(!showMethodology)}
          className="w-full flex items-center justify-between text-[11px] font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 py-1 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-blue-500" />
            <span>Méthodologie &amp; Standard ({metric.methodologyStandard})</span>
          </span>
          {showMethodology ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>

        {showMethodology && (
          <div className="mt-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-[11px] text-slate-600 dark:text-slate-300 space-y-1.5 animate-fadeIn">
            <p className="leading-relaxed">
              <strong>Définition :</strong> {metric.methodology}
            </p>
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
              <span>Standard : {metric.methodologyStandard}</span>
              <span>Source : {metric.sourceName}</span>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 mt-1 text-xs">
          <span className="text-[11px] font-mono text-slate-400">
            Unité : {metric.unit}
          </span>

          <Link
            to={explorerUrl}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            <span>Ouvrir dans l’Explorateur</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};
