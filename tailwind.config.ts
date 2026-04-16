import type { Config } from 'tailwindcss';
import { colors, fonts } from './src/theme/tokens';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary:   colors.brandPrimary,
          secondary: colors.brandSecondary,
          navy:      colors.brandNavy,
          navyDeep:  colors.brandNavyDeep,
          accent:    colors.brandAccent,
          green:     colors.brandGreen,
        },
        paper: {
          DEFAULT: colors.paper,
          alt:     colors.paperAlt,
          rule:    colors.paperRule,
        },
        ink: {
          DEFAULT: colors.ink,
          muted:   colors.inkMuted,
          faint:   colors.inkFaint,
        },
        surface: {
          DEFAULT: colors.surface,
          alt:     colors.surfaceAlt,
        },
        text: {
          strong: colors.textStrong,
          muted:  colors.textMuted,
        },
        stage: {
          source:        colors.stageSource,
          cleaning:      colors.stageCleaning,
          consolidation: colors.stageConsolidation,
          upload:        colors.stageUpload,
        },
        edge: {
          idle:   colors.edgeIdle,
          active: colors.edgeActive,
        },
        token: {
          fill: colors.tokenFill,
          glow: colors.tokenGlow,
        },
      },
      fontFamily: {
        display: fonts.display.split(',').map(s => s.trim().replace(/^"|"$/g, '')),
        sans:    fonts.sans.split(',').map(s => s.trim().replace(/^"|"$/g, '')),
        mono:    fonts.mono.split(',').map(s => s.trim().replace(/^"|"$/g, '')),
        heading: fonts.heading.split(',').map(s => s.trim().replace(/^"|"$/g, '')),
        body:    fonts.body.split(',').map(s => s.trim().replace(/^"|"$/g, '')),
      },
      boxShadow: {
        // Offset "paper" shadow — no blur, just 2–3px drop like a print layer
        paper:   '3px 3px 0 rgba(20, 25, 42, 0.12)',
        paperSm: '2px 2px 0 rgba(20, 25, 42, 0.10)',
        paperLg: '5px 5px 0 rgba(20, 25, 42, 0.14)',
        active:  '0 0 0 3px rgba(40, 80, 240, 0.35), 3px 3px 0 rgba(20, 25, 42, 0.12)',
        tokenGlow: '0 0 20px 4px rgba(220, 50, 35, 0.45)',
      },
      letterSpacing: {
        tight2: '-0.02em',
        wide2:  '0.12em',
        wide3:  '0.2em',
      },
    },
  },
  plugins: [],
} satisfies Config;
