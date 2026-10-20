import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { RadarService } from '../src/services/RadarService';

describe('Economic Radar', () => {
  test('All radar countries are properly loaded', () => {
    const countries = RadarService.getAllCountries();
    assert.ok(countries.length >= 6);
    assert.ok(countries.some(c => c.code === 'FR'));
    assert.ok(countries.some(c => c.code === 'US'));
    assert.ok(countries.some(c => c.code === 'CN'));
    assert.ok(countries.some(c => c.code === 'EU'));
    assert.ok(countries.some(c => c.code === 'JP'));
    assert.ok(countries.some(c => c.code === 'IN'));
  });

  test('France metrics match exact requested 7 indicator trajectories', () => {
    const fr = RadarService.getCountry('FR');
    assert.equal(fr.code, 'FR');
    assert.equal(fr.flag, '🇫🇷');

    // Croissance ↗
    assert.equal(fr.metrics.Croissance.direction, 'up');
    assert.equal(fr.metrics.Croissance.symbol, '↗');
    assert.equal(fr.metrics.Croissance.formattedValue, '0,8 %');
    assert.equal(fr.metrics.Croissance.sourceName, 'INSEE');

    // Inflation ↘
    assert.equal(fr.metrics.Inflation.direction, 'down');
    assert.equal(fr.metrics.Inflation.symbol, '↘');
    assert.equal(fr.metrics.Inflation.formattedValue, '1,7 %');
    assert.equal(fr.metrics.Inflation.sourceName, 'INSEE');

    // Chômage →
    assert.equal(fr.metrics.Chômage.direction, 'stable');
    assert.equal(fr.metrics.Chômage.symbol, '→');
    assert.equal(fr.metrics.Chômage.formattedValue, '7,4 %');

    // Dette ↗
    assert.equal(fr.metrics.Dette.direction, 'up');
    assert.equal(fr.metrics.Dette.symbol, '↗');
    assert.equal(fr.metrics.Dette.formattedValue, '114 % PIB');

    // Immobilier →
    assert.equal(fr.metrics.Immobilier.direction, 'stable');
    assert.equal(fr.metrics.Immobilier.symbol, '→');
    assert.equal(fr.metrics.Immobilier.formattedValue, '+0,6 %');

    // Industrie ↘
    assert.equal(fr.metrics.Industrie.direction, 'down');
    assert.equal(fr.metrics.Industrie.symbol, '↘');
    assert.equal(fr.metrics.Industrie.formattedValue, '-0,3 %');

    // Exportations ↗
    assert.equal(fr.metrics.Exportations.direction, 'up');
    assert.equal(fr.metrics.Exportations.symbol, '↗');
    assert.equal(fr.metrics.Exportations.formattedValue, '+2,1 %');
  });

  test('Methodology is fully transparent without opaque scores', () => {
    const fr = RadarService.getCountry('FR');
    for (const cat of RadarService.getCategories()) {
      const metric = fr.metrics[cat];
      assert.ok(metric.methodology.length > 20, `Methodology for ${cat} should be detailed`);
      assert.ok(metric.methodologyStandard.length > 3, `Standard for ${cat} should be specified`);
      assert.ok(metric.sourceName.length > 2, `Source for ${cat} should be specified`);
      assert.ok(metric.formattedValue.length > 0, `Value for ${cat} should be formatted`);
    }
  });

  test('Trajectory filtering correctly isolates matching countries', () => {
    const growing = RadarService.filterByTrajectory('Croissance', 'up');
    assert.ok(growing.some(c => c.code === 'FR'));
    assert.ok(growing.some(c => c.code === 'US'));
    assert.ok(growing.some(c => c.code === 'IN'));

    const coolingInflation = RadarService.filterByTrajectory('Inflation', 'down');
    assert.ok(coolingInflation.some(c => c.code === 'FR'));
    assert.ok(coolingInflation.some(c => c.code === 'US'));
    assert.ok(coolingInflation.some(c => c.code === 'EU'));
  });
});
