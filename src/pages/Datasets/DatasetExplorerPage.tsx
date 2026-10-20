import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Database,
  ExternalLink,
  Layers,
  ArrowRight,
  Filter,
  CheckCircle2,
  Calendar,
  Compass,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { CATALOG_DATASETS, Dataset } from '../../models/Dataset';
import { UNIFIED_INDICATORS } from '../../models/Indicator';
import { SOURCE_METADATA } from '../../services/SourceRouter';

export const DatasetExplorerPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedSourceFilter, setSelectedSourceFilter] = useState<string>('all');
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>(CATALOG_DATASETS[0].id);

  const filteredDatasets = CATALOG_DATASETS.filter(
    d => selectedSourceFilter === 'all' || d.source === selectedSourceFilter
  );

  const activeDataset = filteredDatasets.find(d => d.id === selectedDatasetId) || filteredDatasets[0] || CATALOG_DATASETS[0];
  const datasetIndicators = UNIFIED_INDICATORS.filter(i => i.dataset === activeDataset.code);
  const sourceMeta = SOURCE_METADATA[activeDataset.source] || { name: activeDataset.source.toUpperCase(), badge: activeDataset.source.toUpperCase(), flag: '🏛️', specialty: '' };

  const sourceKeys = Object.keys(SOURCE_METADATA);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Metadata Catalog</span>
          <span aria-hidden="true">·</span>
          <span>12 Sources Officielles Connectées</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono">SDMX 3.0 & REST APIs</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
          Catalogue des Sources & Datasets
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
          Explorez les 12 institutions statistiques intégrées à Economicor : Eurostat, FMI, Banque Mondiale, FRED, INSEE, BCE, BLS, OCDE, ONU, BRI, EIA et FAO.
        </p>
      </div>

      {/* Source Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedSourceFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
            selectedSourceFilter === 'all'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          Toutes les sources ({CATALOG_DATASETS.length})
        </button>

        {sourceKeys.map(srcKey => {
          const meta = SOURCE_METADATA[srcKey];
          const isSelected = selectedSourceFilter === srcKey;
          const count = CATALOG_DATASETS.filter(d => d.source === srcKey).length;

          return (
            <button
              key={srcKey}
              onClick={() => setSelectedSourceFilter(srcKey)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <span>{meta.flag}</span>
              <span>{meta.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Dataset List */}
        <div className="lg:col-span-4 space-y-2.5">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
            Jeux de données ({filteredDatasets.length})
          </div>
          {filteredDatasets.map((ds) => {
            const isSelected = ds.id === activeDataset.id;
            const dsMeta = SOURCE_METADATA[ds.source];

            return (
              <div
                key={ds.id}
                onClick={() => setSelectedDatasetId(ds.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-500/60 shadow-xs ring-1 ring-blue-500/20'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-blue-600 dark:text-blue-400 text-[10px] flex items-center gap-1">
                    <span>{dsMeta?.flag}</span>
                    <span>{dsMeta?.name || ds.source.toUpperCase()}</span>
                  </span>
                  <span className="font-mono text-slate-400 text-[10px]">
                    {ds.code}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  {ds.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {ds.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Right Column: Active Dataset Detailed Inspector */}
        <div className="lg:col-span-8 space-y-6">
          <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            {/* Title & Quick Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                    <span>{sourceMeta.flag}</span>
                    <span>{sourceMeta.name}</span>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono">Code: {activeDataset.code}</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {activeDataset.name}
                </h2>
              </div>

              <button
                onClick={() => navigate(`/explorer?source=${activeDataset.source}&dataset=${activeDataset.code}`)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs active:scale-95 transition whitespace-nowrap self-start sm:self-auto cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Interroger dans l'Explorateur</span>
              </button>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {activeDataset.description}
            </p>

            {/* Institution Specialty Callout */}
            {sourceMeta.specialty && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-300">
                <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span><strong>Rôle institutionnel : </strong>{sourceMeta.specialty}</span>
              </div>
            )}

            {/* Quick Metadata Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] block">Fournisseur</span>
                <strong className="text-slate-800 dark:text-slate-200 capitalize">{sourceMeta.name}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Périodicité</span>
                <strong className="text-slate-800 dark:text-slate-200">{activeDataset.frequency.join(', ')}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Dernière mise à jour</span>
                <strong className="text-slate-800 dark:text-slate-200">{activeDataset.lastUpdated || 'Révision continue'}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Documentation officielle</span>
                {activeDataset.docUrl ? (
                  <a
                    href={activeDataset.docUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>Fiche technique</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-slate-400">Diffusion publique</span>
                )}
              </div>
            </div>

            {/* Preconfigured Indicators */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                Séries et indicateurs associés ({datasetIndicators.length})
              </h4>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden text-xs">
                {datasetIndicators.map(ind => (
                  <div key={ind.id} className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {ind.labelFr || ind.label}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        Code natif : {ind.nativeCode} · Unité : {ind.unit}
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/explorer?source=${ind.source}&dataset=${ind.dataset}&indicator=${ind.id}`)}
                      className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 text-xs font-medium cursor-pointer"
                    >
                      <span>Explorer</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
