import React from 'react';
import { UNIFIED_INDICATORS, Indicator } from '../../models/Indicator';
import { CATALOG_DATASETS } from '../../models/Dataset';

interface IndicatorSelectorProps {
  selectedSource: string;
  selectedDataset: string;
  selectedIndicator: string;
  onSourceChange: (source: string) => void;
  onDatasetChange: (dataset: string) => void;
  onIndicatorChange: (indicatorId: string) => void;
}

export const IndicatorSelector: React.FC<IndicatorSelectorProps> = ({
  selectedSource,
  selectedDataset,
  selectedIndicator,
  onSourceChange,
  onDatasetChange,
  onIndicatorChange
}) => {
  // Available datasets based on source
  const availableDatasets = CATALOG_DATASETS.filter(
    d => selectedSource === 'all' || d.source === selectedSource
  );

  // Available indicators based on dataset and source
  const availableIndicators = UNIFIED_INDICATORS.filter(ind => {
    if (selectedSource !== 'all' && ind.source !== selectedSource) return false;
    if (selectedDataset && ind.dataset !== selectedDataset) return false;
    return true;
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {/* 1. Source */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Source
        </label>
        <select
          value={selectedSource}
          onChange={e => {
            const newSource = e.target.value;
            onSourceChange(newSource);
            // Auto pick matching dataset & indicator
            const firstDs = CATALOG_DATASETS.find(d => newSource === 'all' || newSource === 'auto' || d.source === newSource);
            if (firstDs) {
              onDatasetChange(firstDs.code);
              const firstInd = UNIFIED_INDICATORS.find(i => i.dataset === firstDs.code);
              if (firstInd) onIndicatorChange(firstInd.id);
            }
          }}
          className="w-full text-xs py-2 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:ring-1 focus:ring-blue-500"
        >
          <option value="auto">🤖 Auto (Meilleure source recommandée)</option>
          <option value="all">🌐 Toutes les sources (Catalogue complet)</option>
          <option value="eurostat">🇪🇺 Eurostat (Europe)</option>
          <option value="imf">🌍 IMF / FMI (Macro mondiale)</option>
          <option value="worldbank">🏦 Banque Mondiale (Développement & PIB)</option>
          <option value="fred">🇺🇸 FRED (Fed St. Louis, séries financières)</option>
          <option value="insee">🇫🇷 INSEE (France haute précision)</option>
          <option value="ecb">🏦 ECB / BCE (Taux, crédit, monnaie)</option>
          <option value="bls">🇺🇸 BLS (Emploi & inflation US)</option>
          <option value="oecd">🏛️ OECD / OCDE (Comparaisons internationales)</option>
          <option value="undata">🌐 UN Data (Démographie & IDH)</option>
          <option value="bis">🏦 BIS / BRI (Banque, crédit, dette)</option>
          <option value="eia">🛢️ EIA (Énergie, pétrole, gaz)</option>
          <option value="fao">🌾 FAO (Agriculture & alimentation)</option>
        </select>
      </div>

      {/* 2. Dataset */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Dataset
        </label>
        <select
          value={selectedDataset}
          onChange={e => {
            const newDs = e.target.value;
            onDatasetChange(newDs);
            const firstInd = UNIFIED_INDICATORS.find(i => i.dataset === newDs);
            if (firstInd) onIndicatorChange(firstInd.id);
          }}
          className="w-full text-xs py-2 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:ring-1 focus:ring-blue-500"
        >
          {availableDatasets.map(ds => (
            <option key={ds.id} value={ds.code}>
              {ds.name} ({ds.code})
            </option>
          ))}
        </select>
      </div>

      {/* 3. Indicator */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Indicator
        </label>
        <select
          value={selectedIndicator}
          onChange={e => onIndicatorChange(e.target.value)}
          className="w-full text-xs py-2 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:ring-1 focus:ring-blue-500"
        >
          {availableIndicators.map(ind => (
            <option key={ind.id} value={ind.id}>
              {ind.labelFr || ind.label} [{ind.unit}] ({ind.source.toUpperCase()})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
