import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { History as HistoryIcon, ArrowRight, Trash2, Clock, CheckCircle2 } from 'lucide-react';
import { HistoryService, HistoryItem } from '../../services/HistoryService';
import { EmptyState } from '../../components/common/EmptyState';

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    setHistoryItems(HistoryService.getHistory());
  }, []);

  const handleClear = () => {
    HistoryService.clear();
    setHistoryItems([]);
  };

  const handleRerun = (item: HistoryItem) => {
    const q = item.query;
    const countriesStr = (q.countries || []).join(',');
    navigate(
      `/explorer?source=${q.source || 'all'}&dataset=${q.dataset || ''}&indicator=${q.indicator || ''}&countries=${countriesStr}&from=${q.startPeriod || '2018'}&to=${q.endPeriod || '2026'}`
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Audit Trail</span>
            <span aria-hidden="true">·</span>
            <span>Local Session Query Log</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Query History
          </h1>
        </div>

        {historyItems.length > 0 && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {historyItems.length === 0 ? (
        <EmptyState
          icon={HistoryIcon}
          title="No queries logged in this session"
          description="Every search and query executed in Explorer will automatically appear here so you can rerun it instantly."
          actionLabel="Execute a Query"
          onAction={() => navigate('/explorer')}
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs divide-y divide-slate-100 dark:divide-slate-800">
          {historyItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleRerun(item)}
              className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition cursor-pointer"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    ({item.resultsCount} pts)
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <span>{item.subtitle}</span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1 font-mono text-[10px]">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  <span>Rerun</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
