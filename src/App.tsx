import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';
import { UpdateNotificationToast } from './components/layout/UpdateNotificationToast';
import { OnboardingModal } from './components/common/OnboardingModal';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { ExplorerPage } from './pages/Explorer/ExplorerPage';
import { ComparePage } from './pages/Compare/ComparePage';
import { DatasetExplorerPage } from './pages/Datasets/DatasetExplorerPage';
import { FavoritesPage } from './pages/Favorites/FavoritesPage';
import { HistoryPage } from './pages/History/HistoryPage';
import { AboutPage } from './pages/About/AboutPage';

export default function App() {
  const [showAutoOnboarding, setShowAutoOnboarding] = useState(false);

  useEffect(() => {
    // Show onboarding modal on initial visit
    const hasSeenOnboarding = localStorage.getItem('ede_onboarding_completed');
    if (!hasSeenOnboarding) {
      const timer = setTimeout(() => {
        setShowAutoOnboarding(true);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
        <Header />

        <main className="flex-1 pb-16 lg:pb-8">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/explorer" element={<ExplorerPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/datasets" element={<DatasetExplorerPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <MobileNav />

        {/* Global Toast for background updates */}
        <UpdateNotificationToast />

        {/* Initial First-visit Onboarding */}
        <OnboardingModal
          isOpen={showAutoOnboarding}
          onClose={() => setShowAutoOnboarding(false)}
        />

        {/* Minimal Accessible Footer */}
        <footer className="hidden lg:block border-t border-slate-200 dark:border-slate-800/80 py-4 text-center text-xs text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-900/50">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
            <span className="font-medium">
              Economic Data Explorer · Plateforme Unifiée Eurostat &amp; FMI
            </span>
            <span className="text-[11px] font-mono">
              Données officielles normalisées · Cache local IndexedDB · PWA Ready
            </span>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
