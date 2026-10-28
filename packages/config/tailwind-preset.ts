import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

/**
 * Fuente única de tokens de ServiceMatch, medidos sobre los mockups (docs/mockups/medidas.md).
 *
 * - Tema claro: principal y por defecto. Traduce el estilo de los mockups a superficies claras con
 *   los mismos pastel, el mismo naranjo, bordes de tinta de 2 px y sombras duras.
 * - Tema oscuro: los valores medidos en los mockups, opcional con `data-theme="dark"` en <html>.
 *
 * Los colores se publican como variables CSS en canales RGB para que Tailwind pueda aplicar
 * opacidad (`bg-tinta/40`). Los tonos de estado (chips, avisos) se definen aquí y nunca a mano.
 */

type Hex = `#${string}`;
type Tema = 'light' | 'dark';

/** Los cinco pastel del UI kit: rellenos sólidos (tags, avatares, pines, botones Éxito y Peligro). */
const PASTEL = {
  info: '#A9D7FD',
  success: '#A9EBC5',
  warning: '#FEE099',
  danger: '#FE9D9E',
  purple: '#CEC3FD',
} as const satisfies Record<string, Hex>;

type Estado = keyof typeof PASTEL;
const ESTADOS = Object.keys(PASTEL) as Estado[];

/** En claro el pastel no alcanza contraste como texto: texto y borde de los tonos usan este tono profundo. */
const PROFUNDO_CLARO: Record<Estado | 'primary', Hex> = {
  info: '#1A5C93',
  success: '#176B40',
  warning: '#83520C',
  danger: '#A72429',
  purple: '#4C37A3',
  // `primary-strong` queda bajo 4,5:1 sobre el tinte naranjo; En ejecución usa este.
  primary: '#9A3B0B',
};

const BASE: Record<Tema, Record<string, Hex>> = {
  light: {
    bg: '#F3F5FA',
    surface: '#E9EDF4',
    card: '#FFFFFF',
    'card-hover': '#F8FAFD',
    elevated: '#EDF1F7',
    campo: '#F7F9FC',
    tinta: '#1A2234',
    linea: '#D5DCE6',
    contorno: '#737E92',
    punto: '#E6E8EE',
    text: '#1A2234',
    'text-muted': '#4A556B',
    'text-dim': '#5F6A80',
    primary: '#FFAD7B',
    'primary-hover': '#FFA16B',
    'primary-soft': '#FFDCC2',
    'primary-ink': '#1A2234',
    'primary-strong': '#B04612',
    'primary-titulo': '#D45A1A',
    seleccion: '#1A2234',
    'seleccion-ink': '#FFFFFF',
    claro: '#FFFFFF',
    rating: '#FEE099',
    'rating-borde': '#1A2234',
    neutral: '#8792A8',
  },
  dark: {
    bg: '#1F2638',
    surface: '#192032',
    card: '#273246',
    'card-hover': '#2E3950',
    elevated: '#343E57',
    campo: '#232B40',
    tinta: '#0B101C',
    linea: '#4A5569',
    contorno: '#7D89A1',
    punto: '#262D3E',
    text: '#EEF3FB',
    'text-muted': '#A8B1C4',
    // El mockup usa #76829A, que queda en 3,3:1 sobre tarjeta. Este es el más cercano con AA.
    'text-dim': '#8E9AB0',
    primary: '#FFAD7B',
    'primary-hover': '#FFBD93',
    'primary-soft': '#FFDCC2',
    'primary-ink': '#1A2234',
    'primary-strong': '#FFAD7B',
    'primary-titulo': '#FFAD7B',
    seleccion: '#F2F5FC',
    'seleccion-ink': '#1A2234',
    claro: '#F2F5FC',
    rating: '#FEE099',
    'rating-borde': '#FEE099',
    neutral: '#8792A8',
  },
};

/**
 * Tonos de chips de estado y avisos: texto y borde de 1,5 px en `fg`, fondo `tinte` con alfa.
 * En los mockups el fondo es el color al 12 % sobre la superficie que haya debajo; en claro, el
 * pastel al 30 %. `dim` (Cancelado, No disponible) va sin relleno para que su texto apagado
 * mantenga 4,5:1. Ningún tono va sobre `elevated`.
 */
const TONOS = [...ESTADOS, 'primary', 'neutral', 'dim'] as const;
type Tono = (typeof TONOS)[number];

function tono(tema: Tema, t: Tono): { fg: Hex; tinte: Hex; alfa: number } {
  const base = BASE[tema];
  const claro = tema === 'light';
  if (t === 'neutral') {
    const c = base['text-muted'] as Hex;
    return { fg: c, tinte: c, alfa: claro ? 0.1 : 0.12 };
  }
  if (t === 'dim') {
    const c = base['text-dim'] as Hex;
    return { fg: c, tinte: c, alfa: 0 };
  }
  const tinte = t === 'primary' ? (base.primary as Hex) : PASTEL[t];
  return { fg: claro ? PROFUNDO_CLARO[t] : tinte, tinte, alfa: claro ? 0.3 : 0.12 };
}

function construirTema(tema: Tema): Record<string, Hex> {
  const tokens: Record<string, Hex> = { ...BASE[tema] };
  for (const e of ESTADOS) {
    tokens[e] = PASTEL[e];
    tokens[`${e}-fg`] = tono(tema, e).fg;
  }
  return tokens;
}

export const temas: Record<Tema, Record<string, Hex>> = {
  light: construirTema('light'),
  dark: construirTema('dark'),
};

export const tonos = (tema: Tema) =>
  Object.fromEntries(TONOS.map((t) => [t, tono(tema, t)])) as Record<Tono, ReturnType<typeof tono>>;

const canales = (hex: Hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(' ');

const variables = (tema: Tema) => ({
  ...Object.fromEntries(Object.entries(temas[tema]).map(([k, v]) => [`--${k}`, canales(v)])),
  ...Object.fromEntries(
    TONOS.flatMap((t) => {
      const { fg, tinte, alfa } = tono(tema, t);
      return [
        [`--tono-${t}-fg`, canales(fg)],
        [`--tono-${t}-tinte`, canales(tinte)],
        [`--tono-${t}-alfa`, String(alfa)],
      ];
    }),
  ),
});

const color = (token: string) => `rgb(var(--${token}) / <alpha-value>)`;

const grupoEstado = (e: Estado) => ({ DEFAULT: color(e), fg: color(`${e}-fg`) });

const sombraDura = (px: number) => `${px}px ${px}px 0 0 rgb(var(--tinta))`;

export default {
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    // Reemplaza la paleta de Tailwind: en la app solo existen estos tokens.
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      bg: color('bg'),
      surface: color('surface'),
      card: { DEFAULT: color('card'), hover: color('card-hover') },
      elevated: color('elevated'),
      campo: color('campo'),
      tinta: color('tinta'),
      linea: color('linea'),
      contorno: color('contorno'),
      text: { DEFAULT: color('text'), muted: color('text-muted'), dim: color('text-dim') },
      primary: {
        DEFAULT: color('primary'),
        hover: color('primary-hover'),
        soft: color('primary-soft'),
        ink: color('primary-ink'),
        strong: color('primary-strong'),
        titulo: color('primary-titulo'),
      },
      seleccion: { DEFAULT: color('seleccion'), ink: color('seleccion-ink') },
      claro: color('claro'),
      rating: { DEFAULT: color('rating'), borde: color('rating-borde') },
      neutral: color('neutral'),
      info: grupoEstado('info'),
      success: grupoEstado('success'),
      warning: grupoEstado('warning'),
      danger: grupoEstado('danger'),
      purple: grupoEstado('purple'),
    },
    // Solo sombras duras de tinta, sin desenfoque (mockups): controles chicos, controles y tarjetas.
    // `tarjeta` y no `card`: `shadow-card` chocaría con la utilidad de color de sombra.
    boxShadow: {
      none: 'none',
      'control-sm': sombraDura(2),
      control: sombraDura(3),
      tarjeta: sombraDura(4),
    },
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      // Medidos en los mockups. Los pesos van incluidos para que el token baste por sí solo.
      fontSize: {
        'titulo-1': ['36px', { lineHeight: '44px', fontWeight: '700' }],
        'titulo-1-movil': ['28px', { lineHeight: '34px', fontWeight: '700' }],
        'titulo-seccion': ['20px', { lineHeight: '28px', fontWeight: '700' }],
        'titulo-tarjeta': ['18px', { lineHeight: '24px', fontWeight: '700' }],
        'titulo-panel': ['16px', { lineHeight: '22px', fontWeight: '700' }],
        cuerpo: ['14px', { lineHeight: '20px' }],
        etiqueta: ['12.5px', { lineHeight: '16px', fontWeight: '600' }],
        sobretitulo: ['12px', { lineHeight: '16px', letterSpacing: '0.08em' }],
        chip: ['11px', { lineHeight: '14px', fontWeight: '600' }],
        tag: ['10px', { lineHeight: '12px', letterSpacing: '0.04em', fontWeight: '700' }],
        monto: ['30px', { lineHeight: '36px', fontWeight: '700' }],
        'monto-fila': ['17px', { lineHeight: '22px', fontWeight: '700' }],
        metrica: ['30px', { lineHeight: '36px', fontWeight: '700' }],
      },
      borderRadius: { tarjeta: '14px', control: '10px', tag: '4px' },
      borderWidth: { 1.5: '1.5px' },
      borderColor: { DEFAULT: color('tinta') },
      ringColor: { DEFAULT: color('primary-strong') },
      spacing: { 18: '4.5rem', sidebar: '248px' },
    },
  },
  plugins: [
    plugin(({ addBase, addComponents }) => {
      addBase({
        ':root': { ...variables('light'), colorScheme: 'light' },
        '[data-theme="dark"]': { ...variables('dark'), colorScheme: 'dark' },
        '::placeholder': { color: 'rgb(var(--text-dim))', opacity: '1' },
      });
      addComponents({
        // Lienzo de las pantallas: grilla de puntos de 1 px cada 24 px.
        '.fondo-puntos': {
          backgroundColor: 'rgb(var(--bg))',
          backgroundImage:
            'radial-gradient(circle at center, rgb(var(--punto)) 1px, transparent 1.5px)',
          backgroundSize: '24px 24px',
        },
        // Sobretítulo mono en mayúsculas: ESPECIALIDAD, SOLICITUD #SM-1042…
        '.sobretitulo': {
          fontFamily: '"JetBrains Mono", ui-monospace, monospace',
          fontSize: '12px',
          lineHeight: '16px',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'rgb(var(--text-dim))',
        },
        // Tonos de estado para StatusChip y Alert: solo color; la forma la pone el componente.
        ...Object.fromEntries(
          TONOS.map((t) => [
            `.tono-${t}`,
            {
              color: `rgb(var(--tono-${t}-fg))`,
              borderColor: `rgb(var(--tono-${t}-fg))`,
              backgroundColor: `rgb(var(--tono-${t}-tinte) / var(--tono-${t}-alfa))`,
            },
          ]),
        ),
      });
    }),
  ],
} satisfies Partial<Config>;
