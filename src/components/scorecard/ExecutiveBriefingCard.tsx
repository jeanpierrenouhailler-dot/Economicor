import React, { useState } from 'react';
import { CountryScorecard } from '../../models/Scorecard';
import { ScorecardService } from '../../services/ScorecardService';
import { Copy, Check, Printer, TrendingUp, AlertCircle, Sparkles, Share2 } from 'lucide-react';

interface ExecutiveBriefingCardProps {
  scorecard: CountryScorecard;
  onCountryChange?: (countryCode: string) => void;
}

export const ExecutiveBriefingCard: React.FC<ExecutiveBriefingCardProps> = ({
  scorecard,
  onCountryChange
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = ScorecardService.formatExecutiveBriefing(scorecard);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const countries = ScorecardService.getSupportedCountries();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all">
      {/* Top Header Banner */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-blue-300 mb-1.5 uppercase tracking-wider">
            <span>Economic Intelligence Scorecard</span>
            <span>·</span>
            <span>Synthèse Macro Officielle</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-4xl" role="img" aria-label={scorecard.countryName}>
              {scorecard.flag}
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
                <span>{scorecard.countryName}</span>
                <span className="text-slate-400 font-normal text-base sm:text-lg">
                  — Situation économique
                </span>
              </h1>
              <div className="flex items-center gap-3 text-xs text-slate-300 mt-0.5">
                <span>Dernière mise à jour : {scorecard.lastUpdated}</span>
                <span>·</span>
                <span>Devise : {scorecard.currency}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls & Country Switcher */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Quick Country Switcher */}
          <div className="flex items-center bg-slate-800/90 rounded-xl p-1 border border-slate-700/80">
            {countries.map(c => (
              <button
                key={c.code}
                onClick={() => onCountryChange && onCountryChange(c.code)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                  scorecard.countryCode === c.code
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <span>{c.flag}</span>
                <span className="hidden sm:inline">{c.name}</span>
              </button>
            ))}
          </div>

          {/* Copy Briefing Button */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/10 transition active:scale-95"
            title="Copier la fiche de synthèse dans le presse-papier"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Copié !</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copier la fiche</span>
              </>
            )}
          </button>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition"
            title="Imprimer / Exporter en PDF"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Core 5 Headline KPIs (As explicitly requested by user) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
        {/* 1. Croissance */}
        <div className="p-4 sm:p-5">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Croissance
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
            {scorecard.headline.growth}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>PIB réel en volume</span>
          </div>
        </div>

        {/* 2. Inflation */}
        <div className="p-4 sm:p-5">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Inflation
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400 font-mono tabular-nums">
            {scorecard.headline.inflation}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
            IPC / Glissement annuel
          </div>
        </div>

        {/* 3. Chômage */}
        <div className="p-4 sm:p-5">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Chômage
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
            {scorecard.headline.unemployment}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
            Taux au sens du BIT
          </div>
        </div>

        {/* 4. Dette */}
        <div className="p-4 sm:p-5">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Dette
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400 font-mono tabular-nums">
            {scorecard.headline.debt}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
            Dette brute Maastricht
          </div>
        </div>

        {/* 5. Taux Central */}
        <div className="p-4 sm:p-5 col-span-2 sm:col-span-1">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            {scorecard.headline.centralBankName}
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-purple-600 dark:text-purple-400 font-mono tabular-nums">
            {scorecard.headline.centralBankRate}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
            Taux directeur souverain
          </div>
        </div>
      </div>

      {/* Analytical Synthesis Briefing */}
      <div className="p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Diagnostic de conjoncture synthétique</span>
            </span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl">
            {scorecard.executiveSummary}
          </p>
        </div>

        {/* Scorecard Macro Health Index */}
        <div className="shrink-0 flex items-center gap-3.5 bg-slate-100 dark:bg-slate-800/60 px-4 py-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
              Indice de Résilience
            </div>
            <div className="text-xs font-semibold text-slate-900 dark:text-white">
              Macro Health Score
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="text-2xl font-black font-mono tabular-nums text-blue-600 dark:text-blue-400">
              {scorecard.overallScore}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">/100</div>
          </div>
        </div>
      </div>
    </div>
  );
};
