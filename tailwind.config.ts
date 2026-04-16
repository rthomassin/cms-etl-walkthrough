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
          accent:    colors.brandAccent,
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
        },
      },
      fontFamily: {
        heading: fonts.heading,
        body:    fonts.body,
      },
    },
  },
  plugins: [],
} satisfies Config;
