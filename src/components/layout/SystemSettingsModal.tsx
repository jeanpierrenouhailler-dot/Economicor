import React, { useState } from 'react';
import {
  X,
  RefreshCw,
  Zap,
  CheckCircle2,
  Clock,
  Calendar,
  Layers,
  Database,
  Trash2,
  ShieldCheck,
  Sun,
  Moon,
  Laptop
} from 'lucide-react';
import { useAppUpdate } from '../../hooks/useAppUpdate';
import { useTheme } from '../../hooks/useTheme';
import { CacheService } from '../../services/CacheService';
import { Tooltip } from '../common/Tooltip';

interface SystemSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemSettingsModal: React.FC<SystemSettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    version,
    releaseDate,
    lastChecked,
    isChecking,
    updateAvailable,
    autoUpdateEnabled,
    statusMessage,
    checkForUpdates,
    forceUpdate,
    setAutoUpdate
  } = useAppUpdate();

  const { theme, setTheme } = useTheme();
  const [cacheCleared, setCacheCleared] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);

  if (!isOpen) return null;

  const handleClearCache = async () => {
    setIsClearingCache(true);
    await CacheService.clear();
    setCacheCleared(true);
    setIsClearingCache(false);
    setTimeout(() => setCacheCleared(false), 3000);
  };

  const formatLastChecked = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-6 text-slate-900 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              ⚙️
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Paramètres Système &amp; Mises à jour
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gestion des versions, du moteur PWA et du cache local
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section 1: Informations de Version */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Informations sur l'application
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Version & Date de sortie */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                <span>Date de sortie</span>
              </div>
              <div className="font-semibold text-slate-900 dark:text-white flex items-center justify-between">
                <span>{releaseDate}</span>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold">
                  v{version}
                </span>
              </div>
            </div>

            {/* Date de dernière vérification */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
                <Clock className="w-3.5 h-3.5 text-emerald-500" />
                <span>Dernière vérification</span>
              </div>
              <div className="font-medium text-slate-800 dark:text-slate-200 text-[11px] font-mono leading-tight">
                {formatLastChecked(lastChecked)}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Actions de Mises à jour */}
        <div className="space-y-3 p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-blue-950 dark:text-blue-200">
              Statut de la version
            </span>
            <span className="text-[11px] text-blue-700 dark:text-blue-300 font-medium">
              {statusMessage}
            </span>
          </div>

          {updateAvailable && (
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>Une nouvelle mise à jour a été téléchargée et est prête à l'activation !</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
            {/* Bouton Vérifier les mises à jour */}
            <Tooltip content="Recherche de nouvelles versions auprès du serveur et du service worker">
              <button
                onClick={() => checkForUpdates()}
                disabled={isChecking}
                className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-blue-500 ${isChecking ? 'animate-spin' : ''}`} />
                <span>{isChecking ? 'Vérification en cours...' : 'Vérifier les mises à jour'}</span>
              </button>
            </Tooltip>

            {/* Bouton Forcer la mise à jour */}
            <Tooltip content="Purge immédiatement les caches de l'application et recharge la dernière version de production">
              <button
                onClick={() => forceUpdate()}
                className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition active:scale-95 shadow-xs"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>Forcer la mise à jour</span>
              </button>
            </Tooltip>
          </div>

          {/* Toggle automatique en arrière-plan */}
          <div className="flex items-center justify-between pt-2 border-t border-blue-200/40 dark:border-blue-900/30 text-xs">
            <div className="space-y-0.5">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Mises à jour automatiques en arrière-plan
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Vérifie périodiquement et installe les nouvelles versions silencieusement
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-3 shrink-0">
              <input
                type="checkbox"
                checked={autoUpdateEnabled}
                onChange={(e) => setAutoUpdate(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* Section 3: Thème Visuel */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Thème de l'interface
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setTheme('light')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg border transition ${
                theme === 'light'
                  ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Clair</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg border transition ${
                theme === 'dark'
                  ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-sky-400" />
              <span>Sombre</span>
            </button>
            <button
              onClick={() => setTheme('system')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg border transition ${
                theme === 'system'
                  ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              <Laptop className="w-3.5 h-3.5 text-slate-500" />
              <span>Système</span>
            </button>
          </div>
        </div>

        {/* Section 4: Gestion du Cache Local IndexedDB */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="space-y-0.5">
            <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-blue-500" />
              <span>Cache IndexedDB Local</span>
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Contient les observations macroéconomiques pour le mode hors ligne
            </p>
          </div>

          <button
            onClick={handleClearCache}
            disabled={isClearingCache}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-lg transition disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{cacheCleared ? 'Cache vidé !' : 'Vider le cache'}</span>
          </button>
        </div>

        {/* Close Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
