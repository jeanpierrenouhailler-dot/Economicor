import React from 'react';
import { RadarCountry } from '../../models/Radar';

interface RadarWorldMapProps {
  countries: RadarCountry[];
  selectedCountryCode: string;
  onSelectCountry: (code: string) => void;
}

export const RadarWorldMap: React.FC<RadarWorldMapProps> = ({
  countries,
  selectedCountryCode,
  onSelectCountry
}) => {
  return (
    <div className="relative w-full aspect-[2/1] min-h-[380px] max-h-[520px] rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden select-none flex flex-col justify-between">
      {/* Background Grid & Radar Conic Sweep */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #38bdf8 1px, transparent 1px), linear-gradient(to bottom, #38bdf8 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />

        {/* Concentric Radar Rings */}
        <svg className="w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50%" cy="50%" r="15%" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="50%" cy="50%" r="30%" fill="none" stroke="#38bdf8" strokeWidth="1" />
          <circle cx="50%" cy="50%" r="45%" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="6 6" />
          {/* Axis Crosshairs */}
          <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
        </svg>

        {/* Radar Center Glow */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Header Overlay inside Radar */}
      <div className="relative z-10 p-4 sm:p-5 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <div className="text-xs font-mono font-bold tracking-widest text-blue-400 uppercase">
            Economic Radar · Live Geospatial Trajectories
          </div>
        </div>

        <div className="text-[11px] font-mono text-slate-400 hidden sm:block">
          Normes officielles (INSEE / Eurostat / BLS / FMI) · Cliquez sur un pôle
        </div>
      </div>

      {/* Main Interactive Map Canvas */}
      <div className="relative z-10 flex-1 w-full h-full">
        {countries.map(c => {
          const isSelected = c.code === selectedCountryCode;
          const growth = c.metrics.Croissance;
          const inflation = c.metrics.Inflation;

          return (
            <div
              key={c.code}
              style={{
                left: `${c.coordinates.x}%`,
                top: `${c.coordinates.y}%`
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
              onClick={() => onSelectCountry(c.code)}
            >
              {/* Pulse rings when selected */}
              {isSelected && (
                <div className="absolute -inset-3 rounded-full bg-blue-500/30 animate-ping pointer-events-none" />
              )}

              {/* Node Card */}
              <div
                className={`relative flex items-center gap-2 px-3 py-1.5 rounded-xl border backdrop-blur-md transition-all duration-200 active:scale-95 shadow-lg ${
                  isSelected
                    ? 'bg-blue-600 border-blue-400 text-white ring-4 ring-blue-500/20 scale-110 z-30'
                    : 'bg-slate-900/85 hover:bg-slate-800 border-slate-700/80 text-slate-200 hover:border-blue-400 z-10'
                }`}
              >
                <span className="text-base" role="img" aria-label={c.nameFr}>
                  {c.flag}
                </span>

                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-1.5 leading-none">
                    <span className="text-xs font-bold tracking-tight whitespace-nowrap">
                      {c.nameFr}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-black ${
                        growth.direction === 'up'
                          ? 'text-emerald-400'
                          : growth.direction === 'down'
                          ? 'text-rose-400'
                          : 'text-slate-300'
                      }`}
                    >
                      {growth.symbol}
                    </span>
                  </div>

                  <div className="text-[10px] font-mono text-slate-300 dark:text-slate-400 mt-0.5 whitespace-nowrap">
                    PIB {growth.formattedValue} · IPC {inflation.formattedValue} {inflation.symbol}
                  </div>
                </div>
              </div>

              {/* Radar Node Beacon Dot */}
              <div
                className={`w-2.5 h-2.5 rounded-full mx-auto -mt-1 border-2 border-slate-950 transition-colors ${
                  isSelected ? 'bg-white shadow-[0_0_12px_#3b82f6]' : 'bg-blue-400 group-hover:bg-blue-300'
                }`}
              />
            </div>
          );
        })}
      </div>

      {/* Footer Navigation Bar inside Canvas */}
      <div className="relative z-10 p-3 sm:p-4 bg-slate-900/90 backdrop-blur-md border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 overflow-x-auto py-1 max-w-full">
          <span className="text-slate-400 font-mono text-[11px] shrink-0">Pôles majeurs :</span>
          {countries.map(c => (
            <button
              key={c.code}
              onClick={() => onSelectCountry(c.code)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors shrink-0 flex items-center gap-1.5 ${
                c.code === selectedCountryCode
                  ? 'bg-blue-600 text-white shadow-xs font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>{c.flag}</span>
              <span>{c.nameFr}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 shrink-0">
          <div className="flex items-center gap-1">
            <span className="text-emerald-400 font-bold">↗</span>
            <span>Hausse</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-rose-400 font-bold">↘</span>
            <span>Baisse</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-slate-400 font-bold">→</span>
            <span>Stabilité</span>
          </div>
        </div>
      </div>
    </div>
  );
};
