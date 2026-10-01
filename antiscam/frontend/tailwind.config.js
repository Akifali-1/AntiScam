/** @type {import('tailwindcss').Config} */
/*
 * Colours resolve to raw RGB channel triplets held in CSS custom properties
 * (see src/index.css). Channel-triplet form rather than hex so Tailwind's
 * opacity modifiers — `bg-surface/60`, `border-border/40` — keep working.
 *
 * Every colour here is a name from the design system, never a literal. If a
 * component needs a hue that isn't on this list, the list is what should change.
 */
const defaultTheme = require('tailwindcss/defaultTheme')

const token = (name) => `rgb(var(--${name}) / <alpha-value>)`

/*
 * The five semantic names below shadow Tailwind's own palettes of the same
 * name. Their numeric scales are spread back in as a migration shim: any
 * `text-red-500` / `bg-gray-50` still left in an unconverted screen resolves
 * instead of silently emitting nothing. New code should use the token name
 * (`text-red`, `bg-gray-tint`) — not a numeric step.
 */
const withScale = (name, blank = {}) => ({
  ...defaultTheme.colors[name],
  DEFAULT: token(name),
  tint: token(`${name}-tint`),
  line: token(`${name}-line`),
  ...blank,
})

module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        /* Surfaces */
        bg: token('bg'),
        surface: token('surface'),
        "surface-2": token('surface-2'),
        "surface-3": token('surface-3'),

        /* Chrome — the rails (nav, sidebar, footer). A quiet surface, a step
           *below* the page, so white cards stay the highest thing on screen. */
        chrome: token('chrome'),
        "chrome-2": token('chrome-2'),
        "chrome-border": token('chrome-border'),

        /* Instrument — the dark surface the product's own UI is presented on.
           Its own scale in both themes, so a screenshot reads the same either way. */
        instrument: {
          DEFAULT: token('instrument'),
          2: token('instrument-2'),
          border: token('instrument-border'),
          ink: token('instrument-ink'),
          muted: token('instrument-ink-muted'),
          faint: token('instrument-ink-faint'),
        },

        /* Lines */
        border: token('border'),
        "border-strong": token('border-strong'),

        /* Text */
        ink: token('ink'),
        "ink-muted": token('ink-muted'),
        "ink-faint": token('ink-faint'),

        /* Semantic accents — each with a tint (fill) and line (border) partner. */
        red: withScale('red'),
        blue: withScale('blue'),
        teal: withScale('teal'),
        amber: withScale('amber'),
        gray: withScale('gray'),

        /* shadcn/ui contract. The generated ui/* components reference these, so
           mapping them onto our tokens themes every primitive for free. */
        input: token('border'),
        ring: token('focus'),
        focus: token('focus'),
        background: token('bg'),
        foreground: token('ink'),
        primary: {
          DEFAULT: token('ink'),
          foreground: token('surface'),
        },
        secondary: {
          DEFAULT: token('surface-3'),
          foreground: token('ink'),
        },
        destructive: {
          DEFAULT: token('red'),
          foreground: token('surface'),
        },
        muted: {
          DEFAULT: token('surface-3'),
          foreground: token('ink-muted'),
        },
        accent: {
          DEFAULT: token('surface-3'),
          foreground: token('ink'),
        },
        popover: {
          DEFAULT: token('surface'),
          foreground: token('ink'),
        },
        card: {
          DEFAULT: token('surface'),
          foreground: token('ink'),
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      /* Named steps only. `text-[13px]` and friends are not available by
         accident — if a size is needed, it belongs in the scale above. */
      fontSize: {
        xs: ['var(--fs-xs)', { lineHeight: '1.5' }],
        sm: ['var(--fs-sm)', { lineHeight: '1.55' }],
        ui: ['var(--fs-ui)', { lineHeight: '1.45' }],
        base: ['var(--fs-base)', { lineHeight: '1.6' }],
        md: ['var(--fs-md)', { lineHeight: '1.5' }],
        lg: ['var(--fs-lg)', { lineHeight: '1.35' }],
        xl: ['var(--fs-xl)', { lineHeight: '1.25' }],
        '2xl': ['var(--fs-2xl)', { lineHeight: '1.2' }],
        '3xl': ['var(--fs-3xl)', { lineHeight: '1.12' }],
        display: ['var(--fs-display)', { lineHeight: '1.02' }],
        metric: ['var(--fs-metric)', { lineHeight: '1.05' }],
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'Consolas', 'monospace'],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
