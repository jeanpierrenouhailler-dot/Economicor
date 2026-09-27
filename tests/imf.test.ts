import test from 'node:test';
import assert from 'node:assert';
import { IMFDataMapperParser } from '../src/api/imf/IMFDataMapper';
import { IMFMapper } from '../src/api/imf/IMFMapper';
import gdpFixture from '../src/fixtures/imf/gdp-growth.json';

test('IMFDataMapperParser - Parses nested IMF DataMapper v2 response', () => {
  const points = IMFDataMapperParser.parse(gdpFixture as any);
  assert.ok(points.length > 0, 'Points must not be empty');
  assert.ok(points.some(p => p.countryCode === 'FRA'), 'Must contain France');
  assert.strictEqual(typeof points[0].value, 'number');
});

test('IMFMapper - Maps IMF points to EconomicObservation[]', () => {
  const observations = IMFMapper.mapDataMapper(
    gdpFixture as any,
    { dataset: 'WEO', countries: ['FR', 'DE'], startPeriod: '2020', endPeriod: '2025' },
    'real_gdp_growth'
  );

  assert.ok(observations.length > 0, 'Observations must not be empty');
  assert.ok(observations.every(o => o.source === 'imf'), 'Source must be imf');
  assert.ok(observations.every(o => ['FR', 'DE'].includes(o.country)), 'Country codes must be normalized to ISO-2');
  assert.ok(observations.every(o => o.unit === '%'), 'Unit must be %');
  assert.ok(observations.every(o => o.period >= '2020' && o.period <= '2025'), 'Period must be filtered');
});
