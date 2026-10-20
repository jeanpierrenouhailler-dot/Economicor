import test from 'node:test';
import assert from 'node:assert';
import { queryService } from '../src/services/QueryService';
import { SourceRouter, MACRO_HEXAGON_CONCEPTS } from '../src/services/SourceRouter';
import { UNIFIED_INDICATORS } from '../src/models/Indicator';

test('QueryService - 12 Structural Providers Registered', () => {
  const providers = queryService.getAllProviders();
  assert.strictEqual(providers.length, 12, 'Must have exactly 12 registered data providers');

  const providerIds = providers.map(p => p.id).sort();
  const expectedIds = [
    'bis',
    'bls',
    'ecb',
    'eia',
    'eurostat',
    'fao',
    'fred',
    'imf',
    'insee',
    'oecd',
    'undata',
    'worldbank'
  ].sort();

  assert.deepStrictEqual(providerIds, expectedIds);
});

test('SourceRouter - Optimal Source Resolution for France (FR)', () => {
  // 1. PIB -> INSEE
  const gdp = SourceRouter.resolveBestSource('gdp', 'FR');
  assert.strictEqual(gdp.source, 'insee');
  assert.strictEqual(gdp.indicatorId, 'insee_gdp_growth');

  // 2. Inflation -> INSEE (IPC France)
  const infl = SourceRouter.resolveBestSource('inflation', 'FR');
  assert.strictEqual(infl.source, 'insee');
  assert.strictEqual(infl.indicatorId, 'insee_cpi');

  // 3. Chômage -> INSEE (BIT)
  const unemp = SourceRouter.resolveBestSource('unemployment', 'FR');
  assert.strictEqual(unemp.source, 'insee');
  assert.strictEqual(unemp.indicatorId, 'insee_unemployment');

  // 4. Dette -> INSEE (Maastricht)
  const debt = SourceRouter.resolveBestSource('debt', 'FR');
  assert.strictEqual(debt.source, 'insee');
  assert.strictEqual(debt.indicatorId, 'insee_public_debt');

  // 5. Taux directeur -> ECB (BCE MRO)
  const rate = SourceRouter.resolveBestSource('policy_rate', 'FR');
  assert.strictEqual(rate.source, 'ecb');
  assert.strictEqual(rate.indicatorId, 'ecb_refinancing_rate');

  // 6. Immobilier -> INSEE (Notaires-Insee)
  const housing = SourceRouter.resolveBestSource('housing', 'FR');
  assert.strictEqual(housing.source, 'insee');
  assert.strictEqual(housing.indicatorId, 'insee_housing_index');
});

test('SourceRouter - Optimal Source Resolution for United States (US)', () => {
  // Policy rate -> FRED Fed Funds
  const rate = SourceRouter.resolveBestSource('policy_rate', 'US');
  assert.strictEqual(rate.source, 'fred');
  assert.strictEqual(rate.indicatorId, 'fred_fed_funds_rate');

  // Housing -> FRED Case-Shiller
  const housing = SourceRouter.resolveBestSource('housing', 'US');
  assert.strictEqual(housing.source, 'fred');
  assert.strictEqual(housing.indicatorId, 'fred_case_shiller_housing');

  // Inflation -> BLS CPI-U
  const infl = SourceRouter.resolveBestSource('inflation', 'US');
  assert.strictEqual(infl.source, 'bls');
  assert.strictEqual(infl.indicatorId, 'bls_cpi_u');

  // Unemployment -> BLS U-3
  const unemp = SourceRouter.resolveBestSource('unemployment', 'US');
  assert.strictEqual(unemp.source, 'bls');
  assert.strictEqual(unemp.indicatorId, 'bls_unemployment_u3');
});

test('SourceRouter - Specialized Commodity & Global Topics', () => {
  // Énergie -> EIA Brent
  const energy = SourceRouter.resolveBestSource('energy', 'FR');
  assert.strictEqual(energy.source, 'eia');

  // Alimentation -> FAO Food Price Index
  const food = SourceRouter.resolveBestSource('food', 'FR');
  assert.strictEqual(food.source, 'fao');

  // Démographie -> UN Data
  const pop = SourceRouter.resolveBestSource('population', 'FR');
  assert.strictEqual(pop.source, 'undata');
});

test('SourceRouter - Cockpit Macro Resolution (6 Piliers)', () => {
  const cockpit = SourceRouter.resolveCockpit(MACRO_HEXAGON_CONCEPTS, 'FR');
  assert.strictEqual(cockpit.length, 6);

  const conceptIds = cockpit.map(c => c.conceptId);
  assert.deepStrictEqual(conceptIds, ['gdp', 'inflation', 'unemployment', 'debt', 'policy_rate', 'housing']);

  // Check queries creation
  const queries = SourceRouter.buildQueries(cockpit, 'FR');
  assert.strictEqual(queries.length, 6);
  assert.strictEqual(queries[0].countries?.[0], 'FR');
});
