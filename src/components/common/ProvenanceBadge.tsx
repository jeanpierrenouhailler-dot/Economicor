import React, { useState } from 'react';
import { Info, ExternalLink, ShieldCheck, Database, X } from 'lucide-react';
import { DataProvenance } from '../../models/Observation';

interface ProvenanceBadgeProps {
  provenance: DataProvenance;
  unit?: string;
  frequency?: string;
}

export const ProvenanceBadge: React.FC<ProvenanceBadgeProps> = ({
  provenance,
  unit,
  frequency
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const freqLabel =
    frequency === 'A' ? 'Annual (A)' :
    frequency === 'Q' ? 'Quarterly (Q)' :
    frequency === 'M' ? 'Monthly (M)' :
    frequency || 'Periodic';

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition font-medium"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
          <span>Source: <strong>{provenance.source}</strong></span>
          <Info className="w-3 h-3 text-slate-400 ml-0.5" />
        </button>

        {provenance.dataset && (
          <>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
            <span>Dataset: <code>{provenance.dataset}</code></span>
          </>
        )}

        {unit && (
          <>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
            <span>Unit: <strong>{unit}</strong></span>
          </>
        )}

        {frequency && (
          <>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
            <span>Freq: {freqLabel}</span>
          </>
        )}

        {provenance.cached && (
          <span className="text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-sm">
            Cached
          </span>
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-500" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Data Information & Provenance</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500">Institution:</span>
                <span className="col-span-2 font-medium text-slate-900 dark:text-slate-100">{provenance.source}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500">Dataset Code:</span>
                <span className="col-span-2 font-mono text-slate-900 dark:text-slate-100">{provenance.dataset}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500">Unit of Measure:</span>
                <span className="col-span-2 font-medium text-slate-900 dark:text-slate-100">{unit || 'Standard'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500">Frequency:</span>
                <span className="col-span-2 font-medium text-slate-900 dark:text-slate-100">{freqLabel}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500">Last Disseminated:</span>
                <span className="col-span-2 text-slate-900 dark:text-slate-100">{provenance.lastUpdated || 'Latest release'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500">Retrieved At:</span>
                <span className="col-span-2 text-slate-900 dark:text-slate-100">{new Date(provenance.retrievedAt).toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1.5">
                <span className="text-slate-500">Status:</span>
                <span className="col-span-2 text-slate-900 dark:text-slate-100">
                  {provenance.cached ? 'Stored in IndexedDB cache' : 'Live stream from official API'}
                </span>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
