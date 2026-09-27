import React, { useState } from 'react';
import {
  TrendingUp,
  BarChart3,
  MapPin,
  Table as TableIcon,
  Share2,
  Check
} from 'lucide-react';
import { EconomicObservation, DataProvenance } from '../../models/Observation';
import { LineChart } from './LineChart';
import { BarChart } from './BarChart';
import { ChoroplethMap } from '../maps/ChoroplethMap';
import { ObservationTable } from '../tables/ObservationTable';
import { ProvenanceBadge } from '../common/ProvenanceBadge';

export type ViewMode = 'line' | 'bar' | 'map' | 'table';

interface ChartContainerProps {
  observations: EconomicObservation[];
  provenance: DataProvenance;
  unit?: string;
  frequency?: string;
  indicatorTitle: string;
  indicatorSubtitle?: string;
  onSelectCountry?: (countryCode: string) => void;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  observations,
  provenance,
  unit,
  frequency,
  indicatorTitle,
  indicatorSubtitle,
  onSelectCountry
}) => {
  const [activeView, setActiveView] = useState<ViewMode>('line');
  const [copiedLink, setCopiedLink] = useState(false);

  const handleShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // ignore
    }
  };

  const viewOptions: { id: ViewMode; label: string; icon: React.ElementType }[] = [
    { id: 'line', label: 'Time Series', icon: TrendingUp },
    { id: 'bar', label: 'Bar Comparison', icon: BarChart3 },
    { id: 'map', label: 'Geo Map', icon: MapPin },
    { id: 'table', label: 'Data Table', icon: TableIcon }
  ];

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
      {/* Header Bar */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
            {indicatorTitle}
          </h3>
          {indicatorSubtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {indicatorSubtitle}
            </p>
          )}
        </div>

        {/* View Switcher Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg">
          {viewOptions.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveView(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                activeView === id
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
          <button
            onClick={handleShareLink}
            className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors ml-1"
            title="Copy shareable URL"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Visual Display */}
      <div className="p-4 sm:p-6">
        {activeView === 'line' && (
          <LineChart observations={observations} unit={unit} height={380} />
        )}
        {activeView === 'bar' && (
          <BarChart observations={observations} unit={unit} />
        )}
        {activeView === 'map' && (
          <ChoroplethMap
            observations={observations}
            unit={unit}
            onSelectCountry={onSelectCountry}
          />
        )}
        {activeView === 'table' && (
          <ObservationTable
            observations={observations}
            unit={unit}
            sourceName={provenance.source}
          />
        )}
      </div>

      {/* Footer Provenance */}
      <div className="px-4 py-3 bg-slate-50/60 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <ProvenanceBadge
          provenance={provenance}
          unit={unit}
          frequency={frequency}
        />
      </div>
    </div>
  );
};
