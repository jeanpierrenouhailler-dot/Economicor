import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, ArrowRight, Trash2, Compass, Layers } from 'lucide-react';
import { FavoritesService, FavoriteItem } from '../../services/FavoritesService';
import { EmptyState } from '../../components/common/EmptyState';

export const FavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    setFavorites(FavoritesService.getFavorites());
  }, []);

  const handleRemove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    FavoritesService.removeFavorite(id);
    setFavorites(FavoritesService.getFavorites());
  };

  const handleLaunch = (fav: FavoriteItem) => {
    const q = fav.query;
    const countriesStr = (q.countries || []).join(',');
    navigate(
      `/explorer?source=${q.source || 'all'}&dataset=${q.dataset || ''}&indicator=${q.indicator || fav.indicatorId}&countries=${countriesStr}&from=${q.startPeriod || '2018'}&to=${q.endPeriod || '2026'}`
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Saved Views</span>
            <span aria-hidden="true">·</span>
            <span>Persistent Offline Storage</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Bookmarked Analyses
          </h1>
        </div>
      </div>

      {favorites.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No favorites saved yet"
          description="Click 'Add to Favorites' on any query in Explorer to bookmark queries for one-click access."
          actionLabel="Explore Economic Data"
          onAction={() => navigate('/explorer')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((fav) => (
            <div
              key={fav.id}
              onClick={() => handleLaunch(fav)}
              className="group p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold uppercase text-blue-600 dark:text-blue-400 text-[10px]">
                    {fav.source}
                  </span>
                  <button
                    onClick={(e) => handleRemove(fav.id, e)}
                    className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                    title="Remove from favorites"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {fav.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {fav.subtitle}
                </p>

                {fav.tags && fav.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {fav.tags.map(t => (
                      <span key={t} className="text-[10px] text-slate-500 dark:text-slate-400">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="text-[10px]">Saved {new Date(fav.createdAt).toLocaleDateString()}</span>
                <span className="text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>Launch</span>
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
