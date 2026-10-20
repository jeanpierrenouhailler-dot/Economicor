import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { EconomicObservation } from '../src/models/Observation';
import { AnomalyDetectionService } from '../src/services/AnomalyDetectionService';

describe('AnomalyDetectionService', () => {
  test('Basic statistical helpers work accurately', () => {
    const vals = [2, 4, 4, 4, 5, 5, 7, 9];
    const mean = AnomalyDetectionService.mean(vals);
    assert.equal(mean, 5);

    const std = AnomalyDetectionService.standardDeviation(vals, mean);
    assert.ok(Math.abs(std - 2.138) < 0.01);

    const z = AnomalyDetectionService.zScore(9.27, 5, 2.138);
    assert.equal(z, 2.0);
  });

  test('Detects velocity surge matching user specification (France CPI 1.8% -> 3.1% in 3 months)', () => {
    // Normal stable trend around 1.8% with small variations (sigma ~ 0.3)
    const franceObs: EconomicObservation[] = [
      { source: 'insee', dataset: 'cpi', indicator: 'cpi', indicatorLabel: 'Inflation', country: 'FR', countryIso3: 'FRA', countryLabel: 'France', period: '2025-10', periodDate: '2025-10-01', value: 1.7, unit: '%', unitCategory: 'percent', frequency: 'M' },
      { source: 'insee', dataset: 'cpi', indicator: 'cpi', indicatorLabel: 'Inflation', country: 'FR', countryIso3: 'FRA', countryLabel: 'France', period: '2025-11', periodDate: '2025-11-01', value: 1.8, unit: '%', unitCategory: 'percent', frequency: 'M' },
      { source: 'insee', dataset: 'cpi', indicator: 'cpi', indicatorLabel: 'Inflation', country: 'FR', countryIso3: 'FRA', countryLabel: 'France', period: '2025-12', periodDate: '2025-12-01', value: 1.7, unit: '%', unitCategory: 'percent', frequency: 'M' },
      { source: 'insee', dataset: 'cpi', indicator: 'cpi', indicatorLabel: 'Inflation', country: 'FR', countryIso3: 'FRA', countryLabel: 'France', period: '2026-01', periodDate: '2026-01-01', value: 1.8, unit: '%', unitCategory: 'percent', frequency: 'M' },
      { source: 'insee', dataset: 'cpi', indicator: 'cpi', indicatorLabel: 'Inflation', country: 'FR', countryIso3: 'FRA', countryLabel: 'France', period: '2026-02', periodDate: '2026-02-01', value: 1.9, unit: '%', unitCategory: 'percent', frequency: 'M' },
      { source: 'insee', dataset: 'cpi', indicator: 'cpi', indicatorLabel: 'Inflation', country: 'FR', countryIso3: 'FRA', countryLabel: 'France', period: '2026-03', periodDate: '2026-03-01', value: 1.8, unit: '%', unitCategory: 'percent', frequency: 'M' },
      { source: 'insee', dataset: 'cpi', indicator: 'cpi', indicatorLabel: 'Inflation', country: 'FR', countryIso3: 'FRA', countryLabel: 'France', period: '2026-04', periodDate: '2026-04-01', value: 1.8, unit: '%', unitCategory: 'percent', frequency: 'M' },
      { source: 'insee', dataset: 'cpi', indicator: 'cpi', indicatorLabel: 'Inflation', country: 'FR', countryIso3: 'FRA', countryLabel: 'France', period: '2026-05', periodDate: '2026-05-01', value: 1.8, unit: '%', unitCategory: 'percent', frequency: 'M' },
      // 3-month sudden spike to 3.1%
      { source: 'insee', dataset: 'cpi', indicator: 'cpi', indicatorLabel: 'Inflation', country: 'FR', countryIso3: 'FRA', countryLabel: 'France', period: '2026-06', periodDate: '2026-06-01', value: 2.2, unit: '%', unitCategory: 'percent', frequency: 'M' },
      { source: 'insee', dataset: 'cpi', indicator: 'cpi', indicatorLabel: 'Inflation', country: 'FR', countryIso3: 'FRA', countryLabel: 'France', period: '2026-07', periodDate: '2026-07-01', value: 2.6, unit: '%', unitCategory: 'percent', frequency: 'M' },
      { source: 'insee', dataset: 'cpi', indicator: 'cpi', indicatorLabel: 'Inflation', country: 'FR', countryIso3: 'FRA', countryLabel: 'France', period: '2026-08', periodDate: '2026-08-01', value: 3.1, unit: '%', unitCategory: 'percent', frequency: 'M' }
    ];

    const anomalies = AnomalyDetectionService.detectAnomalies(franceObs);
    assert.ok(anomalies.length > 0);

    const surge = anomalies.find(a => a.type === 'velocity_surge');
    assert.ok(surge);
    assert.equal(surge.countryCode, 'FR');
    assert.equal(surge.currentValue, 3.1);
    assert.equal(surge.previousValue, 1.8);
    assert.ok(surge.headline.includes('1,8'));
    assert.ok(surge.headline.includes('3,1'));
    assert.ok(surge.headline.includes('trois mois') || surge.headline.includes('3 mois'));
    assert.ok(surge.zScore >= 2.0);
    assert.ok(surge.statisticalDetail.includes('σ'));
  });

  test('Detects historical record variation (German property quarterly record since 2010)', () => {
    const germanHousingObs: EconomicObservation[] = [
      { source: 'destatis', dataset: 'hpi', indicator: 'hpi', indicatorLabel: 'Immobilier', country: 'DE', countryIso3: 'DEU', countryLabel: 'Allemagne', period: '2010-Q1', value: 100.0, unit: 'pts', unitCategory: 'index', frequency: 'Q' },
      { source: 'destatis', dataset: 'hpi', indicator: 'hpi', indicatorLabel: 'Immobilier', country: 'DE', countryIso3: 'DEU', countryLabel: 'Allemagne', period: '2010-Q2', value: 100.8, unit: 'pts', unitCategory: 'index', frequency: 'Q' },
      { source: 'destatis', dataset: 'hpi', indicator: 'hpi', indicatorLabel: 'Immobilier', country: 'DE', countryIso3: 'DEU', countryLabel: 'Allemagne', period: '2010-Q3', value: 101.5, unit: 'pts', unitCategory: 'index', frequency: 'Q' },
      { source: 'destatis', dataset: 'hpi', indicator: 'hpi', indicatorLabel: 'Immobilier', country: 'DE', countryIso3: 'DEU', countryLabel: 'Allemagne', period: '2024-Q1', value: 105.0, unit: 'pts', unitCategory: 'index', frequency: 'Q' },
      { source: 'destatis', dataset: 'hpi', indicator: 'hpi', indicatorLabel: 'Immobilier', country: 'DE', countryIso3: 'DEU', countryLabel: 'Allemagne', period: '2024-Q2', value: 105.5, unit: 'pts', unitCategory: 'index', frequency: 'Q' },
      { source: 'destatis', dataset: 'hpi', indicator: 'hpi', indicatorLabel: 'Immobilier', country: 'DE', countryIso3: 'DEU', countryLabel: 'Allemagne', period: '2024-Q3', value: 106.0, unit: 'pts', unitCategory: 'index', frequency: 'Q' },
      { source: 'destatis', dataset: 'hpi', indicator: 'hpi', indicatorLabel: 'Immobilier', country: 'DE', countryIso3: 'DEU', countryLabel: 'Allemagne', period: '2024-Q4', value: 106.2, unit: 'pts', unitCategory: 'index', frequency: 'Q' },
      { source: 'destatis', dataset: 'hpi', indicator: 'hpi', indicatorLabel: 'Immobilier', country: 'DE', countryIso3: 'DEU', countryLabel: 'Allemagne', period: '2025-Q1', value: 106.5, unit: 'pts', unitCategory: 'index', frequency: 'Q' },
      // Sudden record quarterly drop of -4.5 points, larger than any prior quarterly delta
      { source: 'destatis', dataset: 'hpi', indicator: 'hpi', indicatorLabel: 'Immobilier', country: 'DE', countryIso3: 'DEU', countryLabel: 'Allemagne', period: '2025-Q2', value: 102.0, unit: 'pts', unitCategory: 'index', frequency: 'Q' }
    ];

    const anomalies = AnomalyDetectionService.detectAnomalies(germanHousingObs);
    const record = anomalies.find(a => a.type === 'historical_record');
    assert.ok(record);
    assert.equal(record.countryCode, 'DE');
    assert.equal(record.badge, '🔔 Variation inhabituelle');
    assert.ok(record.headline.includes('plus forte variation'));
    assert.ok(record.headline.includes('2010'));
  });

  test('Pre-populated Watchlist anomalies contains real headline cases', () => {
    const list = AnomalyDetectionService.getWatchlistAnomalies();
    assert.ok(list.length >= 4);

    const fr = list.find(a => a.countryCode === 'FR');
    assert.ok(fr);
    assert.equal(fr.headline, "L'inflation française augmente de 1,8 % → 3,1 % en trois mois.");
    assert.equal(fr.statisticalDetail, 'Écart à la tendance historique : +2,1σ');

    const de = list.find(a => a.countryCode === 'DE');
    assert.ok(de);
    assert.equal(de.headline, 'Les prix immobiliers allemands connaissent leur plus forte variation trimestrielle depuis 2010.');
  });

  test('Generates deterministic macroeconomic explanation with causes and implications', () => {
    const watchlist = AnomalyDetectionService.getWatchlistAnomalies();
    const frAnomaly = watchlist[0];

    const expl = AnomalyDetectionService.generateDeterministicExplanation(frAnomaly);
    assert.ok(expl.summary.length > 30);
    assert.ok(expl.likelyCauses.length >= 2);
    assert.ok(expl.macroImplications.length > 20);
    assert.ok(['transitoire', 'structurel', 'incertain'].includes(expl.persistenceOutlook));
  });
});
