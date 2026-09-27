import React, { useState, useMemo } from 'react';
import { EconomicObservation } from '../../models/Observation';
import { COUNTRIES } from '../../models/Country';

interface ChoroplethMapProps {
  observations: EconomicObservation[];
  selectedPeriod?: string;
  unit?: string;
  onSelectCountry?: (countryCode: string) => void;
}

// Simplified high-fidelity SVG paths for European & Global nations
const MAP_PATHS: Record<string, { d: string; name: string; cx: number; cy: number }> = {
  FR: {
    name: 'France',
    d: 'M 350 300 L 380 290 L 410 310 L 420 340 L 410 380 L 370 410 L 330 380 L 330 340 Z',
    cx: 370,
    cy: 345
  },
  DE: {
    name: 'Germany',
    d: 'M 410 210 L 460 200 L 480 240 L 460 290 L 430 300 L 400 270 L 400 230 Z',
    cx: 440,
    cy: 250
  },
  IT: {
    name: 'Italy',
    d: 'M 420 370 L 470 380 L 490 430 L 520 480 L 500 510 L 470 470 L 440 410 Z',
    cx: 470,
    cy: 440
  },
  ES: {
    name: 'Spain',
    d: 'M 250 380 L 330 380 L 340 430 L 310 470 L 240 450 L 230 400 Z',
    cx: 285,
    cy: 425
  },
  PT: {
    name: 'Portugal',
    d: 'M 215 395 L 240 390 L 245 450 L 220 450 Z',
    cx: 230,
    cy: 420
  },
  NL: {
    name: 'Netherlands',
    d: 'M 390 190 L 420 185 L 425 215 L 395 220 Z',
    cx: 405,
    cy: 200
  },
  BE: {
    name: 'Belgium',
    d: 'M 380 220 L 405 215 L 410 245 L 385 245 Z',
    cx: 395,
    cy: 230
  },
  AT: {
    name: 'Austria',
    d: 'M 470 295 L 530 295 L 540 325 L 480 330 Z',
    cx: 505,
    cy: 310
  },
  IE: {
    name: 'Ireland',
    d: 'M 255 190 L 285 180 L 290 220 L 260 225 Z',
    cx: 270,
    cy: 205
  },
  GB: {
    name: 'United Kingdom',
    d: 'M 300 170 L 340 140 L 360 170 L 345 250 L 310 240 L 290 200 Z',
    cx: 330,
    cy: 195
  },
  SE: {
    name: 'Sweden',
    d: 'M 470 50 L 510 50 L 520 160 L 480 180 L 460 140 Z',
    cx: 490,
    cy: 110
  },
  DK: {
    name: 'Denmark',
    d: 'M 430 140 L 460 140 L 465 170 L 435 170 Z',
    cx: 445,
    cy: 155
  },
  PL: {
    name: 'Poland',
    d: 'M 490 190 L 580 190 L 590 260 L 500 270 Z',
    cx: 540,
    cy: 230
  },
  GR: {
    name: 'Greece',
    d: 'M 560 460 L 610 460 L 620 510 L 570 520 Z',
    cx: 590,
    cy: 490
  },
  US: {
    name: 'United States',
    d: 'M 50 250 L 170 240 L 180 320 L 60 330 Z',
    cx: 115,
    cy: 285
  }
};

export const ChoroplethMap: React.FC<ChoroplethMapProps> = ({
  observations,
  selectedPeriod,
  unit,
  onSelectCountry
}) => {
  const [hoveredCountry, setHoveredCountry] = useState<{
    code: string;
    name: string;
    value: number | null;
    x: number;
    y: number;
  } | null>(null);

  // Determine latest period and extract country values
  const { period, valueMap, minVal, maxVal } = useMemo(() => {
    if (observations.length === 0) return { period: '', valueMap: new Map<string, number>(), minVal: 0, maxVal: 100 };
    const allPeriods = Array.from(new Set(observations.map(o => o.period))).sort();
    const targetPeriod = selectedPeriod && allPeriods.includes(selectedPeriod)
      ? selectedPeriod
      : allPeriods[allPeriods.length - 1];

    const vMap = new Map<string, number>();
    let min = Infinity;
    let max = -Infinity;

    for (const o of observations) {
      if (o.period === targetPeriod && o.value !== null) {
        vMap.set(o.country, o.value);
        if (o.value < min) min = o.value;
        if (o.value > max) max = o.value;
      }
    }

    if (!Number.isFinite(min)) min = 0;
    if (!Number.isFinite(max)) max = 100;

    return {
      period: targetPeriod,
      valueMap: vMap,
      minVal: min,
      maxVal: max
    };
  }, [observations, selectedPeriod]);

  // Color scale: accessible Viridis/Blue-Amber gradient
  const getColor = (code: string) => {
    const val = valueMap.get(code);
    if (val === undefined || val === null) {
      return '#E2E8F0'; // neutral slate
    }

    const range = maxVal - minVal || 1;
    const ratio = Math.max(0, Math.min(1, (val - minVal) / range));

    // Colorblind-safe palette (Dark Slate -> Blue -> Sky -> Emerald/Amber)
    if (unit === '%') {
      if (val < 0) return '#F43F5E'; // Red/rose for negative growth/balance
      if (ratio < 0.3) return '#93C5FD';
      if (ratio < 0.6) return '#3B82F6';
      if (ratio < 0.8) return '#1D4ED8';
      return '#10B981';
    }

    // Index scale
    const lightness = Math.round(85 - ratio * 50); // 85% down to 35%
    return `hsl(217, 85%, ${lightness}%)`;
  };

  return (
    <div className="relative w-full space-y-3 p-2 select-none">
      <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100 dark:border-slate-800">
        <span>Geographic Distribution (Choropleth)</span>
        <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
          Period: {period}
        </span>
      </div>

      <div className="relative bg-slate-50/70 dark:bg-slate-900/40 rounded-xl p-4 overflow-hidden border border-slate-100 dark:border-slate-800">
        <svg viewBox="180 30 500 520" className="w-full h-auto max-h-[460px]">
          {Object.entries(MAP_PATHS).map(([code, geo]) => {
            const hasData = valueMap.has(code);
            const fillColor = getColor(code);
            const countryMeta = COUNTRIES.find(c => c.code === code);

            return (
              <g
                key={code}
                className="cursor-pointer transition-all duration-200"
                onClick={() => onSelectCountry && onSelectCountry(code)}
                onMouseEnter={() => {
                  setHoveredCountry({
                    code,
                    name: countryMeta?.name || geo.name,
                    value: valueMap.get(code) ?? null,
                    x: geo.cx,
                    y: geo.cy
                  });
                }}
                onMouseLeave={() => setHoveredCountry(null)}
              >
                <path
                  d={geo.d}
                  fill={fillColor}
                  stroke="#FFFFFF"
                  className="dark:stroke-slate-900 hover:stroke-slate-900 dark:hover:stroke-white"
                  strokeWidth="1.5"
                />
                {/* Code label on country center */}
                <text
                  x={geo.cx}
                  y={geo.cy}
                  textAnchor="middle"
                  className={`text-[9px] font-bold pointer-events-none ${
                    hasData ? 'fill-slate-900 dark:fill-white' : 'fill-slate-400'
                  }`}
                >
                  {code}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating tooltip */}
        {hoveredCountry && (
          <div
            className="absolute z-20 pointer-events-none p-2 rounded-lg bg-slate-900/95 dark:bg-slate-950/95 text-white border border-slate-700 shadow-xl backdrop-blur-xs text-xs"
            style={{
              left: `${Math.min(75, Math.max(15, (hoveredCountry.x / 700) * 100))}%`,
              top: `${Math.min(75, Math.max(15, (hoveredCountry.y / 550) * 100))}%`
            }}
          >
            <div className="font-semibold flex items-center gap-1.5">
              <span>{COUNTRIES.find(c => c.code === hoveredCountry.code)?.flag}</span>
              <span>{hoveredCountry.name}</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-300 font-mono">
              {hoveredCountry.value !== null
                ? `${hoveredCountry.value}${unit ? ` ${unit}` : ''}`
                : 'No data'}
            </div>
          </div>
        )}

        {/* Map Legend */}
        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 font-mono px-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <span>Min: {minVal.toFixed(1)}{unit ? ` ${unit}` : ''}</span>
          <div className="flex items-center gap-1">
            <span className="w-16 h-2 rounded-full bg-gradient-to-r from-blue-300 via-blue-600 to-emerald-500" />
            <span className="text-[10px] text-slate-400 ml-1">Gradient Scale</span>
          </div>
          <span>Max: {maxVal.toFixed(1)}{unit ? ` ${unit}` : ''}</span>
        </div>
      </div>
    </div>
  );
};
