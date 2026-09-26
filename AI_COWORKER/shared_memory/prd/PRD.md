# Product Requirement Document (PRD): AeroFareX (v2.1)

> **Owner**: @PM (Product Manager & Orchestrator)
> **Status**: FINALIZED
> **Canonical source**: the root [`PRD.md`](../../../PRD.md) v2.1. This file is the @PM shared-memory mirror, restated in MAS feature/user-story form for @FE, @BE, and @QA consumption. On any conflict, the root `PRD.md` wins.
> **Target Users**: MoSPI/NSO statisticians, RBI monetary-policy analysts, DGCA/MoCA tariff regulators, economic researchers, general public fliers
> **Key Value Proposition**: Daily, quality-adjusted, fully unbundled airfare inflation measurement that can be cryptographically reproduced from raw source data by any third-party auditor.

---

## Feature Modules & Functional Specifications

### 1. Automated Fare Collection (`@PM-FEAT-01`) — Tier 1 MVP

- Scheduled collection at **02:30, 05:30, 13:00, 19:00 IST** across 5 routes x 5 carriers x 5 booking horizons (T+1, T+7, T+15, T+30, T+45).
- Declared collector identity: `User-Agent: AeroFareX-StatisticalCollector/2.0 (+https://mospi.gov.in/aerofarex-collector)`.
- 3.5s jittered delay, **zero concurrent requests per domain**, off-peak windows only.
- Circuit breaker per source: `HEALTHY -> DEGRADED -> OPEN -> RECOVERING`, streamed live to Firestore.
- Every raw payload archived to `gs://aerofarex-raw-observations` with SHA-256, `batch_hash`, `prev_batch_hash`, and `adapter_version`.

**Acceptance criteria**
- [ ] 30 consecutive days of unattended collection with no manual intervention.
- [ ] No source ever receives two concurrent requests.
- [ ] Every `fare_observation` row resolves to a retrievable raw artifact whose SHA-256 matches.
- [ ] A forced source failure trips the breaker to OPEN and surfaces in `/api/v1/sources` within one run.

### 2. Fare Decomposition & Sanitization (`@PM-FEAT-02`) — Tier 1 MVP

- Unbundle every quote into base fare, YQ fuel surcharge, GST, UDF, PSF, platform fee, and total payable — **all integer paise**.
- 1.5x IQR outlier filtering that **flags and retains**, never deletes.
- Imputation cascade: CROSS_SOURCE -> CELL_MEAN -> CARRY_FORWARD (3-day cap) -> EXCLUDED.
- Missing cells classified by `missing_reason`: SOLD_OUT, NO_FLIGHT, MISSING_SOURCE, SOURCE_ERROR, PARSER_ERROR, BLOCKED, UNKNOWN.

**Acceptance criteria**
- [ ] Components sum exactly to `total_payable_paise` for every observation (integer arithmetic, no rounding drift).
- [ ] A flagged outlier remains queryable and is visibly marked, not dropped.
- [ ] Carry-forward never exceeds 3 days; the 4th day becomes EXCLUDED.
- [ ] Imputation ratio is reported per index snapshot.

### 3. Index Computation Engine (`@PM-FEAT-03`) — Tier 1 MVP

- Jevons geometric mean per route-window cell.
- Booking-curve correction with weights T+1 = 0.10, T+7 = 0.22, T+15 = 0.35, T+30 = 0.23, T+45 = 0.10.
- DGCA passenger-share-weighted chained Laspeyres, base September 2026 = 100, chain drift < 0.15.
- Hedonic quality adjustment (model h-1.2) over LCC status, departure time band, baggage allowance, refundability.
- Publishes **AFI**, **TCT-AFI**, and **ANC-AFI** plus the drip-pricing wedge.

**Acceptance criteria**
- [ ] Recomputing a past date from stored raw records reproduces the published value bit-for-bit.
- [ ] Route weights sum to 1.0 and booking-curve weights sum to 1.0, asserted in code.
- [ ] Pearson R-squared >= 0.88 against historical DGCA monthly route averages.
- [ ] Index snapshots carry coverage ratio, imputation ratio, provenance, and vintage.

### 4. Movement Attribution Waterfall (`@PM-FEAT-04`) — Tier 1 MVP

- Decompose day-on-day index movement additively across route, carrier, booking window, fee type, and driver (ATF jet fuel vs demand-pull).
- **Hard constraint**: `|sum(contributions) - delta(index)| < 1e-4`, exposed as `reconciled: true`.
- If the client detects a mismatch, it must render a prominent reconciliation warning.

**Acceptance criteria**
- [ ] Each of the five decomposition axes independently sums to the same total movement.
- [ ] A deliberately corrupted contribution set sets `reconciled: false` and triggers the UI warning.
- [ ] Waterfall uses a neutral grey midpoint at zero (no distinct hue at the zero crossing).

### 5. Sovereign Analyst Portal (`@PM-FEAT-05`) — Tier 1 MVP

- Firebase Auth with VIEWER / ANALYST / ADMIN role gating; server-side JWT enforcement.
- Index history charts, lead-time (T+1..T+45) matrix, route fare tables, quality coverage and imputation views.
- Full audit drawer: drill from a published number to the raw observation, its SHA-256, and its adapter version.
- CSV and SDMX export for ANALYST+.
- Every chart offers a `DataTable` toggle; every number carries a `QualityBadge`.

**Acceptance criteria**
- [ ] A VIEWER token is rejected by `/api/v1/index/attribution/{date}` with 403 at the API layer, not merely hidden in the UI.
- [ ] Every `ChartFrame` has a working accessible table view.
- [ ] Coverage below 90% renders a serious status band.
- [ ] `SIMULATED` provenance renders with 45-degree hatching, and the provenance boundary is drawn on time series.

### 6. Public Citizen Transparency Surface (`@PM-FEAT-06`) — Tier 1 MVP

- Headline AFI vs TCT-AFI widget with the drip-pricing wedge stated numerically.
- Interactive top-5 trunk-route explorer across booking horizons showing advertised base vs actual total outlay.
- Plain-language methodology explainer.
- Zero authentication, zero ads, zero affiliate links, zero booking funnel.

**Acceptance criteria**
- [ ] Loads and is fully usable without any account.
- [ ] Contains no outbound commercial or booking link.
- [ ] All money values derive from integer paise and render as localized INR.
- [ ] All color comes from design tokens; no hardcoded hex in components; dark mode works.

### 7. Tier 2 — Built If Time Permits

- Standalone interactive ANC-AFI series.
- ATF jet-fuel cost-passthrough econometric decomposition.
- 7-to-14-day leading inflation nowcast with confidence intervals for RBI.
- X-13ARIMA-SEATS seasonally adjusted series.
- State-level sub-indices for state CPI integration.
- DGCA surge alerts at 3.5x MAD over a 14-day rolling baseline.

### 8. Tier 3 — Long-Term National Infrastructure

- Expansion from 5 routes to all 120+ domestic sectors including RCS-UDAN.
- Cross-modal tracking against Rajdhani / Vande Bharat dynamic rail fares.
- Outbound international short-haul index (Gulf, Southeast Asia).
- Transition from web observation to statutory carrier data-sharing APIs under MoCA authority.

---

## Constraints

1. **Non-commercial by mandate** — no products, commissions, price-freeze upsells, or advertising. Any monetization feature is out of scope by definition.
2. **Declared collection only** — covert scraping, botnets, or evasion of anti-bot controls are prohibited; they are an unacceptable liability for a government ministry.
3. **Integer paise everywhere** — 1 INR = 100 paise; no floating-point money at any layer.
4. **Append-only provenance** — raw artifacts are immutable; index revisions create a new vintage rather than overwriting.
5. **Zero silent zeroes** — a missing cell must never be rendered as zero or quietly interpolated.
6. **PRD.md / TRD.md at the repository root are the sole source of truth.**

## Non-Functional Requirements

- **Accessibility**: WCAG 2.1 AA; a semantic table alternative for every chart; no dual-axis charts anywhere; keyboard-navigable; light and dark themes.
- **Auditability**: any third party can deterministically recompute any published index value from stored raw data.
- **Frequency**: daily publication with zero reporting lag.
- **Rate limits**: 60/min on the public API, 120/min on the analyst API.
- **Decoupling**: both frontends must run fully standalone via `NEXT_PUBLIC_USE_MOCK=true` against `data/seed`, with no backend or database running.
- **Transparency of uncertainty**: coverage ratio, imputation ratio, and provenance displayed on the face of every published figure — never buried in a tooltip.
