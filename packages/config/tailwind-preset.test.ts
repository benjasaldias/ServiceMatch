import { describe, expect, it } from 'vitest';
import preset, { temas, tonos } from './tailwind-preset';

type Tema = keyof typeof temas;

const PESOS = [0.2126, 0.7152, 0.0722] as const;

function luminancia(hex: string): number {
  return PESOS.reduce((suma, peso, i) => {
    const c = parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16) / 255;
    return suma + peso * (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  }, 0);
}

function contraste(a: string, b: string): number {
  const [la, lb] = [luminancia(a), luminancia(b)];
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** `color` con alfa `alfa` sobre `fondo`, como lo pinta el navegador. */
function mezclar(color: string, fondo: string, alfa: number): string {
  const canal = (hex: string, i: number) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16);
  const rgb = [0, 1, 2].map((i) =>
    Math.round(canal(fondo, i) + (canal(color, i) - canal(fondo, i)) * alfa),
  );
  return `#${rgb.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

function token(tema: Tema, nombre: string): string {
  const valor = temas[tema][nombre];
  if (!valor) throw new Error(`Falta el token ${nombre} en el tema ${tema}`);
  return valor;
}

const SUPERFICIES = ['bg', 'surface', 'card', 'elevated', 'campo'];
const RELLENOS = ['primary', 'primary-soft', 'info', 'success', 'warning', 'danger', 'purple'];

const pares = (textos: string[], fondos: string[]) =>
  textos.flatMap((texto) => fondos.map((fondo) => [texto, fondo] as const));

describe('tema claro (principal)', () => {
  it.each(pares(['text', 'text-muted', 'text-dim', 'primary-strong'], SUPERFICIES))(
    '%s sobre %s cumple AA (4,5:1)',
    (texto, fondo) => {
      expect(contraste(token('light', texto), token('light', fondo))).toBeGreaterThanOrEqual(4.5);
    },
  );

  it.each(pares(['primary-titulo'], ['bg', 'card']))(
    '%s sobre %s cumple AA para texto grande (3:1)',
    (texto, fondo) => {
      expect(contraste(token('light', texto), token('light', fondo))).toBeGreaterThanOrEqual(3);
    },
  );

  it.each(pares(['tinta', 'contorno'], SUPERFICIES))(
    'el borde %s sobre %s se distingue (3:1)',
    (borde, fondo) => {
      expect(contraste(token('light', borde), token('light', fondo))).toBeGreaterThanOrEqual(3);
    },
  );
});

describe('tema oscuro (valores de los mockups)', () => {
  it('conserva los colores medidos en los mockups', () => {
    expect(temas.dark).toMatchObject({
      bg: '#1F2638',
      surface: '#192032',
      card: '#273246',
      elevated: '#343E57',
      campo: '#232B40',
      text: '#EEF3FB',
      'text-muted': '#A8B1C4',
      primary: '#FFAD7B',
      'primary-soft': '#FFDCC2',
    });
  });

  it.each(pares(['text', 'text-muted'], SUPERFICIES))(
    '%s sobre %s cumple AA (4,5:1)',
    (texto, fondo) => {
      expect(contraste(token('dark', texto), token('dark', fondo))).toBeGreaterThanOrEqual(4.5);
    },
  );

  // `text-dim` no se usa sobre `elevated` (queda en 3,7:1); ver docs/mockups/medidas.md.
  it.each(pares(['text-dim', 'primary-strong'], ['bg', 'surface', 'card', 'campo']))(
    '%s sobre %s cumple AA (4,5:1)',
    (texto, fondo) => {
      expect(contraste(token('dark', texto), token('dark', fondo))).toBeGreaterThanOrEqual(4.5);
    },
  );
});

describe.each(['light', 'dark'] as const)('tema %s', (tema) => {
  it.each(RELLENOS)('el texto tinta sobre el relleno %s cumple AA', (relleno) => {
    expect(contraste(token(tema, 'primary-ink'), token(tema, relleno))).toBeGreaterThanOrEqual(4.5);
  });

  it('el chip seleccionado cumple AA', () => {
    expect(
      contraste(token(tema, 'seleccion-ink'), token(tema, 'seleccion')),
    ).toBeGreaterThanOrEqual(4.5);
  });

  const casos = Object.entries(tonos(tema)).flatMap(([nombre, t]) =>
    ['bg', 'surface', 'card'].map((fondo) => [nombre, fondo, t] as const),
  );

  it.each(casos)('el tono %s sobre %s cumple AA', (_nombre, fondo, t) => {
    const tinte = mezclar(t.tinte, token(tema, fondo), t.alfa);
    expect(contraste(t.fg, tinte)).toBeGreaterThanOrEqual(4.5);
  });
});

describe('nombres de utilidades', () => {
  const colores = Object.keys(preset.theme.colors);

  it.each([
    ['shadow', Object.keys(preset.theme.boxShadow)],
    ['text', Object.keys(preset.theme.extend.fontSize)],
    ['border', Object.keys(preset.theme.extend.borderWidth)],
  ])('las claves de %s-* no chocan con un color', (_prefijo, claves) => {
    expect(claves.filter((clave) => colores.includes(clave))).toEqual([]);
  });
});
