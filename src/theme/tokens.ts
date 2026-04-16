// Design tokens for the CMS ETL Walkthrough workshop demo.
//
// Brand anchors (Alstom): primary blue #2850F0, secondary red #DC3223.
// Editorial aesthetic: warm off-white "paper", deep ink, Fraunces display
// serif, Geist sans for UI, Geist Mono for technical labels.
// Arial (the template's native font) is retained in fallback stacks.

export const colors = {
  // Brand (values taken from the Alstom PowerPoint theme)
  brandPrimary:   '#2850F0', // Alstom Blue   — accents, actions, active states
  brandSecondary: '#DC3223', // Alstom Red    — the data-packet "hero" / wordmark "a"
  brandNavy:      '#1E3246', // Alstom Navy   — strong surfaces, wordmark body
  brandNavyDeep:  '#142846', // Alstom Deep   — footer bar, emphasis background
  brandAccent:    '#9646DC', // purple, occasional
  brandGreen:     '#78C86E', // Alstom Green — success / "ready"

  // Paper & ink (editorial neutrals, replace generic greys)
  paper:     '#F4F1EC', // warm off-white, newsprint feel
  paperAlt:  '#EAE5DA', // slightly darker for bands / panels
  paperRule: '#D8D0C0', // hairline rule color (blueprint)
  ink:       '#14192A', // near-black with navy cast, primary text
  inkMuted:  '#5B6271', // body secondary text
  inkFaint:  '#98A0AE', // captions, metadata

  // Legacy aliases — kept for back-compat so unmodified components still work
  surface:    '#F4F1EC',
  surfaceAlt: '#EAE5DA',
  textStrong: '#14192A',
  textMuted:  '#5B6271',

  // Pipeline stage bands (tint-on-paper — subtle, layered)
  stageSource:        '#E8E2D5',
  stageCleaning:      '#DCE2EC',
  stageConsolidation: '#CEDBEA',
  stageUpload:        '#BECEE2',

  // Edges + token
  edgeIdle:   '#C7BDAA',
  edgeActive: '#2850F0',
  tokenFill:  '#DC3223',
  tokenGlow:  'rgba(220, 50, 35, 0.35)',
} as const;

export const fonts = {
  // Distinctive display serif. Used for step counter, context headings, brand mark.
  display: '"Fraunces", "Times New Roman", Georgia, serif',
  // Geometric modern sans for UI chrome (header, buttons, controls).
  sans:    '"Geist", "Arial", -apple-system, system-ui, sans-serif',
  // Monospace for technical labels, node titles, data payload values.
  mono:    '"Geist Mono", "SF Mono", "JetBrains Mono", "Courier New", monospace',

  // Legacy aliases
  heading: '"Fraunces", "Arial", Georgia, serif',
  body:    '"Geist", "Arial", -apple-system, system-ui, sans-serif',
} as const;
