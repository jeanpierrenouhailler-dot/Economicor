import React from 'react';
import { ScorecardMetric } from '../../models/Scorecard';
import { ScorecardSparkline } from './ScorecardSparkline';
import { ArrowUpRight, ArrowDownRight, Minus, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MetricCardProps {
  metric: ScorecardMetric;
  countryCode: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ metric, countryCode }) => {
  // Determine trend color
  const isUp = metric.trend === 'up';
  const isDown = metric.trend === 'down';

  let deltaColor = 'text-slate-500';
  if (metric.polarity === 'higher_is_better') {
    deltaColor = isUp ? 'text-emerald-600 dark:text-emerald-400' : isDown ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500';
  } else if (metric.polarity === 'lower_is_better') {
    deltaColor = isDown ? 'text-emerald-600 dark:text-emerald-400' : isUp ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500';
  }

  // Health status badge border/accent
  let statusBadge = { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400', label: 'Neutre' };
  if (metric.healthStatus === 'favorable') {
    statusBadge = { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-400', label: 'Favorable' };
  } else if (metric.healthStatus === 'vigilance') {
    statusBadge = { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-400', label: 'Vigilance' };
  } else if (metric.healthStatus === 'alerte') {
    statusBadge = { bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-400', label: 'Alerte' };
  }

  const explorerUrl = metric.explorerIndicatorId
    ? `/explorer?indicator=${encodeURIComponent(metric.explorerIndicatorId)}&country=${encodeURIComponent(countryCode)}`
    : `/explorer?country=${encodeURIComponent(countryCode)}`;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-4 transition-all hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xs flex flex-col justify-between group">
      <div>
        {/* Header: Title + Source */}
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {metric.name}
            </h4>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {metric.period} · {metric.frequency}
            </div>
          </div>

          {/* Source Badge with Flag */}
          <span className="inline-flex items-center gap-1 text-[10px] font-medium font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
            <span>{metric.sourceFlag}</span>
            <span>{metric.sourceLabel}</span>
          </span>
        </div>

        {/* Big Numerical Value + Sparkline */}
        <div className="flex items-baseline justify-between gap-3 my-2.5">
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono tabular-nums tracking-tight">
            {metric.formattedValue}
          </div>

          <div className="shrink-0">
            <ScorecardSparkline
              points={metric.sparkline}
              color={metric.healthStatus === 'alerte' ? '#e11d48' : '#2563eb'}
              width={90}
              height={28}
            />
          </div>
        </div>

        {/* Target or Threshold (if any) */}
        {metric.targetLabel && (
          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-2">
            Réf : <span className="font-semibold">{metric.targetLabel}</span>
          </div>
        )}

        {/* Qualitative Contextual Comment */}
        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-3">
          {metric.statusComment}
        </p>
      </div>

      {/* Footer: Trend Arrow & Explorer Jump */}
      <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
        <div className={`flex items-center gap-1 font-semibold ${deltaColor}`}>
          {isUp ? (
            <ArrowUpRight className="w-3.5 h-3.5" />
          ) : isDown ? (
            <ArrowDownRight className="w-3.5 h-3.5" />
          ) : (
            <Minus className="w-3.5 h-3.5" />
          )}
          <span className="font-mono">{metric.delta > 0 ? `+${metric.delta}` : metric.delta}</span>
        </div>

        <Link
          to={explorerUrl}
          className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          title="Explorer cette série chronologique détaillée"
        >
          <span>Graphique</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
};
