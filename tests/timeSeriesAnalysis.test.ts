import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { EconomicObservation } from '../src/models/Observation';
import { TimeSeriesAnalysisService } from '../src/services/TimeSeriesAnalysisService';

describe('TimeSeriesAnalysisService', () => {
  test('Computes exact time series metrics matching user specification', () => {
    // Construct a simulated 8-month consecutive rising series that peaks and reaches 112.4
    // from minimum 71.4 up to maximum 118.2 (at an earlier peak), with 10-year mean 97.3
    const testObs: EconomicObservation[] = [
      // 10 years ago starting point
      { source: 'insee', dataset: 'test', indicator: 'ind', indicatorLabel: 'Ind', country: 'FR', countryIso3: 'FRA', countryLabel: 'France', period: '2016-01', periodDate: '2016-01-01', value: 71.4, unit: 'Points', unitCategory: 'index', frequency: 'M' },
      { source: 'insee', dataset: 'test', indicator: 'ind', indicatorLabel: 'Ind', country: 'FR', countryIso3: 'FRA', countryLabel: 'France', period: '2020-06', periodDate: '2020-06-01', value: 118.2, unit: 'Points', unitCategory: 'index', frequency: 'M' },
      // Previous year comparison (1 year prior to 2026-08 is 2025-08)
      // 112.4 vs 106.3 => +5.7%
      { source: 'insee', dataset: 'test', indicator: 'ind', indicatorLabel: 'Ind', country: 'FR', countryIso3: 'FRA', countryLabel: 'France', period: '2025-08', periodDate: '2025-08-01', value: 106.34, unit: 'Points', unitCategory: 'index', frequency: 'M' },
      // 8 months streak:
      // Month 1
      { source: 'insee', dataset: 'test', indicator: 'ind', indicatorLabel: 'Ind', country: 'FR', countryIso3: 'FRA', countryLabel: 'France', period: '2025-12', periodDate: '2025-12-01', value: 100.0, unit: 'Points', unitCategory: 'index', frequency: 'M' },
      // Month 2
      { source: 'insee', dataset: 'test', indicator: 'ind', indicatorLabel: 'Ind', country: 'FR', countryIso3: 'FRA', countryLabel: 'France', period: '2026-01', periodDate: '2026-01-01', value: 101.5, unit: 'Points', unitCategory: 'index', frequency: 'M' },
      // Month 3
      { source: 'insee', dataset: 'test', indicator: 'ind', indicatorLabel: 'Ind', country: 'FR', countryIso3: 'FRA', countryLabel: 'France', period: '2026-02', periodDate: '2026-02-01', value: 103.0, unit: 'Points', unitCategory: 'index', frequency: 'M' },
      // Month 4
      { source: 'insee', dataset: 'test', indicator: 'ind', indicatorLabel: 'Ind', country: 'FR', countryIso3: 'FRA', countryLabel: 'France', period: '2026-03', periodDate: '2026-03-01', value: 104.2, unit: 'Points', unitCategory: 'index', frequency: 'M' },
      // Month 5
      { source: 'insee', dataset: 'test', indicator: 'ind', indicatorLabel: 'Ind', country: 'FR', countryIso3: 'FRA', countryLabel: 'France', period: '2026-04', periodDate: '2026-04-01', value: 105.8, unit: 'Points', unitCategory: 'index', frequency: 'M' },
      // Month 6
      { source: 'insee', dataset: 'test', indicator: 'ind', indicatorLabel: 'Ind', country: 'FR', countryIso3: 'FRA', countryLabel: 'France', period: '2026-05', periodDate: '2026-05-01', value: 107.5, unit: 'Points', unitCategory: 'index', frequency: 'M' },
      // Month 7
      { source: 'insee', dataset: 'test', indicator: 'ind', indicatorLabel: 'Ind', country: 'FR', countryIso3: 'FRA', countryLabel: 'France', period: '2026-06', periodDate: '2026-06-01', value: 108.4, unit: 'Points', unitCategory: 'index', frequency: 'M' },
      // Month 8 (immediate previous: 109.77, so delta to 112.4 is +2.4%)
      { source: 'insee', dataset: 'test', indicator: 'ind', indicatorLabel: 'Ind', country: 'FR', countryIso3: 'FRA', countryLabel: 'France', period: '2026-07', periodDate: '2026-07-01', value: 109.77, unit: 'Points', unitCategory: 'index', frequency: 'M' },
      // Current point (Month 9 -> 8 consecutive increases)
      { source: 'insee', dataset: 'test', indicator: 'ind', indicatorLabel: 'Ind', country: 'FR', countryIso3: 'FRA', countryLabel: 'France', period: '2026-08', periodDate: '2026-08-01', value: 112.4, unit: 'Points', unitCategory: 'index', frequency: 'M' }
    ];

    const analysis = TimeSeriesAnalysisService.analyzeSeries(testObs, 'FR')!;
    assert.ok(analysis);

    // 1. Valeur actuelle
    assert.equal(analysis.currentValue, 112.4);
    assert.equal(analysis.formattedCurrentValue, '112,4');
    assert.equal(analysis.latestPeriod, '2026-08');

    // 2. Variation immédiate (+2,4 %)
    assert.ok(analysis.periodVariation);
    assert.equal(analysis.periodVariation.formattedDelta, '+2,4 %');
    assert.equal(analysis.periodVariation.isUp, true);

    // 3. Variation annuelle (+5,7 %)
    assert.ok(analysis.annualVariation);
    assert.equal(analysis.annualVariation.formattedDelta, '+5,7 %');
    assert.equal(analysis.annualVariation.isUp, true);

    // 4. Maximum et Minimum historiques
    assert.equal(analysis.historicalMax.value, 118.2);
    assert.equal(analysis.historicalMax.formattedValue, '118,2');
    assert.equal(analysis.historicalMin.value, 71.4);
    assert.equal(analysis.historicalMin.formattedValue, '71,4');

    // 5. Tendance consécutive
    assert.equal(analysis.trend.direction, 'up');
    assert.equal(analysis.trend.symbol, '↗');
    assert.equal(analysis.trend.consecutivePeriods, 8);
    assert.equal(analysis.trend.durationLabel, 'Hausse depuis 8 mois');

    // 6. Range position
    assert.ok(analysis.rangePositionPercent >= 0 && analysis.rangePositionPercent <= 100);
  });

  test('Correctly identifies quarterly downward trend streak', () => {
    const quarterlyObs: EconomicObservation[] = [
      { source: 'eurostat', dataset: 'd', indicator: 'i', indicatorLabel: 'I', country: 'DE', countryIso3: 'DEU', countryLabel: 'Germany', period: '2025-Q1', value: 100, unit: '%', unitCategory: 'percent', frequency: 'Q' },
      { source: 'eurostat', dataset: 'd', indicator: 'i', indicatorLabel: 'I', country: 'DE', countryIso3: 'DEU', countryLabel: 'Germany', period: '2025-Q2', value: 98, unit: '%', unitCategory: 'percent', frequency: 'Q' },
      { source: 'eurostat', dataset: 'd', indicator: 'i', indicatorLabel: 'I', country: 'DE', countryIso3: 'DEU', countryLabel: 'Germany', period: '2025-Q3', value: 95, unit: '%', unitCategory: 'percent', frequency: 'Q' },
      { source: 'eurostat', dataset: 'd', indicator: 'i', indicatorLabel: 'I', country: 'DE', countryIso3: 'DEU', countryLabel: 'Germany', period: '2025-Q4', value: 92, unit: '%', unitCategory: 'percent', frequency: 'Q' }
    ];

    const analysis = TimeSeriesAnalysisService.analyzeSeries(quarterlyObs, 'DE')!;
    assert.ok(analysis);
    assert.equal(analysis.trend.direction, 'down');
    assert.equal(analysis.trend.symbol, '↘');
    assert.equal(analysis.trend.consecutivePeriods, 3);
    assert.equal(analysis.trend.durationLabel, 'Baisse depuis 3 trimestres');
  });

  test('Correctly identifies annual stability trend', () => {
    const annualObs: EconomicObservation[] = [
      { source: 'imf', dataset: 'd', indicator: 'i', indicatorLabel: 'I', country: 'US', countryIso3: 'USA', countryLabel: 'United States', period: '2024', value: 3.5, unit: '%', unitCategory: 'percent', frequency: 'A' },
      { source: 'imf', dataset: 'd', indicator: 'i', indicatorLabel: 'I', country: 'US', countryIso3: 'USA', countryLabel: 'United States', period: '2025', value: 3.5, unit: '%', unitCategory: 'percent', frequency: 'A' },
      { source: 'imf', dataset: 'd', indicator: 'i', indicatorLabel: 'I', country: 'US', countryIso3: 'USA', countryLabel: 'United States', period: '2026', value: 3.5, unit: '%', unitCategory: 'percent', frequency: 'A' }
    ];

    const analysis = TimeSeriesAnalysisService.analyzeSeries(annualObs, 'US')!;
    assert.ok(analysis);
    assert.equal(analysis.trend.direction, 'stable');
    assert.equal(analysis.trend.symbol, '→');
    assert.equal(analysis.trend.consecutivePeriods, 2);
    assert.equal(analysis.trend.durationLabel, 'Stable depuis 2 ans');
  });

  test('Handles multi-country observation arrays seamlessly', () => {
    const mixedObs: EconomicObservation[] = [
      { source: 'insee', dataset: 'd', indicator: 'i', indicatorLabel: 'I', country: 'FR', countryIso3: 'FRA', countryLabel: 'France', period: '2025', value: 1.1, unit: '%', unitCategory: 'percent', frequency: 'A' },
      { source: 'insee', dataset: 'd', indicator: 'i', indicatorLabel: 'I', country: 'FR', countryIso3: 'FRA', countryLabel: 'France', period: '2026', value: 1.4, unit: '%', unitCategory: 'percent', frequency: 'A' },
      { source: 'destatis', dataset: 'd', indicator: 'i', indicatorLabel: 'I', country: 'DE', countryIso3: 'DEU', countryLabel: 'Germany', period: '2025', value: 0.2, unit: '%', unitCategory: 'percent', frequency: 'A' },
      { source: 'destatis', dataset: 'd', indicator: 'i', indicatorLabel: 'I', country: 'DE', countryIso3: 'DEU', countryLabel: 'Germany', period: '2026', value: 0.1, unit: '%', unitCategory: 'percent', frequency: 'A' }
    ];

    const map = TimeSeriesAnalysisService.analyzeAllCountries(mixedObs);
    assert.equal(map.size, 2);
    assert.ok(map.has('FR'));
    assert.ok(map.has('DE'));

    const fr = map.get('FR')!;
    assert.equal(fr.currentValue, 1.4);
    assert.equal(fr.trend.direction, 'up');

    const de = map.get('DE')!;
    assert.equal(de.currentValue, 0.1);
    assert.equal(de.trend.direction, 'down');
  });
});
