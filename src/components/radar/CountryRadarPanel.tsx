import React from 'react';
import { RadarCountry, RadarIndicatorCategory } from '../../models/Radar';
import { RadarIndicatorCard } from './RadarIndicatorCard';
import { RadarService } from '../../services/RadarService';
import { ShieldCheck, Calendar, ArrowRight, Share2, Copy, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CountryRadarPanelProps {
  country: RadarCountry;
}

export const CountryRadarPanel: React.FC<CountryRadarPanelProps> = ({ country }) => {
  const [copied, setCopied] = React.useState(false);
  const categories = RadarService.getCategories();

  const handleCopySummary = () => {
    const text = [
      `${country.flag} ${country.nameFr.toUpperCase()} — ECONOMIC RADAR`,
      ``,
      `Croissance       ${country.metrics.Croissance.symbol} (${country.metrics.Croissance.formattedValue})`,
      `Inflation        ${country.metrics.Inflation.symbol} (${country.metrics.Inflation.formattedValue})`,
      `Chômage          ${country.metrics.Chômage.symbol} (${country.metrics.Chômage.formattedValue})`,
      `Dette            ${country.metrics.Dette.symbol} (${country.metrics.Dette.formattedValue})`,
      `Immobilier       ${country.metrics.Immobilier.symbol} (${country.metrics.Immobilier.formattedValue})`,
      `Industrie        ${country.metrics.Industrie.symbol} (${country.metrics.Industrie.formattedValue})`,
      `Exportations     ${country.metrics.Exportations.symbol} (${country.metrics.Exportations.formattedValue})`,
      ``,
      `Régime : ${country.currentRegime}`,
      `Dernière mise à jour : ${country.lastUpdated}`,
      `Source : Economicor Radar (INSEE / Eurostat / BLS / FMI)`
    ].join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Country Header Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
            <span>Diagnostic Trajectoire Pays</span>
            <span>·</span>
            <span>{country.continent}</span>
            <span>·</span>
            <span>Poids PIB mondial : {country.gdpSharePercent}%</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-4xl" role="img" aria-label={country.nameFr}>
              {country.flag}
            </span>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>{country.nameFr.toUpperCase()}</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60">
                  {country.regimeBadge}
                </span>
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {country.currentRegime}
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition active:scale-95 cursor-pointer"
            title="Copier les trajectoires du radar dans le presse-papier"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Copié !</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copier le Radar</span>
              </>
            )}
          </button>

          <Link
            to={`/scorecard?country=${country.code}`}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition active:scale-95"
          >
            <span>Fiche Scorecard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Transparent Methodology Guarantee Banner */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <span className="font-bold text-slate-900 dark:text-white">
            Garantie de Transparence Méthodologique :{' '}
          </span>
          Aucun score synthétique opaque ("73/100"). Chaque trajectoire découle directement des données de la comptabilité nationale et des séries officielles réelles avec leur méthodologie détaillée vérifiable.
        </div>
      </div>

      {/* The 7 Core Radar Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map(cat => {
          const metric = country.metrics[cat];
          return (
            <RadarIndicatorCard
              key={cat}
              metric={metric}
              countryCode={country.code}
            />
          );
        })}
      </div>
    </div>
  );
};
