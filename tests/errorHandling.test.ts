import test from 'node:test';
import assert from 'node:assert';
import { ApiError } from '../src/api/core/ApiError';

test('ApiError - Error codes and user-friendly messages', () => {
  const err1 = new ApiError('Downstream down', 'API_UNAVAILABLE', { source: 'eurostat' });
  assert.strictEqual(err1.code, 'API_UNAVAILABLE');
  assert.ok(err1.userFriendlyMessage.includes('EUROSTAT'));

  const err2 = new ApiError('Not found', 'DATASET_UNAVAILABLE');
  assert.ok(err2.userFriendlyMessage.includes('dataset could not be found'));

  const err3 = new ApiError('No data', 'NO_DATA_FOR_PERIOD');
  assert.ok(err3.userFriendlyMessage.includes('time period'));
});
