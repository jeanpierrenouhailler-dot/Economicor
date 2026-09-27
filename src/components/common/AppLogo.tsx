import React from 'react';
import { NavLink } from 'react-router-dom';

interface AppLogoProps {
  compact?: boolean;
  className?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({ compact = false, className = '' }) => {
  return (
    <NavLink
      to="/"
      className={`flex items-center gap-2.5 group select-none ${className}`}
      aria-label="Economic Data Explorer Accueil"
    >
      {/* Dynamic Vector SVG Mark */}
      <div className="relative w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-500 p-0.5 shadow-sm group-hover:scale-105 transition-transform duration-200">
        <svg
          viewBox="0 0 40 40"
          className="w-full h-full text-white"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Coordinate grid */}
          <line x1="8" y1="30" x2="32" y2="30" stroke="white" strokeOpacity="0.25" strokeWidth="1.2" />
          <line x1="8" y1="22" x2="32" y2="22" stroke="white" strokeOpacity="0.15" strokeWidth="1" strokeDasharray="2 2" />
          
          {/* Data bars */}
          <rect x="9" y="20" width="3.5" height="10" rx="1" fill="white" fillOpacity="0.6" />
          <rect x="15" y="14" width="3.5" height="16" rx="1" fill="white" fillOpacity="0.85" />
          <rect x="21" y="22" width="3.5" height="8" rx="1" fill="white" fillOpacity="0.5" />
          <rect x="27" y="10" width="3.5" height="20" rx="1" fill="#38BDF8" />
          
          {/* Golden Trend Line */}
          <path
            d="M 10 20 Q 18 10 24 16 T 32 7"
            stroke="#FBBF24"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="32" cy="7" r="2.2" fill="#FDE047" stroke="#1E3A8A" strokeWidth="1" />
        </svg>
      </div>

      {/* Brand wordmark */}
      {!compact && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white leading-none">
              ECONOMIC<span className="text-blue-600 dark:text-blue-400">DATA</span>
            </span>
            <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-mono">
              PRO
            </span>
          </div>
          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 tracking-wide leading-none mt-0.5">
            EUROSTAT &amp; FMI INTELLIGENCE
          </span>
        </div>
      )}
    </NavLink>
  );
};
