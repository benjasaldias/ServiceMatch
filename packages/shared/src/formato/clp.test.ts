import { describe, expect, it } from 'vitest';
import { formatearClp } from './clp';

describe('formatearClp', () => {
  it.each([
    [0, '$0'],
    [999, '$999'],
    [1500, '$1.500'],
    [25000, '$25.000'],
    [38000, '$38.000'],
    [41040, '$41.040'],
    [1234567, '$1.234.567'],
    [-3040, '-$3.040'],
  ])('%i → %s', (monto, esperado) => {
    expect(formatearClp(monto)).toBe(esperado);
  });

  it.each([41040.5, Number.NaN, Number.POSITIVE_INFINITY])('rechaza %s', (monto) => {
    expect(() => formatearClp(monto)).toThrow(RangeError);
  });
});
