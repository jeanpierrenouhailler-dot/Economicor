import React, { useState, useMemo } from 'react';
import { Download, ArrowUpDown, Search, FileSpreadsheet, FileJson, Check } from 'lucide-react';
import { EconomicObservation } from '../../models/Observation';
import { COUNTRIES } from '../../models/Country';

interface ObservationTableProps {
  observations: EconomicObservation[];
  unit?: string;
  sourceName?: string;
}

type SortField = 'country' | 'period' | 'value' | 'status';
type SortOrder = 'asc' | 'desc';

export const ObservationTable: React.FC<ObservationTableProps> = ({
  observations,
  unit,
  sourceName = 'Economic Intelligence'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('period');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [page, setPage] = useState(1);
  const [copied, setCopied] = useState(false);
  const pageSize = 15;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filter and sort observations
  const filteredSorted = useMemo(() => {
    let result = observations;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        o =>
          o.countryLabel.toLowerCase().includes(q) ||
          o.country.toLowerCase().includes(q) ||
          o.period.toLowerCase().includes(q) ||
          String(o.value).includes(q)
      );
    }

    return [...result].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'country') {
        cmp = a.countryLabel.localeCompare(b.countryLabel);
      } else if (sortField === 'period') {
        cmp = (a.periodDate || a.period).localeCompare(b.periodDate || b.period);
      } else if (sortField === 'value') {
        const valA = a.value ?? -Infinity;
        const valB = b.value ?? -Infinity;
        cmp = valA - valB;
      } else if (sortField === 'status') {
        cmp = (a.status || '').localeCompare(b.status || '');
      }

      return sortOrder === 'asc' ? cmp : -cmp;
    });
  }, [observations, searchTerm, sortField, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / pageSize));
  const currentPageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredSorted.slice(start, start + pageSize);
  }, [filteredSorted, page, pageSize]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Source', 'Dataset', 'Indicator', 'CountryCode', 'Country', 'Period', 'Value', 'Unit', 'Status'];
    const rows = filteredSorted.map(o => [
      `"${o.source}"`,
      `"${o.dataset}"`,
      `"${o.indicatorLabel.replace(/"/g, '""')}"`,
      `"${o.country}"`,
      `"${o.countryLabel}"`,
      `"${o.period}"`,
      o.value !== null ? o.value : '',
      `"${o.unit}"`,
      `"${o.status || 'normal'}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `economic_data_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to JSON
  const handleExportJSON = () => {
    const jsonString = JSON.stringify(filteredSorted, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `economic_data_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy share summary
  const handleCopySummary = async () => {
    try {
      const summary = filteredSorted
        .slice(0, 10)
        .map(o => `${o.countryLabel} (${o.period}): ${o.value ?? '—'} ${o.unit}`)
        .join('\n');
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
      {/* Table Toolbar */}
      <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            placeholder="Search country, period, or value..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition"
            title="Export CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">CSV</span>
          </button>
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition"
            title="Export JSON"
          >
            <FileJson className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="hidden sm:inline">JSON</span>
          </button>
          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition"
            title="Copy top 10 values to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Download className="w-3.5 h-3.5 text-slate-500" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Grid Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 bg-slate-100/40 dark:bg-slate-800/40">
              <th
                onClick={() => handleSort('country')}
                className="py-2.5 px-4 font-semibold cursor-pointer hover:text-slate-900 dark:hover:text-white transition select-none"
              >
                <div className="flex items-center gap-1">
                  <span>Country</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('period')}
                className="py-2.5 px-4 font-semibold cursor-pointer hover:text-slate-900 dark:hover:text-white transition select-none"
              >
                <div className="flex items-center gap-1">
                  <span>Period</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('value')}
                className="py-2.5 px-4 font-semibold text-right cursor-pointer hover:text-slate-900 dark:hover:text-white transition select-none"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Value</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-2.5 px-4 font-semibold text-slate-400">Unit</th>
              <th
                onClick={() => handleSort('status')}
                className="py-2.5 px-4 font-semibold cursor-pointer hover:text-slate-900 dark:hover:text-white transition select-none"
              >
                <div className="flex items-center gap-1">
                  <span>Status</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-[11px] tabular-nums">
            {currentPageItems.length > 0 ? (
              currentPageItems.map((obs, idx) => {
                const countryObj = COUNTRIES.find(c => c.code === obs.country);
                const isNegative = obs.value !== null && obs.value < 0;

                return (
                  <tr
                    key={`${obs.country}_${obs.period}_${idx}`}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-2.5 px-4 font-sans font-medium text-slate-900 dark:text-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{countryObj?.flag || '🌐'}</span>
                        <span>{obs.countryLabel}</span>
                        <span className="text-slate-400 text-[10px] font-mono">({obs.country})</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-slate-700 dark:text-slate-300 font-semibold">
                      {obs.period}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      {obs.value !== null ? (
                        <span className={`font-semibold ${isNegative ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
                          {obs.value > 0 && obs.unit === '%' ? `+${obs.value}` : obs.value}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-sans italic">Not available</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-slate-500 dark:text-slate-400">
                      {obs.unit || unit || '—'}
                    </td>
                    <td className="py-2.5 px-4 font-sans">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        {obs.status || 'verified'}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="py-8 text-center text-xs text-slate-400 font-sans">
                  No matching observations found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination & Count */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div>
          Showing <strong>{filteredSorted.length > 0 ? (page - 1) * pageSize + 1 : 0}</strong>–
          <strong>{Math.min(page * pageSize, filteredSorted.length)}</strong> of{' '}
          <strong>{filteredSorted.length}</strong> records ({sourceName})
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-2.5 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Prev
            </button>
            <span className="font-mono text-slate-700 dark:text-slate-300">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-2.5 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
