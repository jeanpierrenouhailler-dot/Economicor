import React from 'react';
import { AlertTriangle, RefreshCw, Database } from 'lucide-react';
import { ApiError } from '../../api/core/ApiError';

interface ErrorAlertProps {
  error: unknown;
  onRetry?: () => void;
  lastCachedDate?: string;
  onUseCache?: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  error,
  onRetry,
  lastCachedDate,
  onUseCache
}) => {
  let title = 'Unable to retrieve requested data';
  let message = 'An unexpected network error occurred while querying the statistical provider.';

  if (error instanceof ApiError) {
    message = error.userFriendlyMessage;
    if (error.source) {
      title = `${error.source.toUpperCase()} Service Notice`;
    }
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="p-5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-900 dark:text-rose-200 my-4">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-rose-500/20 text-rose-600 dark:text-rose-400 shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-rose-950 dark:text-rose-100">{title}</h4>
          <p className="mt-1 text-xs text-rose-800 dark:text-rose-300 leading-relaxed">{message}</p>

          {lastCachedDate && (
            <div className="mt-3 flex items-center gap-1.5 text-xs text-rose-700 dark:text-rose-400">
              <Database className="w-3.5 h-3.5" />
              <span>Last cached result available from: <strong>{new Date(lastCachedDate).toLocaleDateString()}</strong></span>
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {onRetry && (
              <button
                onClick={onRetry}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition"
              >
                <RefreshCw className="w-3 h-3" />
                Retry Request
              </button>
            )}
            {lastCachedDate && onUseCache && (
              <button
                onClick={onUseCache}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-rose-300 dark:border-rose-800 bg-white/60 dark:bg-slate-900/60 text-rose-800 dark:text-rose-200 hover:bg-white transition"
              >
                <Database className="w-3 h-3" />
                Load Cached Snapshot
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
