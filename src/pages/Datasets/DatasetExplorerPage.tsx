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
  Compass
} from 'lucide-react';
import { CATALOG_DATASETS, Dataset } from '../../models/Dataset';
import { UNIFIED_INDICATORS } from '../../models/Indicator';

export const DatasetExplorerPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>(CATALOG_DATASETS[0].id);

  const activeDataset = CATALOG_DATASETS.find(d => d.id === selectedDatasetId) || CATALOG_DATASETS[0];
  const datasetIndicators = UNIFIED_INDICATORS.filter(i => i.dataset === activeDataset.code);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Metadata Catalog</span>
          <span aria-hidden="true">·</span>
          <span>SDMX 3.0 Data Structure Definitions</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
          Dataset Explorer
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
          Examine dimensions, code lists, frequency attributes, and dissemination parameters before executing queries.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Dataset List */}
        <div className="lg:col-span-4 space-y-2.5">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
            Registered Datasets ({CATALOG_DATASETS.length})
          </div>
          {CATALOG_DATASETS.map((ds) => {
            const isSelected = ds.id === activeDataset.id;
            return (
              <div
                key={ds.id}
                onClick={() => setSelectedDatasetId(ds.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-500/50 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-blue-600 dark:text-blue-400 uppercase text-[10px]">
                    {ds.source}
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
                  <span className="font-semibold uppercase text-blue-600 dark:text-blue-400">{activeDataset.source}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono">Code: {activeDataset.code}</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {activeDataset.name}
                </h2>
              </div>

              <button
                onClick={() => navigate(`/explorer?source=${activeDataset.source}&dataset=${activeDataset.code}`)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs active:scale-95 transition whitespace-nowrap self-start sm:self-auto"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Query in Explorer</span>
              </button>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {activeDataset.description}
            </p>

            {/* Quick Metadata Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] block">Dissemination</span>
                <strong className="text-slate-800 dark:text-slate-200 capitalize">{activeDataset.source} API</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Frequency</span>
                <strong className="text-slate-800 dark:text-slate-200">{activeDataset.frequency.join(', ')}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Last Updated</span>
                <strong className="text-slate-800 dark:text-slate-200">{activeDataset.lastUpdated || 'Current release'}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Documentation</span>
                {activeDataset.docUrl ? (
                  <a
                    href={activeDataset.docUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>Spec Sheet</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-slate-400">Standard</span>
                )}
              </div>
            </div>

            {/* Dimensions & Codelists */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <Layers className="w-4 h-4 text-blue-500" />
                <span>Structural Dimensions ({activeDataset.dimensions?.length || 0})</span>
              </div>

              {activeDataset.dimensions && activeDataset.dimensions.length > 0 ? (
                <div className="space-y-3">
                  {activeDataset.dimensions.map((dim) => (
                    <div
                      key={dim.id}
                      className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/30 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <code className="text-blue-600 dark:text-blue-400 font-mono text-xs font-semibold">
                            {dim.id}
                          </code>
                          <span className="text-slate-700 dark:text-slate-300 font-medium">
                            {dim.label}
                          </span>
                        </div>
                        {dim.defaultValue && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            Default: <strong>{dim.defaultValue}</strong>
                          </span>
                        )}
                      </div>

                      {/* Dimension values pills */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {dim.values.map(val => (
                          <span
                            key={val.id}
                            className="px-2 py-0.5 rounded text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono"
                          >
                            <strong>{val.id}</strong>: {val.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">No custom dimensions specified for this standard dataset.</p>
              )}
            </div>

            {/* Preconfigured Indicators */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                Direct Indicators in this Dataset
              </h4>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden text-xs">
                {datasetIndicators.map(ind => (
                  <div key={ind.id} className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">{ind.label}</div>
                      <div className="text-[11px] text-slate-500 font-mono">Native: {ind.nativeCode} · Unit: {ind.unit}</div>
                    </div>
                    <button
                      onClick={() => navigate(`/explorer?source=${ind.source}&dataset=${ind.dataset}&indicator=${ind.id}`)}
                      className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 text-xs font-medium"
                    >
                      <span>Explore</span>
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
