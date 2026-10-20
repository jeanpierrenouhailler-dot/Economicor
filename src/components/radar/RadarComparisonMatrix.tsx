import React from 'react';
import { RadarCountry, RadarIndicatorCategory } from '../../models/Radar';
import { RadarService } from '../../services/RadarService';

interface RadarComparisonMatrixProps {
  countries: RadarCountry[];
  selectedCountryCode: string;
  onSelectCountry: (code: string) => void;
}

export const RadarComparisonMatrix: React.FC<RadarComparisonMatrixProps> = ({
  countries,
  selectedCountryCode,
  onSelectCountry
}) => {
  const categories = RadarService.getCategories();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Matrice Comparative des Trajectoires Mondiales
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Confrontation instantanée des 7 indicateurs souverains à travers les pôles économiques
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-100 dark:border-slate-800">
            <tr>
              <th className="py-3 px-4">Pays / Pôle</th>
              {categories.map(cat => (
                <th key={cat} className="py-3 px-3 text-center whitespace-nowrap">
                  {cat}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {countries.map(c => {
              const isSelected = c.code === selectedCountryCode;
              return (
                <tr
                  key={c.code}
                  onClick={() => onSelectCountry(c.code)}
                  className={`transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/70 dark:bg-blue-950/40 font-semibold'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{c.flag}</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {c.nameFr}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                          Actif
                        </span>
                      )}
                    </div>
                  </td>

                  {categories.map(cat => {
                    const m = c.metrics[cat];
                    const isUp = m.direction === 'up';
                    const isDown = m.direction === 'down';

                    return (
                      <td key={cat} className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="flex flex-col items-center">
                          <span
                            className={`text-sm font-mono font-black ${
                              isUp
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : isDown
                                ? 'text-rose-600 dark:text-rose-400'
                                : 'text-slate-400'
                            }`}
                          >
                            {m.symbol}
                          </span>
                          <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 tabular-nums">
                            {m.formattedValue}
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
