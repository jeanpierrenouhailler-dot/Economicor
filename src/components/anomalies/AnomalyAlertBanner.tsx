import React, { useState } from 'react';
import { EconomicAnomaly, AIAnomalyExplanation } from '../../models/Anomaly';
import { AnomalyDetectionService } from '../../services/AnomalyDetectionService';
import {
  Bell,
  Sparkles,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Activity,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

interface AnomalyAlertBannerProps {
  anomalies: EconomicAnomaly[];
  className?: string;
}

export const AnomalyAlertBanner: React.FC<AnomalyAlertBannerProps> = ({
  anomalies,
  className = ''
}) => {
  const [explanations, setExplanations] = useState<Record<string, AIAnomalyExplanation>>({});
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({
    [anomalies[0]?.id]: true
  });

  if (!anomalies || anomalies.length === 0) return null;

  const toggleExpand = (id: string) => {
    setExpandedMap(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleExplainWithAI = async (anomaly: EconomicAnomaly) => {
    if (explanations[anomaly.id] || loadingMap[anomaly.id]) return;

    setLoadingMap(prev => ({ ...prev, [anomaly.id]: true }));
    setExpandedMap(prev => ({ ...prev, [anomaly.id]: true }));

    try {
      const expl = await AnomalyDetectionService.explainAnomalyWithAI(anomaly);
      setExplanations(prev => ({ ...prev, [anomaly.id]: expl }));
    } catch (e) {
      console.error('Failed to get AI explanation:', e);
    } finally {
      setLoadingMap(prev => ({ ...prev, [anomaly.id]: false }));
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {anomalies.map(anomaly => {
        const isHigh = anomaly.severity === 'high';
        const isRecord = anomaly.type === 'historical_record';
        const expl = explanations[anomaly.id] || anomaly.aiExplanation;
        const isLoading = loadingMap[anomaly.id];
        const isExpanded = expandedMap[anomaly.id];

        // Border and background styling
        let borderClass = 'border-amber-300 dark:border-amber-700/70';
        let bgClass = 'bg-linear-to-r from-amber-500/10 via-amber-500/5 to-transparent';
        let badgeBg = 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border-amber-300';
        let iconColor = 'text-amber-600 dark:text-amber-400';

        if (isHigh && !isRecord) {
          borderClass = 'border-rose-300 dark:border-rose-700/70';
          bgClass = 'bg-linear-to-r from-rose-500/10 via-rose-500/5 to-transparent';
          badgeBg = 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300 border-rose-300';
          iconColor = 'text-rose-600 dark:text-rose-400';
        } else if (isRecord) {
          borderClass = 'border-indigo-300 dark:border-indigo-700/70';
          bgClass = 'bg-linear-to-r from-indigo-500/10 via-indigo-500/5 to-transparent';
          badgeBg = 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 border-indigo-300';
          iconColor = 'text-indigo-600 dark:text-indigo-400';
        }

        return (
          <div
            key={anomaly.id}
            className={`rounded-2xl border ${borderClass} ${bgClass} bg-white dark:bg-slate-900 shadow-xs overflow-hidden transition-all duration-200`}
          >
            {/* Top Alert Header */}
            <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${badgeBg}`}
                >
                  <Bell className="w-4 h-4 animate-bounce" />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${badgeBg}`}
                    >
                      {anomaly.badge}
                    </span>

                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                      {anomaly.countryFlag} {anomaly.countryLabel} · {anomaly.period}
                    </span>

                    <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300">
                      {anomaly.statisticalDetail}
                    </span>
                  </div>

                  <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-snug">
                    {anomaly.headline}
                  </h4>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-start sm:self-center shrink-0 ml-12 sm:ml-0">
                {!expl && (
                  <button
                    onClick={() => handleExplainWithAI(anomaly)}
                    disabled={isLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs active:scale-95 transition disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Analyse IA en cours...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Expliquer avec l'IA</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={() => toggleExpand(anomaly.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title={isExpanded ? 'Réduire' : 'Déplier'}
                >
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Expandable Body: Statistical Proof + AI Explanation */}
            {isExpanded && (
              <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-1 border-t border-slate-100 dark:border-slate-800/80 space-y-3.5">
                {/* Statistical Details Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs font-mono">
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Z-Score</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {anomaly.zScore > 0 ? '+' : ''}
                      {anomaly.zScore.toFixed(1)}σ
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Valeur Observée</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {anomaly.formattedCurrentValue}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Variation</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {anomaly.formattedDelta || 'N/A'}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Source</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {anomaly.sourceBadge}
                    </span>
                  </div>
                </div>

                {/* AI Explanation Box */}
                {expl && (
                  <div className="p-4 rounded-xl bg-slate-900 text-slate-100 border border-slate-800 shadow-md space-y-3 animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Diagnostic Macroéconomique (Gemini 3.8 Flash)</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        Horizon : {expl.persistenceOutlook.toUpperCase()} · Confiance : {expl.confidence}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                      {expl.summary}
                    </p>

                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Causes directes identifiées :
                      </span>
                      <ul className="space-y-1 text-xs text-slate-300">
                        {expl.likelyCauses.map((cause, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-blue-400 font-bold shrink-0">•</span>
                            <span>{cause}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-300">
                      <span className="font-semibold text-slate-200">Implications politiques &amp; marché : </span>
                      <span>{expl.macroImplications}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
