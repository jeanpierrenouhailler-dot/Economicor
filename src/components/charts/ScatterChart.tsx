import React, { useMemo } from 'react';
import { EconomicObservation } from '../../models/Observation';
import { COUNTRIES } from '../../models/Country';

interface ScatterChartProps {
  observationsA: EconomicObservation[];
  observationsB: EconomicObservation[];
  labelA: string;
  labelB: string;
  unitA?: string;
  unitB?: string;
  height?: number;
}

export const ScatterChart: React.FC<ScatterChartProps> = ({
  observationsA,
  observationsB,
  labelA,
  labelB,
  unitA,
  unitB,
  height = 360
}) => {
  // Join observations by (country, period)
  const pairedPoints = useMemo(() => {
    const mapB = new Map<string, number | null>();
    for (const b of observationsB) {
      if (b.value !== null) {
        mapB.set(`${b.country}_${b.period}`, b.value);
      }
    }

    const points: { country: string; countryLabel: string; period: string; x: number; y: number }[] = [];
    for (const a of observationsA) {
      if (a.value !== null) {
        const key = `${a.country}_${a.period}`;
        const valB = mapB.get(key);
        if (valB !== undefined && valB !== null) {
          points.push({
            country: a.country,
            countryLabel: a.countryLabel,
            period: a.period,
            x: a.value,
            y: valB
          });
        }
      }
    }
    return points;
  }, [observationsA, observationsB]);

  const { minX, maxX, minY, maxY } = useMemo(() => {
    if (pairedPoints.length === 0) return { minX: 0, maxX: 10, minY: 0, maxY: 10 };
    let minx = Infinity, maxx = -Infinity, miny = Infinity, maxy = -Infinity;
    for (const p of pairedPoints) {
      if (p.x < minx) minx = p.x;
      if (p.x > maxx) maxx = p.x;
      if (p.y < miny) miny = p.y;
      if (p.y > maxy) maxy = p.y;
    }
    const padX = (maxx - minx) * 0.1 || 1;
    const padY = (maxy - miny) * 0.1 || 1;
    return {
      minX: minx - padX,
      maxX: maxx + padX,
      minY: miny - padY,
      maxY: maxy + padY
    };
  }, [pairedPoints]);

  const width = 800;
  const padding = { top: 30, right: 40, bottom: 50, left: 60 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const getSvgX = (val: number) => padding.left + ((val - minX) / (maxX - minX || 1)) * chartW;
  const getSvgY = (val: number) => padding.top + chartH - ((val - minY) / (maxY - minY || 1)) * chartH;

  if (pairedPoints.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center p-6 text-slate-400">
        <p className="text-xs">No overlapping country and period data points found to correlate.</p>
        <p className="text-[11px] text-slate-500 mt-1">Select comparable countries and matching frequencies.</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2 select-none">
      <div className="flex justify-between items-center text-xs text-slate-500 px-1">
        <span>X Axis: <strong>{labelA}</strong> {unitA ? `(${unitA})` : ''}</span>
        <span>Y Axis: <strong>{labelB}</strong> {unitB ? `(${unitB})` : ''}</span>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        {/* Zero axes if applicable */}
        {minX <= 0 && maxX >= 0 && (
          <line
            x1={getSvgX(0)}
            y1={padding.top}
            x2={getSvgX(0)}
            y2={height - padding.bottom}
            stroke="#94A3B8"
            strokeDasharray="2 2"
          />
        )}
        {minY <= 0 && maxY >= 0 && (
          <line
            x1={padding.left}
            y1={getSvgY(0)}
            x2={width - padding.right}
            y2={getSvgY(0)}
            stroke="#94A3B8"
            strokeDasharray="2 2"
          />
        )}

        {/* Points */}
        {pairedPoints.map((pt, i) => {
          const cx = getSvgX(pt.x);
          const cy = getSvgY(pt.y);
          const country = COUNTRIES.find(c => c.code === pt.country);

          return (
            <g key={i} className="hover:opacity-80 transition-opacity">
              <circle
                cx={cx}
                cy={cy}
                r="6"
                fill="#3B82F6"
                fillOpacity="0.8"
                stroke="#1E40AF"
                strokeWidth="1.5"
              />
              <text
                x={cx + 8}
                y={cy + 3}
                className="text-[10px] font-medium fill-slate-700 dark:fill-slate-300"
              >
                {country?.flag || pt.country} ({pt.period})
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
