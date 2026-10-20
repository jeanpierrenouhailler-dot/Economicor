import React, { useState } from 'react';
import { EconomicAnomaly, AIAnomalyExplanation } from '../../models/Anomaly';
import { AnomalyDetectionService } from '../../services/AnomalyDetectionService';
import { Link } from 'react-router-dom';
import {
  Bell,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Loader2,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';

interface AnomalyCardProps {
  anomaly: EconomicAnomaly;
}

export const AnomalyCard: React.FC<AnomalyCardProps> = ({ anomaly }) => {
  const [explanation, setExplanation] = useState<AIAnomalyExplanation | undefined>(
    anomaly.aiExplanation
  );
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleExplain = async () => {
    if (explanation || loading) return;
    setLoading(true);
    setExpanded(true);
    try {
      const expl = await AnomalyDetectionService.explainAnomalyWithAI(anomaly);
      setExplanation(expl);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const isRecord = anomaly.type === 'historical_record';
  const isHigh = anomaly.severity === 'high';

  let badgeBorder = 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300';
  if (isHigh && !isRecord) {
    badgeBorder = 'border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300';
  } else if (isRecord) {
    badgeBorder = 'border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300';
  }

  const explorerUrl = `/explorer?indicator=${encodeURIComponent(anomaly.indicatorId)}&countries=${encodeURIComponent(anomaly.countryCode)}`;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden hover:border-blue-400 dark:hover:border-blue-500 transition-all p-5 flex flex-col justify-between space-y-4">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${badgeBorder}`}>
            {anomaly.badge}
          </span>

          <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
            {anomaly.sourceBadge}
          </span>
        </div>

        {/* Country & Indicator Info */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
          <span className="text-base">{anomaly.countryFlag}</span>
          <span className="font-bold text-slate-900 dark:text-white">
            {anomaly.countryLabel}
          </span>
          <span>·</span>
          <span>{anomaly.indicatorLabel}</span>
          <span>·</span>
          <span className="font-mono">{anomaly.period}</span>
        </div>

        {/* Headline */}
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight mt-2 leading-snug">
          {anomaly.headline}
        </h3>

        {/* Statistical Detail Highlight */}
        <div className="mt-2 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
          <span>{anomaly.statisticalDetail}</span>
          <span className="text-blue-600 dark:text-blue-400">
            {anomaly.zScore > 0 ? '+' : ''}{anomaly.zScore.toFixed(1)}σ
          </span>
        </div>

        {anomaly.historicalContext && (
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
            {anomaly.historicalContext}
          </p>
        )}
      </div>

      {/* AI Explanation Area */}
      <div>
        {explanation && expanded && (
          <div className="p-3.5 mb-3 rounded-xl bg-slate-950 text-slate-100 border border-slate-800 space-y-2.5 text-xs animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span className="font-bold text-blue-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Explication IA Économiste
              </span>
              <span className="font-mono text-[10px] text-slate-400">
                Horizon : {explanation.persistenceOutlook}
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              {explanation.summary}
            </p>
            <div>
              <span className="font-semibold text-slate-400 block mb-1">Causes probables :</span>
              <ul className="space-y-0.5 text-slate-300">
                {explanation.likelyCauses.map((c, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-blue-400">•</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Card Footer Actions */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          {!explanation ? (
            <button
              onClick={handleExplain}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Analyse...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3" />
                  <span>Expliquer l'anomalie</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 py-1"
            >
              <span>{expanded ? 'Masquer explication' : 'Voir explication'}</span>
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}

          <Link
            to={explorerUrl}
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            <span>Explorer la série</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};
