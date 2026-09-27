import React from 'react';
import { COUNTRIES, Country } from '../../models/Country';
import { X, Check } from 'lucide-react';

interface CountrySelectorProps {
  selectedCountries: string[];
  onChange: (countries: string[]) => void;
  availableCountries?: Country[];
}

export const CountrySelector: React.FC<CountrySelectorProps> = ({
  selectedCountries,
  onChange,
  availableCountries = COUNTRIES
}) => {
  const toggleCountry = (code: string) => {
    if (selectedCountries.includes(code)) {
      if (selectedCountries.length > 1) {
        onChange(selectedCountries.filter(c => c !== code));
      }
    } else {
      onChange([...selectedCountries, code]);
    }
  };

  const applyPreset = (preset: 'eu4' | 'nordics' | 'eurozone' | 'g7') => {
    if (preset === 'eu4') {
      onChange(['FR', 'DE', 'IT', 'ES']);
    } else if (preset === 'nordics') {
      onChange(['SE', 'DK']);
    } else if (preset === 'eurozone') {
      onChange(['FR', 'DE', 'IT', 'ES', 'NL', 'BE']);
    } else if (preset === 'g7') {
      onChange(['US', 'DE', 'FR', 'GB', 'IT', 'JP', 'CA']);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <label className="font-semibold text-slate-700 dark:text-slate-300">
          Countries ({selectedCountries.length} selected)
        </label>
        {/* Preset quick buttons */}
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="text-slate-400">Presets:</span>
          <button
            type="button"
            onClick={() => applyPreset('eu4')}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Big 4
          </button>
          <span className="text-slate-300">·</span>
          <button
            type="button"
            onClick={() => applyPreset('eurozone')}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Eurozone
          </button>
          <span className="text-slate-300">·</span>
          <button
            type="button"
            onClick={() => applyPreset('g7')}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            G7
          </button>
        </div>
      </div>

      {/* Selected country tags */}
      <div className="flex flex-wrap gap-1.5 min-h-[34px] p-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg max-h-36 overflow-y-auto">
        {availableCountries.map((c) => {
          const isSelected = selectedCountries.includes(c.code);
          return (
            <button
              key={c.code}
              type="button"
              onClick={() => toggleCountry(c.code)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-md transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white font-medium shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <span>{c.flag}</span>
              <span>{c.name}</span>
              {isSelected ? (
                <X className="w-3 h-3 ml-0.5 opacity-70 hover:opacity-100" />
              ) : (
                <Check className="w-3 h-3 ml-0.5 opacity-30" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
