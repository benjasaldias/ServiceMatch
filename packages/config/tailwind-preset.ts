import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

/**
 * Fuente única de tokens de ServiceMatch (§5 y §17 del prompt).
 *
 * - Tema claro: principal y por defecto (decisión del equipo, 27-10-2026).
 * - Tema oscuro: la paleta de los mockups, opcional con `data-theme="dark"` en <html>.
 *
 * Los colores se publican como variables CSS en canales RGB para que Tailwind
 * pueda aplicar opacidad (`bg-primary-ink/40`). Los derivados de los chips
 * (fondo y borde) se calculan aquí y nunca a mano en las pantallas.
 * Contraste AA verificado para ambos temas; ver CLAUDE.md § Design system.
 */

type Hex = `#${string}`;
type Tema = 'light' | 'dark';

/** Los cinco pastel del UI kit: rellenos sólidos (badges, avatares, pines) en ambos temas. */
const PASTEL = {
  info: '#A9D7FD',
  success: '#A9EBC5',
  warning: '#FEE099',
  danger: '#FE9D9E',
  purple: '#CEC3FD',
} as const satisfies Record<string, Hex>;

type Estado = keyof typeof PASTEL;
const ESTADOS = Object.keys(PASTEL) as Estado[];

/** En tema claro el pastel no alcanza contraste como texto: se usa un tono profundo del mismo matiz. */
const TINTA_ESTADO_CLARO: Record<Estado, Hex> = {
  info: '#1A5C93',
  success: '#176B40',
  warning: '#83520C',
  danger: '#A72429',
  purple: '#4C37A3',
};

const BASE: Record<Tema, Record<string, Hex>> = {
  light: {
    bg: '#F4F6FA',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    'card-hover': '#F8FAFC',
    elevated: '#F1F4F8',
    border: '#DDE3EC',
    'border-soft': '#E9EDF3',
    'border-strong': '#7C879B',
    text: '#1A2234',
    'text-muted': '#4A556B',
    'text-dim': '#5F6A80',
    primary: '#FF8A47',
    'primary-hover': '#F57934',
    'primary-soft': '#FFE8D8',
    'primary-ink': '#1A2234',
    'primary-strong': '#B04612',
    'neutral-fg': '#4A556B',
    'neutral-bg': '#EEF1F5',
    'neutral-border': '#D3D9E3',
  },
  dark: {
    bg: '#192032',
    surface: '#1F2638',
    card: '#273246',
    'card-hover': '#2E3950',
    elevated: '#303B51',
    border: '#343E57',
    'border-soft': '#2B3550',
    'border-strong': '#7D89A1',
    text: '#EEF3FB',
    'text-muted': '#A8B1C4',
    // El mockup usa #76829A, que queda en 3,3:1 sobre tarjeta (no cumple AA).
    'text-dim': '#939EB4',
    primary: '#FFAD7B',
    'primary-hover': '#FFBD93',
    'primary-soft': '#FFDCC2',
    'primary-ink': '#1A2234',
    'primary-strong': '#FFAD7B',
    'neutral-fg': '#A8B1C4',
  },
};

/** Mezcla `pct` de `color` sobre `fondo`; equivale a `color` con alfa `pct` sobre `fondo`. */
function mezclar(color: Hex, fondo: Hex, pct: number): Hex {
  const canal = (hex: Hex, i: number) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16);
  const rgb = [0, 1, 2].map((i) =>
    Math.round(canal(fondo, i) + (canal(color, i) - canal(fondo, i)) * pct),
  );
  return `#${rgb
    .map((v) => v.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()}`;
}

function construirTema(tema: Tema): Record<string, Hex> {
  const base = BASE[tema];
  const card = base.card as Hex;
  const tokens: Record<string, Hex> = { ...base };
  for (const e of ESTADOS) {
    tokens[e] = PASTEL[e];
    if (tema === 'light') {
      tokens[`${e}-fg`] = TINTA_ESTADO_CLARO[e];
      tokens[`${e}-bg`] = mezclar(PASTEL[e], card, 0.35);
      tokens[`${e}-border`] = mezclar(PASTEL[e], card, 0.9);
    } else {
      // §5.1: fondo al 14 % y borde al 32 % del color base sobre la tarjeta.
      tokens[`${e}-fg`] = PASTEL[e];
      tokens[`${e}-bg`] = mezclar(PASTEL[e], card, 0.14);
      tokens[`${e}-border`] = mezclar(PASTEL[e], card, 0.32);
    }
  }
  if (tema === 'dark') {
    const dim = base['text-dim'] as Hex;
    tokens['neutral-bg'] = mezclar(dim, card, 0.14);
    tokens['neutral-border'] = mezclar(dim, card, 0.32);
  }
  return tokens;
}

export const temas: Record<Tema, Record<string, Hex>> = {
  light: construirTema('light'),
  dark: construirTema('dark'),
};

const canales = (hex: Hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(' ');

const variables = (tokens: Record<string, Hex>) =>
  Object.fromEntries(Object.entries(tokens).map(([k, v]) => [`--${k}`, canales(v)]));

const color = (token: string) => `rgb(var(--${token}) / <alpha-value>)`;

const grupoEstado = (e: Estado) => ({
  DEFAULT: color(e),
  fg: color(`${e}-fg`),
  bg: color(`${e}-bg`),
  border: color(`${e}-border`),
});

const chip = (prefijo: string) => ({
  backgroundColor: `rgb(var(--${prefijo}-bg))`,
  borderColor: `rgb(var(--${prefijo}-border))`,
  color: `rgb(var(--${prefijo}-fg))`,
});

export default {
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    // Reemplaza la paleta de Tailwind: en la app solo existen estos tokens.
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: '#FFFFFF',
      bg: color('bg'),
      surface: color('surface'),
      card: { DEFAULT: color('card'), hover: color('card-hover') },
      elevated: color('elevated'),
      border: {
        DEFAULT: color('border'),
        soft: color('border-soft'),
        strong: color('border-strong'),
      },
      text: { DEFAULT: color('text'), muted: color('text-muted'), dim: color('text-dim') },
      primary: {
        DEFAULT: color('primary'),
        hover: color('primary-hover'),
        soft: color('primary-soft'),
        ink: color('primary-ink'),
        strong: color('primary-strong'),
      },
      info: grupoEstado('info'),
      success: grupoEstado('success'),
      warning: grupoEstado('warning'),
      danger: grupoEstado('danger'),
      purple: grupoEstado('purple'),
      neutral: {
        fg: color('neutral-fg'),
        bg: color('neutral-bg'),
        border: color('neutral-border'),
      },
    },
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      // §5.2. Pesos incluidos para que `text-titulo-1` baste por sí solo.
      fontSize: {
        'titulo-1': ['36px', { lineHeight: '44px', fontWeight: '700' }],
        'titulo-1-movil': ['28px', { lineHeight: '36px', fontWeight: '700' }],
        'titulo-tarjeta': ['18px', { lineHeight: '24px', fontWeight: '700' }],
        cuerpo: ['14px', { lineHeight: '20px' }],
        etiqueta: ['12.5px', { lineHeight: '16px', fontWeight: '600' }],
        sobretitulo: ['12px', { lineHeight: '16px', letterSpacing: '0.08em' }],
        monto: ['30px', { lineHeight: '36px', fontWeight: '700' }],
        'monto-tarjeta': ['24px', { lineHeight: '30px', fontWeight: '700' }],
        metrica: ['28px', { lineHeight: '34px', fontWeight: '700' }],
      },
      borderRadius: { card: '12px', control: '10px' },
      borderColor: { DEFAULT: color('border') },
      ringColor: { DEFAULT: color('primary-strong') },
      spacing: { 18: '4.5rem', sidebar: '232px', aside: '360px' },
    },
  },
  plugins: [
    plugin(({ addBase, addComponents }) => {
      addBase({
        ':root': { ...variables(temas.light), colorScheme: 'light' },
        '[data-theme="dark"]': { ...variables(temas.dark), colorScheme: 'dark' },
        '::placeholder': { color: 'rgb(var(--text-dim))', opacity: '1' },
      });
      addComponents({
        // Sobretítulo mono en mayúsculas (§5.2): ESPECIALIDAD, SOLICITUD #SM-1042…
        '.sobretitulo': {
          fontFamily: '"JetBrains Mono", ui-monospace, monospace',
          fontSize: '12px',
          lineHeight: '16px',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'rgb(var(--text-dim))',
        },
        // Chips de estado componibles (§17): solo color; la forma la pone StatusChip.
        '.chip-info': chip('info'),
        '.chip-success': chip('success'),
        '.chip-warning': chip('warning'),
        '.chip-danger': chip('danger'),
        '.chip-purple': chip('purple'),
        '.chip-neutral': chip('neutral'),
      });
    }),
  ],
} satisfies Partial<Config>;
