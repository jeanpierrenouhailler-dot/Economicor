import React from 'react';
import {
  ShieldCheck,
  Cpu,
  Database,
  Layers,
  Globe2,
  ExternalLink,
  Code2,
  CheckCircle2,
  WifiOff
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Documentation & Architecture</span>
          <span aria-hidden="true">·</span>
          <span>Version 1.0 PWA</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
          About Economic Data Explorer
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
          A unified, installable Progressive Web Application designed for macroeconomic intelligence, integrating multiple statistical institutions into an interoperable data model.
        </p>
      </div>

      {/* Core Architectural Diagram Card */}
      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          <Layers className="w-4 h-4 text-blue-500" />
          <span>Layered Decoupled Architecture</span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          React UI components never communicate directly with upstream Eurostat or IMF proprietary endpoints. Every interaction is routed through the Query Engine and mapped onto the Unified Data Model:
        </p>

        {/* Visual pipeline */}
        <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 font-mono text-xs text-slate-800 dark:text-slate-200 space-y-2 border border-slate-200 dark:border-slate-700/60">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold">
            <span>[1] User Interface</span>
            <span>(Dashboard, Explorer, Compare, Visualizations)</span>
          </div>
          <div className="pl-4 text-slate-400">↓ DataQuery (source, dataset, indicator, countries, period)</div>
          <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-semibold">
            <span>[2] Query Engine & Cache</span>
            <span>(IndexedDB Service + History Logger)</span>
          </div>
          <div className="pl-4 text-slate-400">↓ NormalizationService (ISO Country mapping, Units, Frequencies)</div>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
            <span>[3] Unified Data Model</span>
            <span>(EconomicObservation[], DataProvenance)</span>
          </div>
          <div className="pl-4 text-slate-400">↓ DataProvider Interface (polymorphic providers)</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 pl-4">
            <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              <span className="text-blue-500 font-bold block">EurostatProvider</span>
              <span className="text-[10px] text-slate-400">SDMX 3.0 / Statistics 1.0 JSON-stat</span>
            </div>
            <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              <span className="text-amber-500 font-bold block">IMFProvider</span>
              <span className="text-[10px] text-slate-400">DataMapper API v2 / SDMX CompactData</span>
            </div>
          </div>
        </div>
      </div>

      {/* Extensibility Guide: Adding New Providers */}
      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          <Code2 className="w-4 h-4 text-emerald-500" />
          <span>Extensibility — Adding New Providers (World Bank, OECD, ECB)</span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Any developer can introduce a new provider (e.g. World Bank, OECD, BIS, ECB) simply by implementing the standard <code>DataProvider</code> interface without altering a single UI component:
        </p>

        <pre className="p-4 rounded-lg bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
{`interface DataProvider {
  id: string;
  name: string;
  getDatasets(): Promise<Dataset[]>;
  getIndicators(dataset?: string): Promise<Indicator[]>;
  getCountries(): Promise<Country[]>;
  getMetadata(dataset: string): Promise<DatasetMetadata>;
  query(request: DataQuery): Promise<EconomicObservation[]>;
}

// In src/services/QueryService.ts:
queryService.registerProvider(new WorldBankProvider());`}
        </pre>
      </div>

      {/* Supported Official APIs & Endpoints */}
      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          <Globe2 className="w-4 h-4 text-sky-500" />
          <span>Official Public Dissemination Endpoints</span>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-white">
              <span>Eurostat Statistics 1.0 JSON-stat</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">CORS: Enabled</span>
            </div>
            <code className="text-[11px] text-slate-500 font-mono block break-all">
              https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/&#123;dataset&#125;
            </code>
            <p className="text-[11px] text-slate-400">
              High-speed filtered queries for House Price Index (<code>prc_hpi_q</code>) and HICP Consumer Inflation (<code>prc_hicp_midx</code>).
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-white">
              <span>Eurostat SDMX 3.0 API</span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono">Structure & Dataflows</span>
            </div>
            <code className="text-[11px] text-slate-500 font-mono block break-all">
              https://ec.europa.eu/eurostat/api/dissemination/sdmx/3.0/structure/dataflow/ESTAT/*/*/~
            </code>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-white">
              <span>IMF DataMapper API v2</span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">World Economic Outlook</span>
            </div>
            <code className="text-[11px] text-slate-500 font-mono block break-all">
              https://www.imf.org/external/datamapper/api/v2/&#123;indicator&#125;
            </code>
            <p className="text-[11px] text-slate-400">
              Macroeconomic indicators: Real GDP Growth (<code>NGDP_RPCH</code>), Inflation (<code>PCPIPCH</code>), Public Debt (<code>GGXWDG_NGDP</code>), Unemployment (<code>LUR</code>).
            </p>
          </div>
        </div>
      </div>

      {/* PWA & IndexedDB Offline Features */}
      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          <WifiOff className="w-4 h-4 text-amber-500" />
          <span>Progressive Web App (PWA) & Offline Reliability</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 space-y-1">
            <strong className="text-slate-900 dark:text-white block">IndexedDB Persistence</strong>
            <p className="text-slate-500 leading-relaxed">
              Every query is cached in IndexedDB with category-specific TTLs (metadata: 7 days, observations: 4 hours).
            </p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 space-y-1">
            <strong className="text-slate-900 dark:text-white block">Service Worker & Precaching</strong>
            <p className="text-slate-500 leading-relaxed">
              Managed via Workbox through <code>vite-plugin-pwa</code>. Assets, scripts, fonts, and cached data load instantly even without network.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
