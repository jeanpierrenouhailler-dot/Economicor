import test from 'node:test';
import assert from 'node:assert';
import { EurostatJsonStatParser } from '../src/api/eurostat/EurostatJsonStat';
import { EurostatMapper } from '../src/api/eurostat/EurostatMapper';
import hpiFixture from '../src/fixtures/eurostat/hpi.json';

test('EurostatJsonStatParser - Parses multidimensional JSON-stat dataset', () => {
  const items = EurostatJsonStatParser.parse(hpiFixture as any);
  assert.ok(items.length > 0, 'Parsed items must not be empty');
  assert.strictEqual(items[0].indices['geo'], 'FR');
  assert.strictEqual(typeof items[0].value, 'number');
});

test('EurostatMapper - Maps JSON-stat into unified EconomicObservation[]', () => {
  const observations = EurostatMapper.mapJsonStat(
    hpiFixture as any,
    { dataset: 'prc_hpi_q', countries: ['FR', 'DE'] },
    'house_price_index'
  );

  assert.ok(observations.length > 0, 'Observations must be created');
  assert.ok(observations.every(o => o.source === 'eurostat'), 'Source must be eurostat');
  assert.ok(observations.every(o => ['FR', 'DE'].includes(o.country)), 'Only requested countries must be included');
  assert.ok(observations[0].period.includes('-Q'), 'Period must be normalized quarterly format');
  assert.ok(typeof observations[0].value === 'number', 'Observation value must be numerical');
});
