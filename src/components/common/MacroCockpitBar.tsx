import React from 'react';
import {
  TrendingUp,
  Activity,
  Users,
  Landmark,
  Percent,
  Building2,
  Flame,
  Wheat,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import {
  EconomicConceptId,
  ECONOMIC_CONCEPTS,
  MACRO_HEXAGON_CONCEPTS,
  SourceRouter,
  SOURCE_METADATA
} from '../../services/SourceRouter';
import { Tooltip } from './Tooltip';

interface MacroCockpitBarProps {
  currentCountry: string;
  activeConcept?: EconomicConceptId | null;
  onSelectConcept: (conceptId: EconomicConceptId, resolved: ReturnType<typeof SourceRouter.resolveBestSource>) => void;
  onSelectCockpitHexagon?: () => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  TrendingUp,
  Activity,
  Users,
  Landmark,
  Percent,
  Building2,
  Flame,
  Wheat
};

export const MacroCockpitBar: React.FC<MacroCockpitBarProps> = ({
  currentCountry,
  activeConcept,
  onSelectConcept,
  onSelectCockpitHexagon
}) => {
  return (
    <div className="rounded-xl border border-blue-500/20 bg-linear-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 p-4 shadow-xs space-y-3">
      {/* Title & One-click Cockpit Hexagon Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-blue-500/10 dark:border-blue-500/20">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                Moteur de Routage Intelligent Economicor
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                12 Sources Intégrées
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sélectionnez un concept économique : Economicor résout automatiquement la meilleure source officielle pour <strong>{currentCountry}</strong>.
            </p>
          </div>
        </div>

        {onSelectCockpitHexagon && (
          <Tooltip content="Activer l'ensemble des 6 piliers macroéconomiques simultanément avec leur meilleure source respective" position="bottom">
            <button
              onClick={onSelectCockpitHexagon}
              className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-xs active:scale-95 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cockpit Macro (PIB + Inflation + Chômage + Dette + Taux + Immo)</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </Tooltip>
        )}
      </div>

      {/* Concept Pills with dynamic best-source resolution */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {MACRO_HEXAGON_CONCEPTS.map(conceptId => {
          const concept = ECONOMIC_CONCEPTS.find(c => c.id === conceptId)!;
          const resolved = SourceRouter.resolveBestSource(conceptId, currentCountry);
          const meta = SOURCE_METADATA[resolved.source];
          const IconComp = ICON_MAP[concept.icon] || TrendingUp;
          const isSelected = activeConcept === conceptId;

          return (
            <Tooltip
              key={concept.id}
              content={`${resolved.reasonFr} Alternative(s) : ${resolved.alternatives.map(a => a.sourceName).join(', ') || 'Aucune'}`}
              position="top"
            >
              <button
                onClick={() => onSelectConcept(conceptId, resolved)}
                className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-500/30'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 text-slate-800 dark:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <div className={`p-1 rounded-md ${isSelected ? 'bg-white/20 text-white' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'}`}>
                    <IconComp className="w-3.5 h-3.5" />
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm flex items-center gap-1 ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}>
                    <span>{meta?.flag}</span>
                    <span>{meta?.name}</span>
                  </span>
                </div>
                <div className="font-bold text-xs truncate">
                  {concept.labelFr}
                </div>
                <div className={`text-[10px] truncate mt-0.5 flex items-center gap-1 ${isSelected ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                  <ShieldCheck className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
                  <span className="truncate">{resolved.indicator.labelFr || resolved.indicator.label}</span>
                </div>
              </button>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
};
