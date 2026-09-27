import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Compass, GitCompare, Database, Bookmark, History } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const items = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/explorer', label: 'Explorer', icon: Compass },
    { to: '/compare', label: 'Compare', icon: GitCompare },
    { to: '/datasets', label: 'Datasets', icon: Database },
    { to: '/favorites', label: 'Favorites', icon: Bookmark },
    { to: '/history', label: 'History', icon: History }
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around safe-area-bottom">
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-2 text-[10px] font-medium transition-colors ${
              isActive
                ? 'text-blue-600 dark:text-blue-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`
          }
        >
          <Icon className="w-4 h-4 mb-0.5" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
};
