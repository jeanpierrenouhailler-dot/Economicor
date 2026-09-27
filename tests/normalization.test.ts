import test from 'node:test';
import assert from 'node:assert';
import { NormalizationService } from '../src/services/NormalizationService';

test('NormalizationService - Country normalization', () => {
  // ISO-2
  const fr = NormalizationService.normalizeCountry('FR');
  assert.strictEqual(fr.name, 'France');
  assert.strictEqual(fr.iso3, 'FRA');
  assert.strictEqual(fr.flag, '🇫🇷');

  // ISO-3
  const de = NormalizationService.normalizeCountry('DEU');
  assert.strictEqual(de.code, 'DE');
  assert.strictEqual(de.name, 'Germany');

  // Eurostat aliases
  const eu = NormalizationService.normalizeCountry('EU27_2020');
  assert.strictEqual(eu.code, 'EU');

  // Name
  const it = NormalizationService.normalizeCountry('Italy');
  assert.strictEqual(it.code, 'IT');
  assert.strictEqual(it.iso3, 'ITA');
});

test('NormalizationService - Period normalization', () => {
  const q = NormalizationService.normalizePeriod('2024Q2');
  assert.strictEqual(q.period, '2024-Q2');
  assert.strictEqual(q.frequency, 'Q');

  const m = NormalizationService.normalizePeriod('2024-05');
  assert.strictEqual(m.period, '2024-05');
  assert.strictEqual(m.frequency, 'M');

  const a = NormalizationService.normalizePeriod('2025');
  assert.strictEqual(a.period, '2025');
  assert.strictEqual(a.frequency, 'A');
});

test('NormalizationService - Value normalization', () => {
  assert.strictEqual(NormalizationService.normalizeValue(123.456).value, 123.46);
  assert.strictEqual(NormalizationService.normalizeValue(':').value, null);
  assert.strictEqual(NormalizationService.normalizeValue('104.2 p').value, 104.2);
  assert.strictEqual(NormalizationService.normalizeValue('104.2 p').status, 'provisional');
  assert.strictEqual(NormalizationService.normalizeValue(null).value, null);
});

test('NormalizationService - Unit normalization and compatibility', () => {
  const pct = NormalizationService.normalizeUnit('%');
  assert.strictEqual(pct.category, 'percent');

  const idx = NormalizationService.normalizeUnit('Index 2015=100');
  assert.strictEqual(idx.category, 'index');

  assert.strictEqual(NormalizationService.areUnitsCompatible('%', '%'), true);
  assert.strictEqual(NormalizationService.areUnitsCompatible('%', 'Index 2015=100'), false);
});
