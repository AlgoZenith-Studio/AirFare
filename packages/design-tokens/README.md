# packages/design-tokens

**The single source of truth for every AeroFareX colour.** No app, component or stylesheet
may define a colour anywhere else. To change a colour, change it here once; every surface
updates.

| File | What it holds | Who imports it |
| :--- | :--- | :--- |
| [`brand.css`](./brand.css) | The brand palette (sky ramp, deep blues, black, white, ink), all semantic roles (surfaces, text, lines, accent, shadows, scrims, gradients) and the `.theme-dark` class | Everything. `landing/frontend` imports it directly |
| [`brand.ts`](./brand.ts) | The same palette as TypeScript constants, for canvas, chart libraries, OG images | JS code that can't read CSS variables |
| [`tokens.css`](./tokens.css) | Dashboard/data-viz layer (TRD Part C): chart series `--slot-*`, `--status-*`, and TRD role names aliased to brand tokens. Imports `brand.css` | `dashboard/frontend` |
| [`tailwind-preset.js`](./tailwind-preset.js) | Maps all of the above to Tailwind classes (`bg-sky-500`, `text-text-1`, `border-line-deep`, …) | Any Tailwind config |

## The palette

| Token | Hex | Use it for |
| :--- | :--- | :--- |
| `--sky-100` | `#f5fdff` | Alternating section backgrounds |
| `--sky-200` | `#d6f7ff` | Selected/highlighted surfaces, icon tiles |
| `--sky-300` | `#a8eeff` | Borders, secondary bars |
| `--sky-400` | `#6ce2ff` | Editorial band background, highlighter stroke |
| `--sky-500` | `#00ccff` | **Primary** — buttons, key fills, active states |
| `--sky-800` | `#00607a` | Blue *text* / links on light backgrounds (derived) |
| `--sky-900` | `#002b38` | Rules, labels, crop marks on sky bands (derived) |
| `--black` | `#000000` | All text on light backgrounds |
| `--white` | `#ffffff` | Page and cards; text on dark |
| `--ink` | `#05080c` | Base of the dark tint (hero, header) |

The five `--sky-100…500` tones are the "Vivid Sky Blue" palette. `--sky-800/900` are derived
deep blues of the same hue, added because the palette has no tone dark enough for text or rules.

## Rules

1. **Refer to roles, not raw tones, in components:** `var(--accent)`, `var(--text-1)`,
   `var(--line)`, `var(--surface-alt)`. Raw `--sky-*` tokens are for defining roles.
2. **Sky tones are fills, never text on white.** `#00ccff` on white is 1.9:1 (WCAG AA needs
   4.5:1). Text is black on light, white on dark, `--sky-800`/`--sky-900` when it must be blue.
3. **Dark blocks use the `.theme-dark` class.** It flips the text and line roles, so components
   inside work unchanged. The landing hero and header use it.
4. **Keep `brand.ts` in sync** with `brand.css` whenever a raw palette value changes.
