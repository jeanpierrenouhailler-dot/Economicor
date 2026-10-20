export type ScorecardPillarId = 'macro' | 'monetary' | 'housing' | 'labor' | 'finance';

export type MetricPolarity = 'higher_is_better' | 'lower_is_better' | 'neutral';
export type MetricHealthStatus = 'favorable' | 'vigilance' | 'alerte' | 'neutre';
export type MetricTrend = 'up' | 'down' | 'stable';

export interface ScorecardSparklinePoint {
  period: string;
  value: number;
}

export interface ScorecardMetric {
  id: string;
  pillar: ScorecardPillarId;
  name: string;
  nameEn: string;
  description: string;
  value: number;
  formattedValue: string;
  unit: string;
  previousValue: number;
  delta: number;
  trend: MetricTrend;
  polarity: MetricPolarity;
  healthStatus: MetricHealthStatus;
  statusComment: string;
  frequency: string;
  period: string;
  source: string;
  sourceLabel: string;
  sourceFlag: string;
  explorerIndicatorId?: string;
  sparkline: ScorecardSparklinePoint[];
  targetValue?: number;
  targetLabel?: string;
}

export interface ScorecardPillar {
  id: ScorecardPillarId;
  title: string;
  titleEn: string;
  icon: string;
  badge: string;
  description: string;
  diagnostic: string;
  healthScore: number; // 0 to 100
  metrics: ScorecardMetric[];
}

export interface ScorecardHeadline {
  growth: string;
  inflation: string;
  unemployment: string;
  debt: string;
  centralBankRate: string;
  centralBankName: string;
}

export interface CountryScorecard {
  countryCode: string;
  countryName: string;
  countryNameEn: string;
  flag: string;
  currency: string;
  lastUpdated: string;
  headline: ScorecardHeadline;
  executiveSummary: string;
  conjonctureOutlook: 'expansion' | 'ralentissement' | 'stagnation' | 'reprise';
  overallScore: number; // 0 to 100
  pillars: ScorecardPillar[];
}
