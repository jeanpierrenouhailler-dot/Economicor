import React from 'react';

interface PeriodRangeSliderProps {
  startYear: number;
  endYear: number;
  minYear?: number;
  maxYear?: number;
  onChange: (start: number, end: number) => void;
}

export const PeriodRangeSlider: React.FC<PeriodRangeSliderProps> = ({
  startYear,
  endYear,
  minYear = 2010,
  maxYear = 2026,
  onChange
}) => {
  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (val <= endYear) {
      onChange(val, endYear);
    }
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (val >= startYear) {
      onChange(startYear, val);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <label className="font-semibold text-slate-700 dark:text-slate-300">
          Time Horizon
        </label>
        <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">
          {startYear} — {endYear} ({endYear - startYear + 1} yrs)
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 space-y-1">
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>From: {startYear}</span>
            <span>Min: {minYear}</span>
          </div>
          <input
            type="range"
            min={minYear}
            max={maxYear}
            value={startYear}
            onChange={handleStartChange}
            className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
          />
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>To: {endYear}</span>
            <span>Max: {maxYear}</span>
          </div>
          <input
            type="range"
            min={minYear}
            max={maxYear}
            value={endYear}
            onChange={handleEndChange}
            className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};
