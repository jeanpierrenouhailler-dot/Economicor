import { EconomicObservation } from '../models/Observation';
import { TimeSeriesAnalysis, TrendDirection, TrendSymbol } from '../models/TimeSeriesAnalysis';
import { NormalizationService } from './NormalizationService';

export class TimeSeriesAnalysisService {
  /**
   * Formats a number with French locale (comma as decimal separator)
   */
  public static formatNumber(val: number, decimals: number = 1): string {
    return val.toLocaleString('fr-FR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  /**
   * Formats a delta with + or - and optional % sign
   */
  public static formatDelta(delta: number, isPercent: boolean = true, decimals: number = 1): string {
    const sign = delta > 0 ? '+' : '';
    const formatted = this.formatNumber(delta, decimals);
    return `${sign}${formatted}${isPercent ? ' %' : ''}`;
  }

  /**
   * Analyzes an array of observations for a specific country or the primary series.
   */
  public static analyzeSeries(
    observations: EconomicObservation[],
    targetCountry?: string
  ): TimeSeriesAnalysis | null {
    if (!observations || observations.length === 0) return null;

    // Filter by country if specified, or pick the first country present
    let series = observations;
    if (targetCountry) {
      series = observations.filter(o => o.country.toUpperCase() === targetCountry.toUpperCase());
    } else {
      const firstCountry = observations[0].country;
      series = observations.filter(o => o.country === firstCountry);
    }

    // Filter valid numerical values
    const validObs = series.filter(
      o => o.value !== null && o.value !== undefined && !Number.isNaN(o.value) && Number.isFinite(o.value)
    );

    if (validObs.length === 0) return null;

    // Sort chronologically using NormalizationService
    const sorted = NormalizationService.sortObservations(validObs);

    const latest = sorted[sorted.length - 1];
    const countryCode = latest.country;
    const countryLabel = latest.countryLabel || countryCode;
    const unit = latest.unit || '';
    const frequency = latest.frequency || 'A';
    const currentValue = latest.value!;
    const latestPeriod = latest.period;

    // 1. Period Variation (vs immediate previous observation)
    let periodVariation: TimeSeriesAnalysis['periodVariation'] = null;
    if (sorted.length >= 2) {
      const prev = sorted[sorted.length - 2];
      const prevVal = prev.value!;
      const absDelta = Math.round((currentValue - prevVal) * 100) / 100;
      let pctDelta: number | null = null;
      if (prevVal !== 0) {
        pctDelta = Math.round(((currentValue - prevVal) / Math.abs(prevVal)) * 1000) / 10;
      }

      // If the unit itself is percent (e.g. unemployment rate), we can show the relative % or point delta
      const displayDelta = pctDelta !== null ? pctDelta : absDelta;
      const isUp = absDelta > 0.0001;
      const isDown = absDelta < -0.0001;

      periodVariation = {
        absoluteDelta: absDelta,
        percentDelta: pctDelta,
        formattedDelta: this.formatDelta(displayDelta, true),
        previousPeriod: prev.period,
        isUp,
        isDown,
        isStable: !isUp && !isDown
      };
    }

    // 2. Annual Variation (YoY vs ~1 year prior)
    let annualVariation: TimeSeriesAnalysis['annualVariation'] = null;
    const yoyObs = this.findPriorYearObservation(sorted, latest);
    if (yoyObs) {
      const yoyVal = yoyObs.value!;
      const absDelta = Math.round((currentValue - yoyVal) * 100) / 100;
      let pctDelta: number | null = null;
      if (yoyVal !== 0) {
        pctDelta = Math.round(((currentValue - yoyVal) / Math.abs(yoyVal)) * 1000) / 10;
      }
      const displayDelta = pctDelta !== null ? pctDelta : absDelta;
      const isUp = absDelta > 0.0001;
      const isDown = absDelta < -0.0001;

      annualVariation = {
        absoluteDelta: absDelta,
        percentDelta: pctDelta,
        formattedDelta: this.formatDelta(displayDelta, true),
        comparisonPeriod: yoyObs.period,
        isUp,
        isDown,
        isStable: !isUp && !isDown
      };
    }

    // 3. 10-Year Average (Moyenne 10 ans)
    const latestYearMatch = latestPeriod.match(/\b(19\d\d|20\d\d)\b/);
    const latestYear = latestYearMatch ? parseInt(latestYearMatch[1], 10) : new Date().getFullYear();
    const tenYearsAgo = latestYear - 10;

    // Filter observations within 10 years
    const tenYearObs = sorted.filter(o => {
      const yMatch = o.period.match(/\b(19\d\d|20\d\d)\b/);
      if (!yMatch) return true;
      const y = parseInt(yMatch[1], 10);
      return y >= tenYearsAgo && y <= latestYear;
    });

    const datasetForMean = tenYearObs.length > 0 ? tenYearObs : sorted;
    const sum = datasetForMean.reduce((acc, curr) => acc + curr.value!, 0);
    const tenYearMean = Math.round((sum / datasetForMean.length) * 100) / 100;

    // 4. Spread to 10-Year Average (Écart à la moyenne)
    let spreadToAverage: TimeSeriesAnalysis['spreadToAverage'] = null;
    if (tenYearMean !== null) {
      const absSpread = Math.round((currentValue - tenYearMean) * 100) / 100;
      let pctSpread: number | null = null;
      if (tenYearMean !== 0) {
        pctSpread = Math.round(((currentValue - tenYearMean) / Math.abs(tenYearMean)) * 1000) / 10;
      }
      const displaySpread = pctSpread !== null ? pctSpread : absSpread;
      spreadToAverage = {
        absoluteSpread: absSpread,
        percentSpread: pctSpread,
        formattedSpread: this.formatDelta(displaySpread, true),
        isAbove: absSpread > 0,
        isBelow: absSpread < 0
      };
    }

    // 5. Historical Max and Min
    let historicalMax = { value: -Infinity, period: '', formattedValue: '' };
    let historicalMin = { value: Infinity, period: '', formattedValue: '' };

    for (const o of sorted) {
      if (o.value! > historicalMax.value) {
        historicalMax = {
          value: o.value!,
          period: o.period,
          formattedValue: this.formatNumber(o.value!)
        };
      }
      if (o.value! < historicalMin.value) {
        historicalMin = {
          value: o.value!,
          period: o.period,
          formattedValue: this.formatNumber(o.value!)
        };
      }
    }

    // Range Position
    const rangeSpan = historicalMax.value - historicalMin.value;
    const rangePositionPercent =
      rangeSpan > 0
        ? Math.min(100, Math.max(0, Math.round(((currentValue - historicalMin.value) / rangeSpan) * 100)))
        : 50;

    // 6. Trend Streak (ex: "Hausse depuis 8 mois")
    const trend = this.calculateTrendStreak(sorted, frequency);

    return {
      countryCode,
      countryLabel,
      unit,
      frequency,
      latestPeriod,
      currentValue,
      formattedCurrentValue: this.formatNumber(currentValue),
      periodVariation,
      annualVariation,
      tenYearAverage: tenYearMean,
      formattedTenYearAverage: this.formatNumber(tenYearMean),
      tenYearPeriodRange: `${tenYearsAgo} – ${latestYear}`,
      tenYearObservationCount: datasetForMean.length,
      spreadToAverage,
      historicalMax,
      historicalMin,
      rangePositionPercent,
      trend,
      totalObservations: sorted.length,
      firstPeriod: sorted[0].period
    };
  }

  /**
   * Identifies consecutive periods trend streak:
   * "Hausse depuis 8 mois", "Baisse depuis 3 trimestres", "Stable depuis 2 ans"
   */
  private static calculateTrendStreak(
    sorted: EconomicObservation[],
    frequency: string
  ): TimeSeriesAnalysis['trend'] {
    if (sorted.length < 2) {
      return {
        direction: 'stable',
        symbol: '→',
        consecutivePeriods: 1,
        durationLabel: 'Donnée initiale unique',
        frequencyLabel: 'période',
        summary: 'Historique insuffisant pour établir une tendance continue.'
      };
    }

    // Determine unit name based on frequency
    let freqUnitSingular = 'période';
    let freqUnitPlural = 'périodes';
    if (frequency === 'M') {
      freqUnitSingular = 'mois';
      freqUnitPlural = 'mois';
    } else if (frequency === 'Q') {
      freqUnitSingular = 'trimestre';
      freqUnitPlural = 'trimestres';
    } else if (frequency === 'A') {
      freqUnitSingular = 'an';
      freqUnitPlural = 'ans';
    }

    const lastIdx = sorted.length - 1;
    const latestDiff = sorted[lastIdx].value! - sorted[lastIdx - 1].value!;

    let direction: TrendDirection = 'stable';
    let symbol: TrendSymbol = '→';

    const EPSILON = 0.0001;
    if (latestDiff > EPSILON) {
      direction = 'up';
      symbol = '↗';
    } else if (latestDiff < -EPSILON) {
      direction = 'down';
      symbol = '↘';
    }

    // Count consecutive intervals in the same direction from the end backwards
    let streakCount = 1;
    for (let i = lastIdx - 1; i >= 1; i--) {
      const diff = sorted[i].value! - sorted[i - 1].value!;
      if (direction === 'up' && diff > EPSILON) {
        streakCount++;
      } else if (direction === 'down' && diff < -EPSILON) {
        streakCount++;
      } else if (direction === 'stable' && Math.abs(diff) <= EPSILON) {
        streakCount++;
      } else {
        break;
      }
    }

    const unitText = streakCount > 1 ? freqUnitPlural : freqUnitSingular;
    let durationLabel = '';
    let summary = '';

    if (direction === 'up') {
      durationLabel = `Hausse depuis ${streakCount} ${unitText}`;
      summary = `Trajectoire ascendante confirmée sur les ${streakCount} dernières périodes consécutives.`;
    } else if (direction === 'down') {
      durationLabel = `Baisse depuis ${streakCount} ${unitText}`;
      summary = `Repli soutenu observé sur les ${streakCount} dernières périodes consécutives.`;
    } else {
      durationLabel = `Stable depuis ${streakCount} ${unitText}`;
      summary = `Consolidation et stabilité des niveaux sans inflexion majeure.`;
    }

    return {
      direction,
      symbol,
      consecutivePeriods: streakCount,
      durationLabel,
      frequencyLabel: unitText,
      summary
    };
  }

  /**
   * Finds the observation closest to 1 year before the latest observation.
   */
  private static findPriorYearObservation(
    sorted: EconomicObservation[],
    latest: EconomicObservation
  ): EconomicObservation | null {
    if (sorted.length < 2) return null;

    const latestPeriod = latest.period;

    // Check Monthly format: YYYY-MM
    const mMatch = latestPeriod.match(/^(\d{4})-(\d{1,2})$/);
    if (mMatch) {
      const targetYear = parseInt(mMatch[1], 10) - 1;
      const targetMonth = mMatch[2].padStart(2, '0');
      const targetPeriod = `${targetYear}-${targetMonth}`;
      const found = sorted.find(o => o.period === targetPeriod);
      if (found) return found;
      // Fallback: 12 observations prior if continuous monthly
      if (sorted.length >= 13) return sorted[sorted.length - 13];
    }

    // Check Quarterly format: YYYY-Q[1-4]
    const qMatch = latestPeriod.match(/^(\d{4})-Q([1-4])$/i);
    if (qMatch) {
      const targetYear = parseInt(qMatch[1], 10) - 1;
      const targetQ = qMatch[2];
      const targetPeriod = `${targetYear}-Q${targetQ}`;
      const found = sorted.find(o => o.period.toUpperCase() === targetPeriod.toUpperCase());
      if (found) return found;
      // Fallback: 4 observations prior if continuous quarterly
      if (sorted.length >= 5) return sorted[sorted.length - 5];
    }

    // Check Annual format: YYYY
    const aMatch = latestPeriod.match(/^(\d{4})$/);
    if (aMatch) {
      const targetYear = String(parseInt(aMatch[1], 10) - 1);
      const found = sorted.find(o => o.period === targetYear);
      if (found) return found;
      return sorted[sorted.length - 2];
    }

    // Generic fallback: check if periodDate exists
    if (latest.periodDate) {
      const latestDate = new Date(latest.periodDate);
      if (!isNaN(latestDate.getTime())) {
        const targetTime = new Date(latestDate);
        targetTime.setFullYear(targetTime.getFullYear() - 1);
        const targetMs = targetTime.getTime();

        let closest: EconomicObservation | null = null;
        let minDiff = Infinity;
        for (let i = 0; i < sorted.length - 1; i++) {
          if (sorted[i].periodDate) {
            const d = new Date(sorted[i].periodDate!).getTime();
            const diff = Math.abs(d - targetMs);
            if (diff < minDiff && diff < 120 * 24 * 3600 * 1000) { // within ~4 months tolerance
              minDiff = diff;
              closest = sorted[i];
            }
          }
        }
        if (closest) return closest;
      }
    }

    // Ultimate fallback if quarterly or annual
    if (sorted.length >= 5) return sorted[sorted.length - 5];
    return sorted[sorted.length - 2];
  }

  /**
   * Groups series by country and returns analyses for all available countries.
   */
  public static analyzeAllCountries(
    observations: EconomicObservation[]
  ): Map<string, TimeSeriesAnalysis> {
    const result = new Map<string, TimeSeriesAnalysis>();
    if (!observations || observations.length === 0) return result;

    const countries = Array.from(new Set(observations.map(o => o.country)));
    for (const c of countries) {
      const analysis = this.analyzeSeries(observations, c);
      if (analysis) {
        result.set(c, analysis);
      }
    }
    return result;
  }
}
