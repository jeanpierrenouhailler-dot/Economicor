import React from 'react';
import { ScorecardPillar } from '../../models/Scorecard';
import { MetricCard } from './MetricCard';
import { TrendingUp, Percent, Building2, Users, LineChart } from 'lucide-react';

interface PillarSectionProps {
  pillar: ScorecardPillar;
  countryCode: string;
}

const PILLAR_ICONS: Record<string, React.ElementType> = {
  macro: TrendingUp,
  monetary: Percent,
  housing: Building2,
  labor: Users,
  finance: LineChart
};

export const PillarSection: React.FC<PillarSectionProps> = ({ pillar, countryCode }) => {
  const IconComponent = PILLAR_ICONS[pillar.id] || TrendingUp;

  return (
    <section className="space-y-4">
      {/* Pillar Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <IconComponent className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {pillar.title}
              </h2>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                · {pillar.badge}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {pillar.description}
            </p>
          </div>
        </div>

        {/* Diagnostic Statement badge */}
        <div className="text-xs text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-slate-700/80 max-w-xl text-left sm:text-right">
          <span className="font-semibold text-slate-900 dark:text-white">Diagnostic : </span>
          <span>{pillar.diagnostic}</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
        {pillar.metrics.map(metric => (
          <MetricCard key={metric.id} metric={metric} countryCode={countryCode} />
        ))}
      </div>
    </section>
  );
};
