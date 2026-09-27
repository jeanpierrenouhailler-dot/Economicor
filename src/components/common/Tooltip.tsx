import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const show = () => {
    timeoutRef.current = window.setTimeout(() => setIsVisible(true), 150);
  };

  const hide = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  return (
    <div
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {isVisible && (
        <div
          role="tooltip"
          className={`absolute z-50 px-2.5 py-1.5 text-[11px] font-medium leading-tight text-white bg-slate-900/95 dark:bg-slate-800/95 border border-slate-700/60 rounded-md shadow-lg backdrop-blur-xs whitespace-normal max-w-xs transition-opacity duration-150 pointer-events-none ${positionClasses[position]}`}
        >
          {content}
          {/* Arrow */}
          <div
            className={`absolute w-1.5 h-1.5 bg-slate-900 dark:bg-slate-800 rotate-45 border-slate-700/60 ${
              position === 'top'
                ? 'top-full left-1/2 -translate-x-1/2 -mt-1 border-r border-b'
                : position === 'bottom'
                ? 'bottom-full left-1/2 -translate-x-1/2 -mb-1 border-l border-t'
                : position === 'left'
                ? 'left-full top-1/2 -translate-y-1/2 -ml-1 border-t border-r'
                : 'right-full top-1/2 -translate-y-1/2 -mr-1 border-b border-l'
            }`}
          />
        </div>
      )}
    </div>
  );
};
