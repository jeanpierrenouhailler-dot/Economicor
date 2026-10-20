import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RadarService } from '../../services/RadarService';
import { RadarWorldMap } from '../../components/radar/RadarWorldMap';
import { CountryRadarPanel } from '../../components/radar/CountryRadarPanel';
import { RadarComparisonMatrix } from '../../components/radar/RadarComparisonMatrix';
import { AnomalyAlertBanner } from '../../components/anomalies/AnomalyAlertBanner';
import { AnomalyDetectionService } from '../../services/AnomalyDetectionService';
import { RadarIndicatorCategory, TrajectoryDirection } from '../../models/Radar';
import { Compass, Sparkles, Filter, Globe2 } from 'lucide-react';

export const RadarPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const countryParam = searchParams.get('country') || 'FR';

  const [selectedCountryCode, setSelectedCountryCode] = useState<string>(countryParam.toUpperCase());
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const allCountries = useMemo(() => RadarService.getAllCountries(), []);

  const selectedCountry = useMemo(() => {
    return RadarService.getCountry(selectedCountryCode);
  }, [selectedCountryCode]);

  // Detected anomalies for the currently inspected country in Radar
  const radarAnomalies = useMemo(() => {
    return AnomalyDetectionService.getWatchlistAnomalies().filter(
      a => a.countryCode === selectedCountryCode
    );
  }, [selectedCountryCode]);

  const handleSelectCountry = (code: string) => {
    setSelectedCountryCode(code);
    setSearchParams({ country: code });
  };

  // Trajectory Filters
  const filteredCountries = useMemo(() => {
    if (activeFilter === 'all') return allCountries;
    if (activeFilter === 'growth_up') return RadarService.filterByTrajectory('Croissance', 'up');
    if (activeFilter === 'inflation_down') return RadarService.filterByTrajectory('Inflation', 'down');
    if (activeFilter === 'exports_up') return RadarService.filterByTrajectory('Exportations', 'up');
    if (activeFilter === 'debt_up') return RadarService.filterByTrajectory('Dette', 'up');
    return allCountries;
  }, [allCountries, activeFilter]);

  const filterTabs = [
    { id: 'all', label: '🌍 Tous les pôles (6)', count: allCountries.length },
    { id: 'growth_up', label: 'Croissance ↗', count: RadarService.filterByTrajectory('Croissance', 'up').length },
    { id: 'inflation_down', label: 'Inflation ↘', count: RadarService.filterByTrajectory('Inflation', 'down').length },
    { id: 'exports_up', label: 'Exportations ↗', count: RadarService.filterByTrajectory('Exportations', 'up').length },
    { id: 'debt_up', label: 'Dette ↗', count: RadarService.filterByTrajectory('Dette', 'up').length }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-blue-600 dark:text-blue-400 mb-1 uppercase tracking-wider">
            <span>Economicor Radar</span>
            <span>·</span>
            <span>Signature Macroéconomique Mondiale</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <span>Economic Radar</span>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              100% Transparent
            </span>
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl">
            Carte radar mondiale des trajectoires macroéconomiques souveraines. Visualisez d’un coup d'œil les accélérations (↗), replis (↘) et stabilités (→) avec méthodologie vérifiable et sans score synthétique opaque.
          </p>
        </div>

        {/* Global Status Tracker */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono bg-white dark:bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0">
          <Globe2 className="w-4 h-4 text-blue-500" />
          <span>7 Indicateurs Clés · 6 Superpuissances</span>
        </div>
      </div>

      {/* Trajectory Filter Buttons */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto max-w-full">
        {filterTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeFilter === tab.id
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span>{tab.label}</span>
            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
              ({tab.count})
            </span>
          </button>
        ))}
      </div>

      {/* Interactive World Radar Map */}
      <RadarWorldMap
        countries={filteredCountries}
        selectedCountryCode={selectedCountryCode}
        onSelectCountry={handleSelectCountry}
      />

      {/* Active Anomaly Alerts for this Country in Radar */}
      {radarAnomalies.length > 0 && (
        <AnomalyAlertBanner anomalies={radarAnomalies} />
      )}

      {/* Detailed Country Breakdown Panel */}
      <CountryRadarPanel country={selectedCountry} />

      {/* Cross-Country Trajectory Comparison Matrix */}
      <RadarComparisonMatrix
        countries={allCountries}
        selectedCountryCode={selectedCountryCode}
        onSelectCountry={handleSelectCountry}
      />
    </div>
  );
};
