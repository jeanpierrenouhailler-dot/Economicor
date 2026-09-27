import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  X,
  HelpCircle,
  Compass,
  LayoutDashboard,
  GitCompare,
  Database,
  Bookmark,
  History,
  Info,
  BookOpen,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

interface ContextualHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContextualHelpModal: React.FC<ContextualHelpModalProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'page' | 'glossary' | 'faq'>('page');

  if (!isOpen) return null;

  const getPageInfo = () => {
    switch (location.pathname) {
      case '/':
        return {
          title: 'Aide du Tableau de Bord (Dashboard)',
          icon: LayoutDashboard,
          summary:
            'Le tableau de bord présente les indicateurs économiques clés en temps réel pour les grandes économies mondiales et européennes.',
          tips: [
            'Cliquez sur les drapeaux de pays pour basculer instantanément les statistiques de la France, Allemagne, Italie, etc.',
            'Chaque carte d’indicateur (PIB, Inflation, Dette, Chômage, Immobilier) est cliquable et ouvre directement l’Explorateur avec les paramètres pré-remplis.',
            'L’icône de rafraîchissement permet de réinterroger les serveurs officiels et de mettre à jour le cache local.'
          ]
        };
      case '/explorer':
        return {
          title: 'Aide de l’Explorateur (Data Explorer)',
          icon: Compass,
          summary:
            'L’Explorateur est le moteur central permettant d’interroger avec précision les bases de données d’Eurostat et du FMI.',
          tips: [
            'Sélectionnez la Source (Eurostat ou FMI), puis le Dataset et enfin l’Indicateur désiré.',
            'Utilisez les préréglages « Big 4 », « Eurozone » ou « G7 » pour sélectionner rapidement un groupe d’économies pertinentes.',
            'Basculez entre les 4 vues disponibles : Séries temporelles (courbe), Comparaison par barres, Carte géographique choroplèthe, ou Tableau haute densité.',
            'Exportez vos résultats nettoyés et normalisés au format CSV ou JSON en un clic via la barre d’outils du tableau.'
          ]
        };
      case '/compare':
        return {
          title: 'Aide du Comparateur Multi-Indicateurs (Compare)',
          icon: GitCompare,
          summary:
            'Ce module permet de confronter plusieurs pays simultanément ou de croiser deux indicateurs macroéconomiques.',
          tips: [
            'Mode « Comparer des pays » : affiche sur un même repère graphique l’évolution d’un indicateur pour l’ensemble des pays sélectionnés.',
            'Mode « Comparer deux indicateurs » : croise deux variables (ex : PIB vs Inflation).',
            'Protection d’unités : si vous comparez un taux en % et un indice base 2015=100, le système prévient automatiquement toute superposition artificielle en scindant les axes graphiques.'
          ]
        };
      case '/datasets':
        return {
          title: 'Aide de l’Explorateur de Datasets (Metadata)',
          icon: Database,
          summary:
            'Visualisez les structures de données (DSD) et les listes de codes SDMX 3.0 officielles avant d’effectuer vos requêtes.',
          tips: [
            'Consultez la liste des dimensions requises pour chaque dataset (unités, type de transaction, COICOP, etc.).',
            'Accédez aux liens directs vers les fiches méthodologiques et documentations officielles d’Eurostat et du FMI.'
          ]
        };
      case '/favorites':
        return {
          title: 'Aide des Favoris',
          icon: Bookmark,
          summary:
            'Vos analyses enregistrées pour un accès instantané en un clic.',
          tips: [
            'Dans l’Explorateur, cliquez sur « Ajouter aux Favoris » pour mémoriser l’indicateur, les pays et la période actuelle.',
            'Les favoris sont conservés localement et restent consultables même en mode hors ligne.'
          ]
        };
      case '/history':
        return {
          title: 'Aide de l’Historique',
          icon: History,
          summary:
            'Historique chronologique des requêtes exécutées au cours de votre session de travail.',
          tips: [
            'Chaque recherche effectuée dans l’Explorateur est automatiquement consignée.',
            'Cliquez sur « Rerun » pour recharger instantanément n’importe quelle requête passée.'
          ]
        };
      default:
        return {
          title: 'Guide d’utilisation général',
          icon: Info,
          summary:
            'Plateforme de référence pour les statistiques macroéconomiques Eurostat et FMI.',
          tips: [
            'Naviguez via le menu Hamburger ou la barre de navigation supérieure.',
            'Consultez les paramètres système pour vérifier ou forcer les mises à jour de l’application.'
          ]
        };
    }
  };

  const pageInfo = getPageInfo();
  const PageIcon = pageInfo.icon;

  const glossary = [
    {
      term: 'PIB Réel / Real GDP Growth (NGDP_RPCH)',
      def: 'Variation annuelle en pourcentage du Produit Intérieur Brut corrigé de l’inflation. Mesure de la croissance économique réelle issue du World Economic Outlook (WEO) du FMI.'
    },
    {
      term: 'IPCH / HICP (Harmonised Index of Consumer Prices)',
      def: 'Indice des prix à la consommation harmonisé élaboré par Eurostat pour permettre des comparaisons strictes de l’inflation entre États membres de l’Union Européenne.'
    },
    {
      term: 'Indice des Prix de l’Immobilier / HPI (prc_hpi_q)',
      def: 'Indice trimestriel Eurostat mesurant l’évolution des prix d’acquisition des logements résidentiels (anciens et neufs) achetés par les ménages, base 2015 = 100.'
    },
    {
      term: 'Dette Publique Brute (% du PIB) (GGXWDG_NGDP)',
      def: 'Total des engagements financiers contractés par les administrations publiques rapporté au PIB nominal annuel, calculé par le FMI.'
    },
    {
      term: 'SDMX 3.0 (Statistical Data and Metadata eXchange)',
      def: 'Standard international de modélisation et d’échange de données statistiques soutenu par Eurostat, le FMI, la Banque Mondiale, l’OCDE et la BCE.'
    },
    {
      term: 'JSON-stat',
      def: 'Format standard léger de diffusion de données statistiques multidimensionnelles utilisé par l’API officielle Statistics 1.0 d’Eurostat.'
    }
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 space-y-5 text-slate-900 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Centre d’Aide &amp; Documentation
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Aide contextuelle, définitions économiques et conseils pratiques
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setActiveTab('page')}
            className={`flex-1 py-1.5 text-center rounded-md transition ${
              activeTab === 'page'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Cette Page
          </button>
          <button
            onClick={() => setActiveTab('glossary')}
            className={`flex-1 py-1.5 text-center rounded-md transition ${
              activeTab === 'glossary'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Lexique Économique
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`flex-1 py-1.5 text-center rounded-md transition ${
              activeTab === 'faq'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            FAQ &amp; Offline
          </button>
        </div>

        {/* Tab 1: Current Page Guide */}
        {activeTab === 'page' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-900 dark:text-blue-200">
                <PageIcon className="w-4 h-4 text-blue-500" />
                <span>{pageInfo.title}</span>
              </div>
              <p className="text-xs text-blue-800/80 dark:text-blue-300 leading-relaxed">
                {pageInfo.summary}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Conseils d'utilisation :
              </h4>
              <div className="space-y-2">
                {pageInfo.tips.map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Glossary */}
        {activeTab === 'glossary' && (
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {glossary.map((item, i) => (
              <div
                key={i}
                className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs space-y-1"
              >
                <strong className="text-slate-900 dark:text-white block font-semibold">
                  {item.term}
                </strong>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.def}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: FAQ & Offline */}
        {activeTab === 'faq' && (
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1 text-xs">
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
              <strong className="text-slate-900 dark:text-white block">
                Comment fonctionne le mode hors-ligne ?
              </strong>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Toutes les requêtes effectuées sont automatiquement stockées dans votre base locale IndexedDB. Si vous perdez votre connexion réseau, l’application bascule automatiquement sur les données mises en cache et affiche un bandeau de rappel avec la date du snapshot.
              </p>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
              <strong className="text-slate-900 dark:text-white block">
                Comment mettre à jour l’application ?
              </strong>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Le Service Worker vérifie automatiquement en arrière-plan la disponibilité de nouvelles versions. Vous pouvez également ouvrir les <strong>Paramètres Système</strong> et cliquer sur « Vérifier les mises à jour » ou « Forcer la mise à jour » pour vider les caches.
              </p>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
              <strong className="text-slate-900 dark:text-white block">
                D'où proviennent exactement les chiffres ?
              </strong>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Les chiffres sont issus directement des APIs publiques d’Eurostat (Commission Européenne) et du DataMapper du Fonds Monétaire International (FMI). Aucune donnée n’est inventée ou altérée.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition active:scale-95 shadow-xs"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
