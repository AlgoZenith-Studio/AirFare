# Design System Specification: AeroFareX (v2.1)

> **Owner**: @DESIGN (UI/UX Designer)
> **Status**: FINALIZED
> **Canonical colour source**: [`packages/design-tokens/brand.css`](../../../packages/design-tokens/brand.css) — the ONE place every AeroFareX colour is defined (TS mirror: [`brand.ts`](../../../packages/design-tokens/brand.ts)). Chart-only colours live in [`tokens.css`](../../../packages/design-tokens/tokens.css), which imports brand.css. Guide: [`packages/design-tokens/README.md`](../../../packages/design-tokens/README.md).
> **Targets**: desktop analyst workstations (primary) and mobile-first citizen surface; WCAG 2.1 AA; light and dark themes.
> **Prime rule**: **never define a colour outside `packages/design-tokens/`.** Components and app stylesheets reference roles (`var(--accent)`, `var(--text-1)`, `var(--line)`). A literal hex or rgba in any `.tsx` or app `.css` file is a review blocker.

---

## 1. Token Palette

### 1.1 Brand Palette — "Vivid Sky Blue" + black + white (`brand.css`)

| Token | Hex | Use it for |
| :--- | :--- | :--- |
| `--sky-100` | `#f5fdff` | Alternating section backgrounds |
| `--sky-200` | `#d6f7ff` | Selected / highlighted surfaces, icon tiles |
| `--sky-300` | `#a8eeff` | Borders, secondary bars |
| `--sky-400` | `#6ce2ff` | Editorial band background, highlighter stroke |
| `--sky-500` | `#00ccff` | **Primary** — buttons, key fills, active states |
| `--sky-800` | `#00607a` | Blue *text* / links on light (derived; 6.7:1 on white) |
| `--sky-900` | `#002b38` | Rules, labels, crop marks on sky bands (derived) |
| `--black` | `#000000` | All text on light backgrounds |
| `--white` | `#ffffff` | Page, cards; text on dark |
| `--ink` | `#05080c` | Base of the dark tint (hero, header) |

**Readability rule:** sky tones are FILLS, never text on white (`#00ccff` on white = 1.9:1; AA needs 4.5:1).
Text is black on light, white on dark, `--sky-800`/`--sky-900` when it must be blue.

### 1.1b Semantic Roles (what components actually reference)

| Role | Resolves to | Role | Resolves to |
| :--- | :--- | :--- | :--- |
| `--page`, `--surface` | white | `--accent` / `--accent-hover` | sky-500 / sky-400 |
| `--surface-alt` | sky-100 | `--on-accent` | black |
| `--surface-tint` | sky-200 | `--line` | black 9% |
| `--surface-band` | sky-400 | `--line-sky` / `--line-strong` | sky-300 / sky-500 |
| `--text-1` | black | `--line-deep` | sky-900 |
| `--text-2` / `--text-3` | black 72% / 60% | `--text-deep` | sky-900 |
| `--mark-1…5` (data fills) | sky-300, black, sky-500, grey-600, sky-400 | `--focus-ring` | black (sky-500 on dark) |

**Dark blocks** use the `.theme-dark` class (defined in `brand.css`): it flips `--text-*`, `--line` and
`--focus-ring` so components inside work unchanged. Applied to the landing hero and header. Dark-only
tokens: `--dark-glass`, `--dark-fill`, `--dark-border`, `--scrim-hero`, `--hero-fallback`, `--shadow-dark`.

### 1.1c Dashboard role aliases (`tokens.css`, TRD names)

`--brand` → sky-900 · `--brand-accent` → sky-800 · `--text-primary/secondary/muted` → text-1/2/3 ·
`--grid`/`--border` → line · `--axis` → line-control · `--surface-raised` → surface.

### 1.2 Categorical Series — Fixed Slot Order, Never Recycled

| Token | Light | Dark | Bound entity |
| :--- | :--- | :--- | :--- |
| `--slot-1` | `--sky-500` (`#00ccff`) | `--sky-400` | AFI headline / IndiGo |
| `--slot-2` | `#eb6834` | `#d95926` | TCT-AFI / Air India |
| `--slot-3` | `#1baf7a` | `#199e70` | AFI uncorrected / Akasa Air |
| `--slot-4` | `#eda100` | `#c98500` | ANC-AFI / SpiceJet |
| `--slot-5` | `#e87ba4` | `#d55181` | MakeMyTrip |

**Binding is permanent.** Color follows the entity, never the filtered rank. Deselecting a carrier must not repaint the remaining lines.
Slots 2–5 and the status colours stay multi-hue on purpose: a single-hue sky palette cannot separate five series or signal warning vs critical.

### 1.3 Status Colors — Never Reused as Series Lines

| Token | Value | Meaning |
| :--- | :--- | :--- |
| `--status-good` | `#0ca30c` | Coverage healthy, source HEALTHY |
| `--status-warning` | `#fab219` | Source DEGRADED, elevated surge |
| `--status-serious` | `#ec835a` | Coverage below 90%, source RECOVERING |
| `--status-critical` | `#d03b3b` | Source OPEN, reconciliation failure, surge spike |

### 1.4 Radii, Elevation, Motion

`--r-sm: 4px` · `--r-md: 8px` · `--r-lg: 12px` · `--r-pill: 999px`
`--e-1: 0 1px 2px rgba(11,11,11,.06)` · `--e-2: 0 4px 12px rgba(11,11,11,.10)` · `--e-3: 0 12px 32px rgba(11,11,11,.16)`
`--dur-fast: 120ms` · `--dur-base: 200ms`

### 1.5 Dark Theme

Dashboard: `[data-theme='dark']` in `tokens.css` points page/surface/text/lines at the brand dark tokens (`--ink`, `--dark-*`) and shifts the slots.
Landing: per-block `.theme-dark` (hero, header) while the rest of the page stays light.

---

## 2. The Seven Non-Negotiable Rules

1. **No dual-axis charts anywhere.** Multiple series share one Y-axis, or become two separate stacked charts. There is no exception for "it reads fine."
2. **Fixed categorical slot order.** See 1.2.
3. **Neutral grey midpoint on diverging ramps.** Used only where a zero crossing exists (waterfalls, period change). Never place a distinct hue at zero.
4. **Accessible table view on every chart.** Every `ChartFrame` provides a toggle producing a semantic, sortable `DataTable`.
5. **Mandatory quality metadata.** Every published index number is accompanied by a `QualityBadge`. Coverage below 90% renders a serious status band.
6. **Explicit texture for simulated data.** `provenance == SIMULATED` renders a 45-degree tone-on-tone hatch, and time series draw an explicit `provenance_boundary` rule at the SIMULATED-to-REAL transition.
7. **Integer paise throughout.** Money is integer paise in state and props; formatting to INR happens only at the render boundary.

---

## 3. Core Component Specifications

### 3.1 `ChartFrame`

The mandatory wrapper for every visualization.

- **Slots**: title, subtitle, `QualityBadge`, chart/table toggle, source-and-vintage footer.
- **States**: `loading` (skeleton, never a spinner over stale data), `empty` (states the reason, never an empty axis), `error` (retry affordance, no fabricated values), `partial` (renders with a coverage warning band), `ready`.
- **Accessibility**: the toggle is a real `<button>` with `aria-pressed`; the table view is a semantic `<table>` with `<caption>` and `<th scope>`; chart colors are never the sole carrier of meaning (pair with direct labels or markers).

### 3.2 `QualityBadge`

- Displays coverage ratio, imputation ratio, provenance, and vintage.
- Status band from `--status-*` by coverage: >=90% good, 80-90% serious, <80% critical.
- **Must be a real component reading real metadata.** Static decorative text claiming "98.4% coverage" is a Rule 5 violation.

### 3.3 `DataTable`

- Sortable, keyboard-navigable, semantic markup with a visible caption.
- Money columns right-aligned, formatted from integer paise at render time.
- Missing cells rendered as an explicit marker with the `missing_reason`, never as `0` or an em dash alone.

### 3.4 `AttributionWaterfall`

- Diverging ramp with a **neutral grey zero midpoint**.
- Renders the reconciliation state; on `reconciled: false` a prominent warning replaces the normal footer — the chart must not look trustworthy when the math does not close.
- Each of the five decomposition axes is selectable, and each independently sums to the same total.

### 3.5 `LeadTimeMatrix`

- T+1 to T+45 booking-horizon heatmap. Sequential (not categorical) ramp; missing cells hatched; simulated cells carry the 45-degree texture.

### 3.6 `SourceHealthIndicator`

- Circuit state from Firestore `onSnapshot`: HEALTHY (good), DEGRADED (warning), OPEN (critical), RECOVERING (serious).
- Shape or icon differs per state as well as color, so state is never conveyed by hue alone.

### 3.7 `AuditDrawer`

- Drills from a published number to the raw observation: SHA-256, `batch_hash`, `prev_batch_hash`, `adapter_version`, `object_key`, fetch timestamp.
- Hashes render in `JetBrains Mono` with a copy affordance.

---

## 4. Typography

- **Primary** (`--font-primary`): Anthropic Serif Display Bold — headings, hero, big numbers. Files in `landing/frontend/public/fonts/`. *Licence to be confirmed before public launch.*
- **Secondary** (`--font-secondary`): Anthropic Serif Display Extrabold Italic — highlighted emphasis words (`.grad`).
- **Tertiary** (`--font-tertiary`): Google Sans (Google Fonts, 400/500/700) — everything else: body, nav, buttons, labels, prices.
- Tabular figures (`.num`) for all numeric columns so digits align vertically.

---

## 5. Citizen Surface Notes (`landing/frontend`)

- Mobile-first, 16px side gutters, no horizontal scroll.
- Hero states AFI, TCT-AFI, and the drip-pricing wedge as the primary numbers, with the wedge given equal visual weight — it is the product's central finding.
- No ads, affiliate links, or booking funnel anywhere in the layout.
- The link to the sovereign portal is **environment-driven**, never a hardcoded `localhost` URL.

---

## 6. Implementation Status (`landing/frontend`)

Resolved: hardcoded hex/rgba removed (all colours from `brand.css`), money in integer paise, portal URL
env-driven (`VITE_PORTAL_URL`), split into `components/` `views/` `hooks/` `lib/` `data/` `styles/`,
dark hero/header via `.theme-dark`.

Open:
1. No Tailwind yet (TRD mandates it); the preset is ready in `packages/design-tokens/tailwind-preset.js`.
2. No `QualityBadge` component on the landing surface (Rule 5).
3. No 45-degree hatch pattern yet for simulated provenance (Rule 6).
