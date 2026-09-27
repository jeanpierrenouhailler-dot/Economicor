import React, { useMemo } from 'react';
import { EconomicObservation } from '../../models/Observation';
import { COUNTRIES } from '../../models/Country';

interface BarChartProps {
  observations: EconomicObservation[];
  unit?: string;
  selectedPeriod?: string;
}

export const BarChart: React.FC<BarChartProps> = ({
  observations,
  unit,
  selectedPeriod
}) => {
  // Find target period: if selectedPeriod provided, use it; otherwise use latest available period
  const { targetPeriod, countryValues, minVal, maxVal } = useMemo(() => {
    if (observations.length === 0) {
      return { targetPeriod: '', countryValues: [], minVal: 0, maxVal: 10 };
    }

    // Find all periods
    const allPeriods = Array.from(new Set(observations.map(o => o.period))).sort();
    const period = selectedPeriod && allPeriods.includes(selectedPeriod)
      ? selectedPeriod
      : allPeriods[allPeriods.length - 1];

    // Filter observations for target period
    const obsAtPeriod = observations.filter(o => o.period === period);
    const map = new Map<string, { country: string; label: string; value: number | null }>();

    for (const o of obsAtPeriod) {
      map.set(o.country, {
        country: o.country,
        label: o.countryLabel,
        value: o.value
      });
    }

    const items = Array.from(map.values())
      .filter(it => it.value !== null)
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

    let min = 0;
    let max = 0;
    for (const it of items) {
      if (it.value !== null) {
        if (it.value < min) min = it.value;
        if (it.value > max) max = it.value;
      }
    }

    const maxAbs = Math.max(Math.abs(min), Math.abs(max)) || 10;
    return {
      targetPeriod: period,
      countryValues: items,
      minVal: min < 0 ? -maxAbs : 0,
      maxVal: maxAbs
    };
  }, [observations, selectedPeriod]);

  if (countryValues.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-xs text-slate-400">
        No comparative observations available for period {targetPeriod}
      </div>
    );
  }

  return (
    <div className="w-full space-y-3 py-2">
      <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100 dark:border-slate-800">
        <span>Cross-Country Snapshot</span>
        <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">Period: {targetPeriod}</span>
      </div>

      <div className="space-y-2.5">
        {countryValues.map((item) => {
          const countryObj = COUNTRIES.find(c => c.code === item.country);
          const val = item.value ?? 0;
          const isNegative = val < 0;
          const pct = Math.min(100, Math.max(2, (Math.abs(val) / (maxVal || 1)) * 100));

          return (
            <div key={item.country} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                  <span className="text-sm">{countryObj?.flag || '🌐'}</span>
                  <span>{item.label}</span>
                </div>
                <span className={`font-mono tabular-nums font-semibold ${isNegative ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
                  {val > 0 && unit === '%' ? `+${val}` : val}
                  {unit ? ` ${unit}` : ''}
                </span>
              </div>

              {/* Bar track */}
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isNegative
                      ? 'bg-rose-500'
                      : val > 0 && unit === '%'
                      ? 'bg-emerald-500'
                      : 'bg-blue-600'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
