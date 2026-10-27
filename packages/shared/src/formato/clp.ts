/**
 * Formatea un monto en pesos chilenos (§5.7): entero, punto de miles y símbolo pegado.
 * `formatearClp(41040)` → `"$41.040"`. Los montos son siempre enteros: un decimal es un error.
 */
export function formatearClp(monto: number): string {
  if (!Number.isSafeInteger(monto)) {
    throw new RangeError(`Monto CLP inválido: ${monto}. Los montos son enteros.`);
  }
  const signo = monto < 0 ? '-' : '';
  const miles = Math.abs(monto)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${signo}$${miles}`;
}
