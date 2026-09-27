import React, { useState, useMemo } from 'react';
import { EconomicObservation } from '../../models/Observation';
import { COUNTRIES } from '../../models/Country';

interface LineChartProps {
  observations: EconomicObservation[];
  unit?: string;
  height?: number;
}

const COUNTRY_COLORS = [
  '#2563EB', // Blue (France / primary)
  '#F59E0B', // Amber (Germany)
  '#10B981', // Emerald (Italy)
  '#EC4899', // Pink (Spain)
  '#8B5CF6', // Purple (Netherlands)
  '#06B6D4', // Cyan (Belgium)
  '#F97316', // Orange (EU)
  '#6366F1', // Indigo
  '#14B8A6', // Teal
  '#E11D48'  // Rose
];

export const LineChart: React.FC<LineChartProps> = ({
  observations,
  unit,
  height = 360
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<{
    period: string;
    items: { country: string; countryLabel: string; value: number | null; color: string }[];
    xPct: number;
  } | null>(null);

  // Group by country and sort periods
  const { seriesByCountry, uniquePeriods, minValue, maxValue } = useMemo(() => {
    const periodSet = new Set<string>();
    const countryMap = new Map<string, Map<string, number | null>>();
    const countryLabels = new Map<string, string>();

    let min = Infinity;
    let max = -Infinity;

    for (const obs of observations) {
      periodSet.add(obs.period);
      if (!countryMap.has(obs.country)) {
        countryMap.set(obs.country, new Map());
        countryLabels.set(obs.country, obs.countryLabel);
      }
      countryMap.get(obs.country)!.set(obs.period, obs.value);

      if (obs.value !== null && Number.isFinite(obs.value)) {
        if (obs.value < min) min = obs.value;
        if (obs.value > max) max = obs.value;
      }
    }

    const periods = Array.from(periodSet).sort();

    // Add padding to range
    if (!Number.isFinite(min)) min = 0;
    if (!Number.isFinite(max)) max = 100;
    const diff = max - min || 10;
    const paddedMin = Math.floor(min - diff * 0.1);
    const paddedMax = Math.ceil(max + diff * 0.1);

    const series = Array.from(countryMap.entries()).map(([country, valuesMap], idx) => {
      const color = COUNTRY_COLORS[idx % COUNTRY_COLORS.length];
      const dataPoints = periods.map(p => ({
        period: p,
        value: valuesMap.has(p) ? valuesMap.get(p)! : null
      }));
      return {
        country,
        countryLabel: countryLabels.get(country) || country,
        color,
        dataPoints
      };
    });

    return {
      seriesByCountry: series,
      uniquePeriods: periods,
      minValue: paddedMin,
      maxValue: paddedMax
    };
  }, [observations]);

  // Coordinate math
  const width = 800;
  const padding = { top: 25, right: 30, bottom: 40, left: 60 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const getX = (index: number) => {
    if (uniquePeriods.length <= 1) return padding.left + chartW / 2;
    return padding.left + (index / (uniquePeriods.length - 1)) * chartW;
  };

  const getY = (val: number | null) => {
    if (val === null || !Number.isFinite(val)) return chartH + padding.top;
    const ratio = (val - minValue) / (maxValue - minValue || 1);
    return padding.top + chartH - ratio * chartH;
  };

  // Horizontal ticks
  const yTicks = useMemo(() => {
    const count = 5;
    const step = (maxValue - minValue) / (count - 1);
    return Array.from({ length: count }, (_, i) => {
      const val = minValue + i * step;
      return {
        value: Math.round(val * 10) / 10,
        y: getY(val)
      };
    });
  }, [minValue, maxValue]);

  // X ticks step (stride to avoid overcrowding)
  const xStride = Math.max(1, Math.ceil(uniquePeriods.length / 8));

  // Build SVG path strings
  const paths = useMemo(() => {
    return seriesByCountry.map(s => {
      let d = '';
      const points: { x: number; y: number; val: number | null; period: string }[] = [];

      s.dataPoints.forEach((pt, idx) => {
        if (pt.value !== null) {
          const x = getX(idx);
          const y = getY(pt.value);
          points.push({ x, y, val: pt.value, period: pt.period });
          if (!d) {
            d = `M ${x.toFixed(1)} ${y.toFixed(1)}`;
          } else {
            d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
          }
        }
      });

      return {
        ...s,
        pathD: d,
        points
      };
    });
  }, [seriesByCountry, uniquePeriods, minValue, maxValue]);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const svgX = (mouseX / rect.width) * width;

    if (svgX < padding.left || svgX > width - padding.right || uniquePeriods.length === 0) {
      setHoveredPoint(null);
      return;
    }

    const relX = (svgX - padding.left) / chartW;
    const closestIdx = Math.min(
      uniquePeriods.length - 1,
      Math.max(0, Math.round(relX * (uniquePeriods.length - 1)))
    );

    const period = uniquePeriods[closestIdx];
    const items = seriesByCountry.map(s => {
      const pt = s.dataPoints[closestIdx];
      return {
        country: s.country,
        countryLabel: s.countryLabel,
        value: pt ? pt.value : null,
        color: s.color
      };
    });

    setHoveredPoint({
      period,
      items,
      xPct: (getX(closestIdx) / width) * 100
    });
  };

  if (observations.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-xs text-slate-400">
        No series observations available for selected parameters
      </div>
    );
  }

  return (
    <div className="relative w-full select-none">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mb-3 px-1 text-xs">
        {seriesByCountry.map(s => {
          const countryObj = COUNTRIES.find(c => c.code === s.country);
          return (
            <div key={s.country} className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
              <span>{countryObj?.flag} {s.countryLabel}</span>
            </div>
          );
        })}
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredPoint(null)}
        role="img"
        aria-label="Economic time series line chart"
      >
        {/* Background Grid Lines */}
        {yTicks.map(t => (
          <g key={t.value}>
            <line
              x1={padding.left}
              y1={t.y}
              x2={width - padding.right}
              y2={t.y}
              stroke="currentColor"
              strokeDasharray="3 3"
              className="text-slate-200 dark:text-slate-800"
              strokeWidth="1"
            />
            <text
              x={padding.left - 8}
              y={t.y + 3.5}
              textAnchor="end"
              className="text-[10px] font-mono fill-slate-400 dark:fill-slate-500"
            >
              {t.value}{unit ? ` ${unit}` : ''}
            </text>
          </g>
        ))}

        {/* X Axis Ticks */}
        {uniquePeriods.map((p, idx) => {
          if (idx % xStride !== 0 && idx !== uniquePeriods.length - 1) return null;
          const x = getX(idx);
          return (
            <text
              key={p}
              x={x}
              y={height - padding.bottom + 18}
              textAnchor="middle"
              className="text-[10px] font-mono fill-slate-400 dark:fill-slate-500"
            >
              {p}
            </text>
          );
        })}

        {/* Series Paths */}
        {paths.map(s => (
          <g key={s.country}>
            <path
              d={s.pathD}
              fill="none"
              stroke={s.color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Dots */}
            {s.points.map((pt, pIdx) => (
              <circle
                key={pIdx}
                cx={pt.x}
                cy={pt.y}
                r="3"
                fill={s.color}
                stroke="white"
                className="dark:stroke-slate-900"
                strokeWidth="1.5"
              />
            ))}
          </g>
        ))}

        {/* Active Hover Cursor Hairline */}
        {hoveredPoint && (
          <line
            x1={(hoveredPoint.xPct / 100) * width}
            y1={padding.top}
            x2={(hoveredPoint.xPct / 100) * width}
            y2={height - padding.bottom}
            stroke="#3B82F6"
            strokeWidth="1.5"
            strokeDasharray="4 2"
          />
        )}
      </svg>

      {/* Floating Tooltip */}
      {hoveredPoint && (
        <div
          className="absolute top-2 pointer-events-none z-20 -translate-x-1/2 p-2.5 rounded-lg bg-slate-900/95 dark:bg-slate-950/95 text-white border border-slate-700 shadow-xl backdrop-blur-xs min-w-[140px]"
          style={{
            left: `${Math.min(88, Math.max(12, hoveredPoint.xPct))}%`
          }}
        >
          <div className="text-[11px] font-mono text-slate-400 pb-1.5 border-b border-slate-800 flex items-center justify-between">
            <span>Period</span>
            <strong className="text-white">{hoveredPoint.period}</strong>
          </div>
          <div className="mt-1.5 space-y-1">
            {hoveredPoint.items.map(it => (
              <div key={it.country} className="flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: it.color }} />
                  <span className="text-slate-300 truncate">{it.countryLabel}</span>
                </div>
                <span className="font-mono tabular-nums font-semibold">
                  {it.value !== null ? `${it.value}${unit ? ` ${unit}` : ''}` : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
