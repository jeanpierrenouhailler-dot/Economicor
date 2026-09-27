import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Menu,
  Sun,
  Moon,
  Laptop,
  Settings,
  HelpCircle,
  Sparkles,
  RefreshCw,
  Zap
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useAppUpdate } from '../../hooks/useAppUpdate';
import { PWAInstallButton } from './PWAInstallButton';
import { OfflineIndicator } from './OfflineIndicator';
import { AppLogo } from '../common/AppLogo';
import { Tooltip } from '../common/Tooltip';
import { HamburgerMenu } from './HamburgerMenu';
import { SystemSettingsModal } from './SystemSettingsModal';
import { OnboardingModal } from '../common/OnboardingModal';
import { ContextualHelpModal } from '../common/ContextualHelpModal';

export const Header: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { updateAvailable, isChecking, version } = useAppUpdate();

  // Modals state
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const toggleTheme = () => {
    if (theme === 'dark') setTheme('light');
    else if (theme === 'light') setTheme('system');
    else setTheme('dark');
  };

  const navLinks = [
    { to: '/', label: 'Dashboard', tooltip: 'Tableau de bord macroéconomique en direct' },
    { to: '/explorer', label: 'Explorer', tooltip: 'Moteur d’exploration, filtres et graphiques' },
    { to: '/compare', label: 'Compare', tooltip: 'Comparateur multi-pays et multi-indicateurs' },
    { to: '/datasets', label: 'Datasets', tooltip: 'Dictionnaire des structures et métadonnées SDMX' },
    { to: '/favorites', label: 'Favorites', tooltip: 'Analyses sauvegardées hors ligne' },
    { to: '/history', label: 'History', tooltip: 'Historique de requêtes de session' },
    { to: '/about', label: 'About', tooltip: 'Architecture unifiée et sources de données' }
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Zone 1: Hamburger Menu Trigger + App Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Tooltip content="Ouvrir le menu catégorisé (Fonctionnalités & Paramètres)" position="bottom">
              <button
                onClick={() => setIsHamburgerOpen(true)}
                className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95 flex items-center justify-center focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                aria-label="Ouvrir le menu principal"
              >
                <Menu className="w-5 h-5 stroke-[2.2]" />
              </button>
            </Tooltip>

            <AppLogo />
          </div>

          {/* Zone 2: Navigation Links for Large Screens */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5" aria-label="Navigation principale">
            {navLinks.map((link) => (
              <Tooltip key={link.to} content={link.tooltip} position="bottom">
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    `px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                      isActive
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              </Tooltip>
            ))}
          </nav>

          {/* Zone 3: Actions & Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <OfflineIndicator />

            {/* Contextual Help Button */}
            <Tooltip content="Aide contextuelle & guide de la page active" position="bottom">
              <button
                onClick={() => setIsHelpOpen(true)}
                className="p-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                aria-label="Aide contextuelle"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </Tooltip>

            {/* System Settings & Updates Modal Trigger */}
            <Tooltip
              content={
                updateAvailable
                  ? 'Mise à jour disponible ! Ouvrir les paramètres'
                  : 'Paramètres système, mises à jour & cache'
              }
              position="bottom"
            >
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="relative p-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                aria-label="Paramètres système et mises à jour"
              >
                <Settings className={`w-4 h-4 ${isChecking ? 'animate-spin text-blue-500' : ''}`} />
                {updateAvailable && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
                )}
              </button>
            </Tooltip>

            {/* Theme Toggle (Light / Dark / System) */}
            <Tooltip
              content={`Thème actuel : ${theme === 'dark' ? 'Sombre' : theme === 'light' ? 'Clair' : 'Système'} (Cliquer pour changer)`}
              position="bottom"
            >
              <button
                onClick={toggleTheme}
                className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                aria-label="Basculer le thème"
              >
                {theme === 'dark' ? (
                  <Moon className="w-4 h-4 text-sky-400" />
                ) : theme === 'light' ? (
                  <Sun className="w-4 h-4 text-amber-500" />
                ) : (
                  <Laptop className="w-4 h-4" />
                )}
              </button>
            </Tooltip>

            {/* PWA Install Button */}
            <PWAInstallButton />
          </div>
        </div>
      </header>

      {/* Hamburger Drawer Menu */}
      <HamburgerMenu
        isOpen={isHamburgerOpen}
        onClose={() => setIsHamburgerOpen(false)}
        onOpenSystemSettings={() => setIsSettingsOpen(true)}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onOpenContextualHelp={() => setIsHelpOpen(true)}
      />

      {/* System Settings & Update Management Modal */}
      <SystemSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Interactive Onboarding Flow Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />

      {/* Contextual Help Modal */}
      <ContextualHelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </>
  );
};
