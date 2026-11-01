/** Tono del chip de vigencia: amarillo con menos de 24 h, verde desde 24 h (PLAN.md, decisión 22). */
export type TonoVigencia = 'warning' | 'success' | 'danger';

export interface Vigencia {
  texto: string;
  tono: TonoVigencia;
  vencida: boolean;
}

const MINUTO = 60_000;
const HORA = 60 * MINUTO;
const DIA = 24 * HORA;

/**
 * Cuenta regresiva de una cotización a partir de `expiraEn` («Vence en 6 h», «Vence en 2 días»,
 * «Vencida»). El cliente la recalcula cada minuto; la API decide igual si una cotización venció.
 */
export function vigencia(expiraEn: Date | string, ahora: Date = new Date()): Vigencia {
  const resta = new Date(expiraEn).getTime() - ahora.getTime();
  if (resta <= 0) return { texto: 'Vencida', tono: 'danger', vencida: true };
  if (resta >= DIA) {
    const dias = Math.floor(resta / DIA);
    return {
      texto: `Vence en ${dias} ${dias === 1 ? 'día' : 'días'}`,
      tono: 'success',
      vencida: false,
    };
  }
  const texto =
    resta >= HORA
      ? `Vence en ${Math.floor(resta / HORA)} h`
      : `Vence en ${Math.max(1, Math.floor(resta / MINUTO))} min`;
  return { texto, tono: 'warning', vencida: false };
}
