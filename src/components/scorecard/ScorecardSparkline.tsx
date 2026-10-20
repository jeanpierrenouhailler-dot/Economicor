import React from 'react';
import { ScorecardSparklinePoint } from '../../models/Scorecard';

interface ScorecardSparklineProps {
  points: ScorecardSparklinePoint[];
  color?: string;
  height?: number;
  width?: number;
}

export const ScorecardSparkline: React.FC<ScorecardSparklineProps> = ({
  points,
  color = '#2563eb', // blue-600
  height = 36,
  width = 120
}) => {
  if (!points || points.length < 2) return null;

  const values = points.map(p => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const paddingX = 4;
  const paddingY = 4;
  const innerWidth = width - paddingX * 2;
  const innerHeight = height - paddingY * 2;

  const coordinates = points.map((p, index) => {
    const x = paddingX + (index / (points.length - 1)) * innerWidth;
    const y = paddingY + innerHeight - ((p.value - min) / range) * innerHeight;
    return { x, y, ...p };
  });

  const pathData = coordinates.reduce(
    (acc, curr, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${curr.x.toFixed(1)},${curr.y.toFixed(1)}`,
    ''
  );

  const areaData = `${pathData} L ${coordinates[coordinates.length - 1].x.toFixed(1)},${height} L ${coordinates[0].x.toFixed(1)},${height} Z`;

  const gradientId = `sparkline-grad-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className="relative inline-block" title={`Tendance : ${points[0].period} (${points[0].value}) → ${points[points.length - 1].period} (${points[points.length - 1].value})`}>
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        <path d={areaData} fill={`url(#${gradientId})`} />
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Start and end anchor dots */}
        <circle
          cx={coordinates[coordinates.length - 1].x}
          cy={coordinates[coordinates.length - 1].y}
          r="2.5"
          fill={color}
          className="animate-pulse"
        />
      </svg>
    </div>
  );
};
