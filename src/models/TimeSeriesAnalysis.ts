export type TrendDirection = 'up' | 'down' | 'stable';
export type TrendSymbol = '↗' | '↘' | '→';

export interface TimeSeriesAnalysis {
  countryCode: string;
  countryLabel: string;
  unit: string;
  frequency: string;
  latestPeriod: string;

  // 1. Valeur actuelle
  currentValue: number;
  formattedCurrentValue: string;

  // 2. Variation périodique (MoM, QoQ, YoY selon la fréquence)
  periodVariation: {
    absoluteDelta: number;
    percentDelta: number | null;
    formattedDelta: string;
    previousPeriod: string;
    isUp: boolean;
    isDown: boolean;
    isStable: boolean;
  } | null;

  // 3. Variation annuelle (1 an d'écart glissant)
  annualVariation: {
    absoluteDelta: number;
    percentDelta: number | null;
    formattedDelta: string;
    comparisonPeriod: string;
    isUp: boolean;
    isDown: boolean;
    isStable: boolean;
  } | null;

  // 4. Moyenne 10 ans
  tenYearAverage: number | null;
  formattedTenYearAverage: string;
  tenYearPeriodRange: string;
  tenYearObservationCount: number;

  // 5. Écart à la moyenne
  spreadToAverage: {
    absoluteSpread: number;
    percentSpread: number | null;
    formattedSpread: string;
    isAbove: boolean;
    isBelow: boolean;
  } | null;

  // 6. Maximum historique
  historicalMax: {
    value: number;
    period: string;
    formattedValue: string;
  };

  // 7. Minimum historique
  historicalMin: {
    value: number;
    period: string;
    formattedValue: string;
  };

  // Jauge / Position relative dans l'intervalle [Min, Max] en %
  rangePositionPercent: number;

  // 8. Tendance consécutive (ex: "Hausse depuis 8 mois")
  trend: {
    direction: TrendDirection;
    symbol: TrendSymbol;
    consecutivePeriods: number;
    durationLabel: string; // "Hausse depuis 8 mois", "Baisse depuis 3 trimestres", etc.
    frequencyLabel: string;
    summary: string;
  };

  // Métadonnées d'échantillon
  totalObservations: number;
  firstPeriod: string;
}
