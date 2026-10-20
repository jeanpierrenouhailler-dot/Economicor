import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { ScorecardService } from '../src/services/ScorecardService';

describe('Economic Intelligence Scorecard', () => {
  test('Supported countries are available', () => {
    const countries = ScorecardService.getSupportedCountries();
    assert.ok(countries.length >= 4);
    assert.ok(countries.some(c => c.code === 'FR'));
    assert.ok(countries.some(c => c.code === 'DE'));
    assert.ok(countries.some(c => c.code === 'US'));
  });

  test('France scorecard contains exact requested headline metrics', () => {
    const fr = ScorecardService.getScorecard('FR');
    assert.equal(fr.countryCode, 'FR');
    assert.equal(fr.flag, '🇫🇷');
    assert.equal(fr.lastUpdated, '27/09/2026');
    assert.equal(fr.headline.growth, '0,8 %');
    assert.equal(fr.headline.inflation, '1,7 %');
    assert.equal(fr.headline.unemployment, '7,4 %');
    assert.equal(fr.headline.debt, '114 % PIB');
    assert.equal(fr.headline.centralBankRate, '2,00 %');
  });

  test('France scorecard covers all 5 requested pillars with detailed metrics', () => {
    const fr = ScorecardService.getScorecard('FR');
    assert.equal(fr.pillars.length, 5);

    const pillarIds = fr.pillars.map(p => p.id);
    assert.deepEqual(pillarIds, ['macro', 'monetary', 'housing', 'labor', 'finance']);

    // Check Macro pillar metrics
    const macro = fr.pillars.find(p => p.id === 'macro')!;
    const macroMetricNames = macro.metrics.map(m => m.name);
    assert.ok(macroMetricNames.some(n => n.includes('PIB (Volume)')));
    assert.ok(macroMetricNames.some(n => n.includes('Croissance du PIB')));
    assert.ok(macroMetricNames.some(n => n.includes('Inflation (IPC)')));
    assert.ok(macroMetricNames.some(n => n.includes('Chômage')));
    assert.ok(macroMetricNames.some(n => n.includes('Dette publique / PIB')));
    assert.ok(macroMetricNames.some(n => n.includes('Déficit public / PIB')));
    assert.ok(macroMetricNames.some(n => n.includes('Balance commerciale')));
    assert.ok(macroMetricNames.some(n => n.includes('Consommation')));
    assert.ok(macroMetricNames.some(n => n.includes('Investissement')));

    // Check Monetary pillar metrics
    const monetary = fr.pillars.find(p => p.id === 'monetary')!;
    const monetaryMetricNames = monetary.metrics.map(m => m.name);
    assert.ok(monetaryMetricNames.some(n => n.includes('Taux BCE')));
    assert.ok(monetaryMetricNames.some(n => n.includes('Taux de crédit')));
    assert.ok(monetaryMetricNames.some(n => n.includes('Masse monétaire')));
    assert.ok(monetaryMetricNames.some(n => n.includes('Crédit au secteur privé')));

    // Check Housing pillar metrics
    const housing = fr.pillars.find(p => p.id === 'housing')!;
    const housingMetricNames = housing.metrics.map(m => m.name);
    assert.ok(housingMetricNames.some(n => n.includes('Prix de l’immobilier')));
    assert.ok(housingMetricNames.some(n => n.includes('Transactions')));
    assert.ok(housingMetricNames.some(n => n.includes('Mises en chantier')));
    assert.ok(housingMetricNames.some(n => n.includes('Permis de construire')));
    assert.ok(housingMetricNames.some(n => n.includes('Indice des Loyers')));

    // Check Labor pillar metrics
    const labor = fr.pillars.find(p => p.id === 'labor')!;
    const laborMetricNames = labor.metrics.map(m => m.name);
    assert.ok(laborMetricNames.some(n => n.includes('Taux d’emploi')));
    assert.ok(laborMetricNames.some(n => n.includes('Chômage')));
    assert.ok(laborMetricNames.some(n => n.includes('Salaire réel')));
    assert.ok(laborMetricNames.some(n => n.includes('Salaire nominal')));
    assert.ok(laborMetricNames.some(n => n.includes('Productivité')));

    // Check Finance pillar metrics
    const finance = fr.pillars.find(p => p.id === 'finance')!;
    const financeMetricNames = finance.metrics.map(m => m.name);
    assert.ok(financeMetricNames.some(n => n.includes('CAC 40')));
    assert.ok(financeMetricNames.some(n => n.includes('Taux OAT 10 ans')));
    assert.ok(financeMetricNames.some(n => n.includes('Spread OAT / Bund')));
    assert.ok(financeMetricNames.some(n => n.includes('Bund 10Y')));
  });

  test('Executive briefing formatting generates clean synthetic text', () => {
    const fr = ScorecardService.getScorecard('FR');
    const briefing = ScorecardService.formatExecutiveBriefing(fr);
    assert.ok(briefing.includes('🇫🇷 France — Situation économique'));
    assert.ok(briefing.includes('Croissance : 0,8 %'));
    assert.ok(briefing.includes('Inflation : 1,7 %'));
    assert.ok(briefing.includes('Chômage : 7,4 %'));
    assert.ok(briefing.includes('Dette : 114 % PIB'));
    assert.ok(briefing.includes('Taux BCE : 2,00 %'));
    assert.ok(briefing.includes('27/09/2026'));
  });

  test('Search filtering finds indicators by keyword across pillars', () => {
    const fr = ScorecardService.getScorecard('FR');
    const debtResults = ScorecardService.searchMetrics(fr, 'dette');
    assert.ok(debtResults.length >= 1);
    assert.ok(debtResults.some(r => r.name.toLowerCase().includes('dette')));

    const rentResults = ScorecardService.searchMetrics(fr, 'loyers');
    assert.ok(rentResults.length >= 1);
    assert.ok(rentResults.some(r => r.name.toLowerCase().includes('loyers')));
  });
});
