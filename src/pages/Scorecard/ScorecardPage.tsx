import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ScorecardService } from '../../services/ScorecardService';
import { ScorecardPillarId } from '../../models/Scorecard';
import { ExecutiveBriefingCard } from '../../components/scorecard/ExecutiveBriefingCard';
import { PillarSection } from '../../components/scorecard/PillarSection';
import { MetricCard } from '../../components/scorecard/MetricCard';
import { AnomalyAlertBanner } from '../../components/anomalies/AnomalyAlertBanner';
import { AnomalyDetectionService } from '../../services/AnomalyDetectionService';
import { Search, SlidersHorizontal, ArrowLeftRight, HelpCircle } from 'lucide-react';

export const ScorecardPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const countryParam = searchParams.get('country') || 'FR';

  const [selectedCountry, setSelectedCountry] = useState<string>(countryParam.toUpperCase());
  const [selectedPillar, setSelectedPillar] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const scorecard = useMemo(() => {
    return ScorecardService.getScorecard(selectedCountry);
  }, [selectedCountry]);

  // Detected anomalies for the currently selected country
  const countryAnomalies = useMemo(() => {
    return AnomalyDetectionService.getWatchlistAnomalies().filter(
      a => a.countryCode === selectedCountry
    );
  }, [selectedCountry]);

  const handleCountryChange = (code: string) => {
    setSelectedCountry(code);
    setSearchParams({ country: code });
  };

  const filteredPillars = useMemo(() => {
    if (selectedPillar === 'all') return scorecard.pillars;
    return scorecard.pillars.filter(p => p.id === selectedPillar);
  }, [scorecard, selectedPillar]);

  // When a search query is active, filter metrics directly
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    return ScorecardService.searchMetrics(scorecard, searchQuery, selectedPillar);
  }, [scorecard, searchQuery, selectedPillar]);

  const pillarTabs = [
    { id: 'all', label: 'Tous les 5 piliers', count: scorecard.pillars.reduce((acc, p) => acc + p.metrics.length, 0) },
    { id: 'macro', label: '🏛️ Macro', count: scorecard.pillars.find(p => p.id === 'macro')?.metrics.length || 0 },
    { id: 'monetary', label: '🏦 Monétaire', count: scorecard.pillars.find(p => p.id === 'monetary')?.metrics.length || 0 },
    { id: 'housing', label: '🏠 Immobilier', count: scorecard.pillars.find(p => p.id === 'housing')?.metrics.length || 0 },
    { id: 'labor', label: '💼 Travail', count: scorecard.pillars.find(p => p.id === 'labor')?.metrics.length || 0 },
    { id: 'finance', label: '📈 Finances', count: scorecard.pillars.find(p => p.id === 'finance')?.metrics.length || 0 }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Page Title & Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-blue-600 dark:text-blue-400 mb-1 uppercase tracking-wider">
            <span>Economic Intelligence Scorecard</span>
            <span>·</span>
            <span>Synthèse Macro Économique Décisionnelle</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Fiche Pays &amp; Intelligence Scorecard
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl">
            Vue synthétique instantanée sans devoir construire 15 graphiques. Diagnostic complet à travers les 5 piliers macroéconomiques souverains.
          </p>
        </div>

        {/* Global Stats Counter */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Données officielles normalisées · INSEE, BCE, Eurostat, FRED</span>
        </div>
      </div>

      {/* Flagship Executive Briefing Card */}
      <ExecutiveBriefingCard
        scorecard={scorecard}
        onCountryChange={handleCountryChange}
      />

      {/* Active Anomaly Alerts for this Country */}
      {countryAnomalies.length > 0 && (
        <AnomalyAlertBanner anomalies={countryAnomalies} />
      )}

      {/* Filter Bar: Segmented Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        {/* Pillar Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto max-w-full">
          {pillarTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedPillar(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                selectedPillar === tab.id
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

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un indicateur (ex: dette, loyers, cac)..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {searchResults ? (
        // Search Results View
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              Résultats de recherche pour <span className="font-semibold text-slate-900 dark:text-white">"{searchQuery}"</span> ({searchResults.length} indicateurs trouvés)
            </span>
            <button
              onClick={() => setSearchQuery('')}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Effacer la recherche
            </button>
          </div>

          {searchResults.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <p className="text-sm text-slate-500">
                Aucun indicateur ne correspond à votre recherche "{searchQuery}".
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {searchResults.map(m => (
                <MetricCard key={m.id} metric={m} countryCode={scorecard.countryCode} />
              ))}
            </div>
          )}
        </div>
      ) : (
        // Standard 5 Pillars View
        <div className="space-y-10 pt-2">
          {filteredPillars.map(pillar => (
            <PillarSection
              key={pillar.id}
              pillar={pillar}
              countryCode={scorecard.countryCode}
            />
          ))}
        </div>
      )}
    </div>
  );
};
