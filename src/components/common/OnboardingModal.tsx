import React, { useState } from 'react';
import {
  X,
  Compass,
  TrendingUp,
  GitCompare,
  WifiOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Layers
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: 'Bienvenue sur Economic Data Explorer',
      subtitle: 'La plateforme unifiée d’intelligence macroéconomique',
      icon: Sparkles,
      iconColor: 'text-blue-500 bg-blue-50 dark:bg-blue-950/50',
      description:
        'Interrogez, visualisez et comparez les statistiques officielles d’Eurostat et du Fonds Monétaire International (FMI) au sein d’une expérience utilisateur fluide et cohérente.',
      points: [
        'Modèle de données unifié : aucun compromis technique selon la source.',
        'Sources 100% officielles : Eurostat Statistics 1.0, SDMX 3.0 et FMI DataMapper.',
        'Normalisation automatique des codes pays (ISO-2 / ISO-3) et des périodes temporelles.'
      ]
    },
    {
      title: 'L’Explorateur Dynamique & Filtres',
      subtitle: 'Configurez vos analyses sur-mesure',
      icon: Compass,
      iconColor: 'text-sky-500 bg-sky-50 dark:bg-sky-950/50',
      description:
        'L’interface Explorer vous offre une flexibilité complète pour filtrer les datasets, sélectionner vos indicateurs clés et ajuster l’horizon temporel.',
      points: [
        'Indicateurs majeurs : Croissance du PIB réel, Inflation IPCH, Prix de l’immobilier (HPI), Dette publique, Chômage.',
        'Multi-sélection des pays avec préréglages rapides (Big 4, Eurozone, G7).',
        'Slider d’horizon temporel dynamique de 2010 à 2026.'
      ]
    },
    {
      title: 'Visualisations Riches & Comparaisons',
      subtitle: '4 modes d’affichage & protection des unités',
      icon: TrendingUp,
      iconColor: 'text-amber-500 bg-amber-50 dark:bg-amber-950/50',
      description:
        'Analysez vos séries temporelles grâce à des graphiques haute lisibilité, des cartes choroplèthes et des tableaux exportables.',
      points: [
        'Graphiques de séries temporelles avec curseur réticulaire et infobulles interactives.',
        'Carte géographique choroplèthe des pays européens et internationaux.',
        'Garde-fou contre la superposition d’unités incompatibles (taux %, indices base 2015, devises).',
        'Exports instantanés au format CSV ou JSON.'
      ]
    },
    {
      title: 'Mode Hors Ligne & Mises à Jour PWA',
      subtitle: 'Performance, cache local et mises à jour automatiques',
      icon: WifiOff,
      iconColor: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50',
      description:
        'L’application est une Progressive Web App installable sur ordinateur et mobile, fonctionnant même sans connexion internet.',
      points: [
        'Persistance intelligente avec cache IndexedDB à expiration différentiée.',
        'Consultation hors ligne automatique de vos dernières analyses.',
        'Mises à jour transparentes en arrière-plan avec bouton pour forcer l’actualisation.',
        'Raccourcis Favoris et Historique de requêtes sauvegardés localement.'
      ]
    }
  ];

  const step = steps[currentStep];
  const StepIcon = step.icon;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      localStorage.setItem('ede_onboarding_completed', 'true');
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('ede_onboarding_completed', 'true');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in"
      onClick={handleSkip}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 space-y-6 text-slate-900 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Step Indicator & Close */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {steps.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentStep
                    ? 'w-6 bg-blue-600'
                    : i < currentStep
                    ? 'w-2 bg-blue-300 dark:bg-blue-800'
                    : 'w-2 bg-slate-200 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>
          <button
            onClick={handleSkip}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            Passer
          </button>
        </div>

        {/* Hero Step Header */}
        <div className="space-y-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${step.iconColor}`}>
            <StepIcon className="w-6 h-6 stroke-[1.75]" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Étape {currentStep + 1} sur {steps.length}
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              {step.title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {step.subtitle}
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
          <p className="leading-relaxed text-slate-700 dark:text-slate-300">
            {step.description}
          </p>

          <div className="space-y-2 pt-1">
            {step.points.map((pt, idx) => (
              <div key={idx} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="leading-normal">{pt}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Précédent</span>
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg active:scale-95 transition shadow-xs"
          >
            <span>{currentStep === steps.length - 1 ? 'Commencer l’exploration' : 'Suivant'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
