import React from 'react';
import { RefreshCw, Zap, X, CheckCircle2 } from 'lucide-react';
import { useAppUpdate } from '../../hooks/useAppUpdate';

export const UpdateNotificationToast: React.FC = () => {
  const { updateAvailable, forceUpdate, version } = useAppUpdate();
  const [dismissed, setDismissed] = React.useState(false);

  if (!updateAvailable || dismissed) return null;

  return (
    <aside
      aria-label="Notification de mise à jour"
      className="fixed bottom-16 sm:bottom-6 right-4 sm:right-6 z-50 max-w-sm w-full bg-slate-900 dark:bg-slate-800 text-white rounded-xl shadow-2xl border border-blue-500/40 p-4 animate-bounce-subtle"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600/30 text-blue-400 flex items-center justify-center shrink-0">
          <Zap className="w-4 h-4 text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white">
              Nouvelle version disponible !
            </h4>
            <button
              onClick={() => setDismissed(true)}
              className="text-slate-400 hover:text-white p-0.5 transition"
              aria-label="Ignorer la notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[11px] text-slate-300 mt-1 leading-snug">
            Une nouvelle version optimisée a été installée en arrière-plan. Activez-la maintenant pour bénéficier des dernières améliorations.
          </p>
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={() => forceUpdate()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition active:scale-95 shadow-xs"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Activer et recharger</span>
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="px-2.5 py-1.5 text-xs text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              Plus tard
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
