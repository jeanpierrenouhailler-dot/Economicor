export type AnomalyType =
  | 'z_score_outlier'
  | 'velocity_surge'
  | 'historical_record'
  | 'trend_break'
  | 'moving_average_divergence';

export type AnomalySeverity = 'high' | 'medium' | 'info';

export interface AIAnomalyExplanation {
  summary: string;
  likelyCauses: string[];
  macroImplications: string;
  persistenceOutlook: 'transitoire' | 'structurel' | 'incertain';
  confidence: 'élevée' | 'moyenne';
  generatedAt: string;
}

export interface EconomicAnomaly {
  id: string;
  countryCode: string;
  countryLabel: string;
  countryFlag: string;
  indicatorId: string;
  indicatorLabel: string;
  period: string;
  previousPeriod?: string;
  currentValue: number;
  previousValue?: number;
  formattedCurrentValue: string;
  formattedPreviousValue?: string;
  delta?: number;
  formattedDelta?: string;
  unit: string;
  type: AnomalyType;
  severity: AnomalySeverity;
  badge: string; // e.g. "🔔 Anomalie détectée" | "🔔 Variation inhabituelle"
  badgeColor: string;
  headline: string; // e.g. "L'inflation française augmente de 1,8 % → 3,1 % en trois mois."
  statisticalDetail: string; // e.g. "Écart à la tendance historique : +2,1σ"
  zScore: number;
  standardDeviations: number;
  recordSinceYear?: number;
  movingAverageValue?: number;
  divergencePercent?: number;
  detectedAt: string;
  source: string;
  sourceBadge: string;
  historicalContext?: string;
  aiExplanation?: AIAnomalyExplanation;
}
