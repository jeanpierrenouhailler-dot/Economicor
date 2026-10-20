export type TrajectoryDirection = 'up' | 'down' | 'stable';
export type TrajectorySymbol = '↗' | '↘' | '→';

export type RadarIndicatorCategory =
  | 'Croissance'
  | 'Inflation'
  | 'Chômage'
  | 'Dette'
  | 'Immobilier'
  | 'Industrie'
  | 'Exportations';

export interface RadarSparklinePoint {
  period: string;
  value: number;
}

export interface RadarMetric {
  id: string;
  category: RadarIndicatorCategory;
  label: string;
  labelEn: string;
  value: number;
  formattedValue: string;
  unit: string;
  direction: TrajectoryDirection;
  symbol: TrajectorySymbol;
  directionLabel: string;
  period: string;
  source: string;
  sourceName: string;
  sourceFlag: string;
  methodology: string;
  methodologyStandard: string; // e.g. "SEC 2010 / CVS-CJO", "BIT (ILO)", "Maastricht"
  explorerIndicatorId?: string;
  sparkline: RadarSparklinePoint[];
}

export interface RadarCountry {
  code: string;
  name: string;
  nameFr: string;
  flag: string;
  continent: 'Europe' | 'Amérique du Nord' | 'Asie' | 'Amérique du Sud' | 'Mondial';
  coordinates: {
    x: number; // percentage from left (0 to 100)
    y: number; // percentage from top (0 to 100)
  };
  gdpSharePercent: number; // % of global GDP
  currentRegime: string;
  regimeBadge: string;
  lastUpdated: string;
  metrics: Record<RadarIndicatorCategory, RadarMetric>;
  transparentMethodologySummary: string;
}
