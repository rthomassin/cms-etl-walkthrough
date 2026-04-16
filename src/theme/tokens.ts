// Extracted from Alstom New Template.pptx on 2026-04-16.
// Source: ppt/theme/theme1.xml (clrScheme "MPREZ", fontScheme "Alstom").
//
// Color role mapping:
//   dk1  (Text1)       => #1E3246  deep navy — primary text
//   lt1  (Background1) => #FFFFFF  white — main surface
//   dk2  (Text2/Dark2) => #DC3223  Alstom red — used as secondary brand
//   lt2  (Background2) => #E6E6F0  near-white lavender — alternate surface
//   accent1            => #2850F0  Alstom blue — PRIMARY brand color
//   accent2            => #78C86E  green
//   accent3            => #9646DC  purple
//   accent4            => #9B875F  gold/tan
//   accent5            => #FFFFFF  (duplicate white, not used)
//   accent6            => #142846  deep navy variant
//
// Font note: Both major (headings) and minor (body) fonts in the theme XML are
// "Arial" — Arial is a system font available everywhere, so no substitution is
// needed. It is referenced directly below.
//
// Stage tints: derived by progressively lightening accent1 (#2850F0).
//   The approach: mix accent1 with white at 80%, 60%, 40%, 20% opacity equivalents.
//   Computed manually:
//     stageSource       #D9E0FD  (~88% white blend — very light blue)
//     stageCleaning     #B3C1FB  (~75% white blend — light blue)
//     stageConsolidation #8DA2F8  (~60% white blend — medium-light blue)
//     stageUpload       #6683F5  (~45% white blend — slightly richer blue)

export const colors = {
  // Brand
  brandPrimary:   '#2850F0', // accent1 — Alstom Blue
  brandSecondary: '#DC3223', // dk2    — Alstom Red
  brandAccent:    '#78C86E', // accent2 — Green

  // Surfaces
  surface:    '#FFFFFF', // lt1 — white
  surfaceAlt: '#E6E6F0', // lt2 — near-white lavender

  // Text
  textStrong: '#1E3246', // dk1 — deep navy
  textMuted:  '#142846', // accent6 — slightly deeper navy, good for secondary text

  // Pipeline stage tints (lighter shades of brandPrimary #2850F0)
  stageSource:         '#D9E0FD', // ~88% white blend
  stageCleaning:       '#B3C1FB', // ~75% white blend
  stageConsolidation:  '#8DA2F8', // ~60% white blend
  stageUpload:         '#6683F5', // ~45% white blend

  // Edges + token
  edgeIdle:   '#c2c7cc',
  edgeActive: '#2850F0', // accent1
  tokenFill:  '#DC3223', // dk2 — red token stands out on blue pipeline
} as const;

export const fonts = {
  // Arial is the official Alstom template font for both headings and body.
  // It is a universally available system font — no substitution required.
  heading: '"Arial", "Segoe UI", system-ui, sans-serif',
  body:    '"Arial", "Segoe UI", system-ui, sans-serif',
} as const;
