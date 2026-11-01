import { describe, expect, it } from 'vitest';
import { vigencia } from './vigencia';

const ahora = new Date('2026-10-21T14:00:00-03:00');
const en = (minutos: number) => new Date(ahora.getTime() + minutos * 60_000);

describe('vigencia', () => {
  it.each([
    [6 * 60, 'Vence en 6 h', 'warning'],
    [6 * 60 + 59, 'Vence en 6 h', 'warning'],
    [45, 'Vence en 45 min', 'warning'],
    [1, 'Vence en 1 min', 'warning'],
    [23 * 60 + 59, 'Vence en 23 h', 'warning'],
    [24 * 60, 'Vence en 1 día', 'success'],
    [2 * 24 * 60 + 30, 'Vence en 2 días', 'success'],
  ] as const)('a %i minutos dice «%s» con tono %s', (minutos, texto, tono) => {
    expect(vigencia(en(minutos), ahora)).toEqual({ texto, tono, vencida: false });
  });

  it('dice «Vencida» al llegar la hora de expiración y después', () => {
    expect(vigencia(ahora, ahora)).toEqual({ texto: 'Vencida', tono: 'danger', vencida: true });
    expect(vigencia(en(-90), ahora)).toEqual({ texto: 'Vencida', tono: 'danger', vencida: true });
  });

  it('acepta la fecha de expiración en ISO 8601, como la entrega la API', () => {
    expect(vigencia(en(120).toISOString(), ahora).texto).toBe('Vence en 2 h');
  });
});
