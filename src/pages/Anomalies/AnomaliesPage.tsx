import React, { useState, useMemo } from 'react';
import { AnomalyDetectionService } from '../../services/AnomalyDetectionService';
import { AnomalyCard } from '../../components/anomalies/AnomalyCard';
import { EconomicAnomaly } from '../../models/Anomaly';
import {
  Bell,
  Sparkles,
  ShieldAlert,
  Filter,
  Activity,
  Layers,
  Search,
  CheckCircle2,
  TrendingUp,
  RefreshCw
} from 'lucide-react';

export const AnomaliesPage: React.FC = () => {
  const [anomalies, setAnomalies] = useState<EconomicAnomaly[]>(() =>
    AnomalyDetectionService.getWatchlistAnomalies()
  );
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Country list derived from anomalies
  const countries = useMemo(() => {
    const map = new Map<string, { code: string; label: string; flag: string }>();
    anomalies.forEach(a => {
      if (!map.has(a.countryCode)) {
        map.set(a.countryCode, {
          code: a.countryCode,
          label: a.countryLabel,
          flag: a.countryFlag
        });
      }
    });
    return Array.from(map.values());
  }, [anomalies]);

  // Filtered anomalies
  const filteredAnomalies = useMemo(() => {
    return anomalies.filter(a => {
      // Type / Severity filter
      if (activeFilter === 'high' && a.severity !== 'high') return false;
      if (activeFilter === 'record' && a.type !== 'historical_record') return false;
      if (activeFilter === 'velocity' && a.type !== 'velocity_surge') return false;

      // Country filter
      if (selectedCountry !== 'all' && a.countryCode !== selectedCountry) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          a.headline.toLowerCase().includes(q) ||
          a.indicatorLabel.toLowerCase().includes(q) ||
          a.countryLabel.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [anomalies, activeFilter, selectedCountry, searchQuery]);

  const maxZScore = useMemo(() => {
    return Math.max(...anomalies.map(a => Math.abs(a.zScore)));
  }, [anomalies]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Page Title & Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-blue-600 dark:text-blue-400 mb-1 uppercase tracking-wider">
            <span>Surveillance Statistique Continue</span>
            <span>·</span>
            <span>Algorithmes Z-Score &amp; Ruptures</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
              <Bell className="w-6 h-6 animate-pulse" />
            </span>
            <span>Détection Automatique d'Anomalies</span>
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Surveillance automatique des séries souveraines : identification instantanée des écarts à la tendance historique (&gt;2,0σ), accélérations trimestrielles anormales et records historiques, avec diagnostic économique approfondi par l'IA.
          </p>
        </div>

        {/* Global Stats Capsule */}
        <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs shrink-0 font-mono text-xs">
          <div className="text-center px-2">
            <span className="text-slate-400 block text-[10px] uppercase">Anomalies</span>
            <span className="text-lg font-black text-rose-600 dark:text-rose-400">
              {anomalies.length}
            </span>
          </div>
          <div className="h-7 w-px bg-slate-200 dark:bg-slate-800" />
          <div className="text-center px-2">
            <span className="text-slate-400 block text-[10px] uppercase">Z-Score Max</span>
            <span className="text-lg font-black text-blue-600 dark:text-blue-400">
              +{maxZScore.toFixed(1)}σ
            </span>
          </div>
          <div className="h-7 w-px bg-slate-200 dark:bg-slate-800" />
          <div className="text-center px-2">
            <span className="text-slate-400 block text-[10px] uppercase">Moteur IA</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block mt-1">
              Actif ⚡
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
        {/* Severity / Type segmented control */}
        <div className="flex items-center gap-1 overflow-x-auto py-0.5">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Toutes les alertes ({anomalies.length})
          </button>
          <button
            onClick={() => setActiveFilter('high')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeFilter === 'high'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Forts écarts (&ge; 2,0σ)
          </button>
          <button
            onClick={() => setActiveFilter('velocity')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeFilter === 'velocity'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Accélérations soudaines
          </button>
          <button
            onClick={() => setActiveFilter('record')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeFilter === 'record'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Records historiques
          </button>
        </div>

        {/* Country filter selector */}
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={selectedCountry}
            onChange={e => setSelectedCountry(e.target.value)}
            className="text-xs py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium cursor-pointer"
          >
            <option value="all">🌐 Tous les pays</option>
            {countries.map(c => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid of Anomalies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredAnomalies.map(anomaly => (
          <AnomalyCard key={anomaly.id} anomaly={anomaly} />
        ))}
      </div>

      {filteredAnomalies.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Aucune anomalie détectée pour ces critères
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Les séries sélectionnées évoluent dans leurs couloirs statistiques normaux (&lt; 2,0σ).
          </p>
        </div>
      )}

      {/* Methodological Transparency Note */}
      <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/60 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <span className="font-bold text-slate-900 dark:text-white">
            Méthodologie de détection statistique en 2 temps :
          </span>{' '}
          1° Calcul statistique transparent sans boîte noire : Z-Score des variations ($\Delta_t$), écart-type glissant ($\sigma$), dérivée seconde d'accélération et amplitude historique maximale depuis 2010. 2° Explication économique contextuelle générée sur demande par le modèle Gemini 3.8 Flash pour identifier les canaux de transmission macroéconomiques réels.
        </div>
      </div>
    </div>
  );
};
