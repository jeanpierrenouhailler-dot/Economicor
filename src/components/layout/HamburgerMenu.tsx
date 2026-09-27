import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  X,
  LayoutDashboard,
  Compass,
  GitCompare,
  Database,
  Bookmark,
  History,
  Settings,
  HelpCircle,
  Sparkles,
  Info,
  Sun,
  Moon,
  Laptop,
  RefreshCw,
  Zap,
  CheckCircle2,
  Wifi,
  WifiOff,
  ChevronRight
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useAppUpdate } from '../../hooks/useAppUpdate';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { Tooltip } from '../common/Tooltip';

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSystemSettings: () => void;
  onOpenOnboarding: () => void;
  onOpenContextualHelp: () => void;
}

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  isOpen,
  onClose,
  onOpenSystemSettings,
  onOpenOnboarding,
  onOpenContextualHelp
}) => {
  const { theme, setTheme } = useTheme();
  const { version, updateAvailable, isChecking, statusMessage } = useAppUpdate();
  const isOnline = useOnlineStatus();

  if (!isOpen) return null;

  const categories = [
    {
      title: 'Exploration & Données',
      icon: '📊',
      items: [
        {
          to: '/',
          label: 'Tableau de Bord',
          badge: 'Live',
          description: 'PIB, Inflation, Dette, Chômage et Immobilier en temps réel',
          icon: LayoutDashboard
        },
        {
          to: '/explorer',
          label: 'Explorateur Dynamique',
          badge: 'Moteur',
          description: 'Séries temporelles, cartes choroplèthes et graphiques sur-mesure',
          icon: Compass
        },
        {
          to: '/datasets',
          label: 'Datasets & Métadonnées',
          badge: 'SDMX',
          description: 'Structures de données, DSD et dictionnaire de dimensions',
          icon: Database
        }
      ]
    },
    {
      title: 'Analyse & Comparaison',
      icon: '⚖️',
      items: [
        {
          to: '/compare',
          label: 'Comparateur Multi-Pays',
          badge: 'Benchmark',
          description: 'Confrontation croisée des économies européennes et mondiales',
          icon: GitCompare
        }
      ]
    },
    {
      title: 'Espaces Personnels',
      icon: '⭐',
      items: [
        {
          to: '/favorites',
          label: 'Analyses Favorites',
          badge: 'Offline',
          description: 'Indicateurs enregistrés pour consultation instantanée sans réseau',
          icon: Bookmark
        },
        {
          to: '/history',
          label: 'Historique des Requêtes',
          badge: 'Session',
          description: 'Journal des recherches récentes avec relance rapide en un clic',
          icon: History
        }
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className="relative z-10 w-full max-w-sm sm:max-w-md bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col h-full transform transition-transform duration-300 ease-out overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Menu principal"
      >
        {/* Header Drawer */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center text-white shadow-xs">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                Menu des Fonctionnalités
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Navigation catégorisée &amp; contrôles système
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition"
            aria-label="Fermer le menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-5">
          {/* Loop over categorized navigation items */}
          {categories.map((cat, catIdx) => (
            <div key={catIdx} className="space-y-1.5">
              <div className="px-2.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <span>{cat.icon}</span>
                <span>{cat.title}</span>
              </div>

              <div className="space-y-1">
                {cat.items.map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-start gap-3 p-2.5 rounded-xl transition-all group ${
                          isActive
                            ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/40 shadow-xs'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent'
                        }`
                      }
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 flex items-center justify-center shrink-0 transition-colors mt-0.5">
                        <ItemIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                            {item.label}
                          </span>
                          <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {item.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5 truncate">
                          {item.description}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0 self-center" />
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Section: Système & Préférences */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="px-2.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <span>⚙️</span>
              <span>Système &amp; Préférences</span>
            </div>

            {/* System Settings Action Button */}
            <button
              onClick={() => {
                onClose();
                onOpenSystemSettings();
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>Paramètres Système &amp; Mises à jour</span>
                    {updateAvailable && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Vérification, version v{version}, dates et purge du cache
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* Quick Theme Switcher */}
            <div className="p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">
                Thème d'affichage :
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => setTheme('light')}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-medium rounded-lg border transition ${
                    theme === 'light'
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Clair</span>
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-medium rounded-lg border transition ${
                    theme === 'dark'
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5 text-sky-400" />
                  <span>Sombre</span>
                </button>
                <button
                  onClick={() => setTheme('system')}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-medium rounded-lg border transition ${
                    theme === 'system'
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Laptop className="w-3.5 h-3.5 text-slate-500" />
                  <span>Système</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section: Aide & Guides */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="px-2.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <span>💡</span>
              <span>Aide &amp; Documentation</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenOnboarding();
                }}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:bg-slate-50 text-left transition text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="truncate">Guide Onboarding</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenContextualHelp();
                }}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:bg-slate-50 text-left transition text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                <HelpCircle className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="truncate">Centre d'Aide</span>
              </button>
            </div>

            <NavLink
              to="/about"
              onClick={onClose}
              className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition"
            >
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-slate-400" />
                <span>Architecture technique &amp; Datasets</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </NavLink>
          </div>
        </div>

        {/* Footer Drawer */}
        <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 shrink-0 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
              v{version}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">En ligne</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-amber-600 dark:text-amber-400">Cache local</span>
                </>
              )}
            </span>
          </div>

          <button
            onClick={() => {
              onClose();
              onOpenSystemSettings();
            }}
            className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
          >
            Paramètres ⚙️
          </button>
        </div>
      </div>
    </div>
  );
};
