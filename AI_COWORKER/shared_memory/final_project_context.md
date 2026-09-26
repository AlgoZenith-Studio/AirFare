# Final Project Context: AeroFareX (v2.1)

> **Status**: OMNIPRESENT — binding on all MAS agents (@PM, @GUARD, @ARCH, @DESIGN, @FE, @BE, @SEC, @ETHICS, @QA, @OPS, @DATA, @DEBUGGER, @REPAIR)
> **Version**: 2.1
> **Source of Truth**: `PRD.md` v2.1 and `TRD.md` v2.1 at the repository root. Where this document and those two disagree, **PRD.md / TRD.md win** — and the disagreement must be reported, not silently resolved.
> **Programme**: Smart India Hackathon 2026 · Ministry of Statistics & Programme Implementation (MoSPI)
> **Beneficiaries**: National Statistical Office (NSO), Reserve Bank of India (RBI), DGCA / Ministry of Civil Aviation

---

## 1. Product Vision & Mission

**AeroFareX** is a sovereign-grade domestic airfare price measurement and inflation intelligence platform for India. Official CPI measurement of air travel has historically relied on field investigators physically visiting a limited roster of ticketing counters **once a month** — a method that structurally fails for airline seats, because:

1. Over **92%** of domestic Indian air tickets are bought dynamically online.
2. Airline revenue-management software changes fares **dozens of times per day** on load factor, booking velocity, and days-to-departure.
3. Advertised base fares hide fuel surcharge (YQ), UDF/PSF airport fees, GST, and platform convenience fees — an **8%-15% out-of-pocket undercount**.

AeroFareX continuously samples carrier-direct and OTA portals across India's DGCA trunk sectors, unbundles every quote, converts advertised prices into *realized paid* prices via empirical booking curves, quality-adjusts via hedonic regression, and publishes **daily, tamper-evident** indices that any third party can deterministically recompute from stored raw artifacts.

> *"Everyone else can scrape a fare. AeroFareX is the only system that converts a scraped advertised price into a statistically valid consumer price, and can prove every published number back to its raw source."*

### The Five Commitments

1. **Daily frequency, not monthly** — a published index every day, zero reporting lag.
2. **Total out-of-pocket cost, not headline fare** — YQ, UDF, PSF, GST, platform fees, ancillaries all isolated.
3. **What people pay, not what is quoted** — booking-curve offer-to-transaction correction.
4. **Explainable movement** — every day-on-day shift decomposed into an additive attribution waterfall.
5. **Reproducible and sovereign** — SHA-256 hash-chained raw artifacts, append-only, auditable by Parliament or RBI.

---

## 2. The Three Published Indices (+ the Wedge)

| Index | Measures | Slot Color |
| :--- | :--- | :--- |
| **AFI** (Air Fare Index — Headline) | Quality-adjusted base fare; the drop-in digital successor to CPI counter surveys | `--slot-1` `#2a78d6` |
| **TCT-AFI** (Total Cost of Travel) | Base + YQ fuel + UDF/PSF + GST + mandatory platform fees + ancillaries | `--slot-2` `#eb6834` |
| **ANC-AFI** (Ancillary) | Unbundled fees only: seat selection, extra baggage, meals | `--slot-4` `#eda100` |
| **Drip-Pricing Wedge** | The tracked spread TCT-AFI minus AFI (currently ~**+12.6%**) | — |

Also published: state-level sub-indices (origin-state mapped), X-13ARIMA-SEATS seasonally adjusted series, and DGCA surge alerts at >3.5x MAD over a 14-day rolling baseline.

---

## 3. Approved Tech Stack

| Layer / Domain | Technology | Port | Notes |
| :--- | :--- | :--- | :--- |
| **Public citizen frontend** (`landing/frontend`) | Vite + React 19 + TypeScript + Tailwind, bound to `@aerofarex/design-tokens` | **3001** | Hero index widget, trunk-route explorer, public methodology. No auth. |
| **Public API** (`landing/backend`) | FastAPI (Python 3.11+), Pydantic v2, Redis/in-memory cache | **8001** | `/api/v1/public/*`, read-only, CDN-cached, rate-limited 60/min, zero auth barrier. |
| **Analyst portal** (`dashboard/frontend`) | Next.js 18+ App Router (`src/app`), TypeScript, Tailwind, Framer Motion, Firebase Auth SDK | **3000** | Role-gated. The **only** directory permitted to be named `src/app`. |
| **Econometric backend** (`dashboard/backend/server`) | FastAPI, Pydantic v2, NumPy, Pandas, SciPy, Statsmodels, SQLAlchemy/Asyncpg, Firebase Admin SDK | **8000** | Application package is named **`server`**, never `app`. Rate-limited 120/min. |
| **Collector** (`services/collector`) | Python, Playwright, `curl_cffi` | — | Declared ethical scraper, 3.5s jittered delays, circuit breakers. |
| **Warehouse** | PostgreSQL 16 + **TimescaleDB** hypertables | 5432 | DB/user `aerofarex`. Integer paise everywhere. |
| **Raw artifacts** | Firebase Cloud Storage `gs://aerofarex-raw-observations` | — | Append-only, SHA-256 hash-chained. |
| **Live telemetry** | Cloud Firestore | — | Scraper health, circuit-breaker state, surge alerts (`onSnapshot`). |
| **Shared packages** | `@aerofarex/design-tokens`, `@aerofarex/shared-types` | — | pnpm workspace, `packageManager: pnpm@9`. |

**Naming rules (non-negotiable):** the product name is **AeroFareX** (one word, capital A/F/X). Package scope is `@aerofarex/*`. The Python package is `server/`. Only `dashboard/frontend` has `src/app`.

---

## 4. Econometric Method (authoritative formulas — see TRD Part B)

**Chained DGCA-weighted Laspeyres:**

AFI_t = 100 x SUM over routes r [ W_r x SUM over horizons k ( omega_k x (P_r,k,t / P_r,k,0) ) ]

- **Routes** R (5 DGCA trunk sectors, sum of W_r = 1.0): DEL-BOM (12.4% pax), DEL-BLR (9.8%), BOM-BLR (7.6%), DEL-CCU (5.2%), BLR-HYD (4.3%).
- **Horizons** K and booking-curve weights omega_k (sum = 1.0): T+1 = **0.10**, T+7 = **0.22**, T+15 = **0.35**, T+30 = **0.23**, T+45 = **0.10**.
- **Elementary aggregation** P_r,k,t = unweighted **Jevons geometric mean** of sanitized fares in the cell (satisfies IMF/ILO CPI Manual transitivity and commensurability).
- **Base period**: September 2026 = 100. Monthly chaining, chain drift capped at **< 0.15**.
- **Hedonic model h-1.2**: `ln(p_i) = b_0 + SUM_m b_m X_i,m + SUM_tau d_tau D_i,tau + eps_i` over carrier LCC status, departure time band, baggage kg, refundability.
- **Attribution waterfall**: delta-I_t decomposed additively across route, carrier, window, fee type, and fuel-vs-demand driver. **Reconciliation constraint: |SUM(delta) - delta-I_t| < 1e-4, flagged `reconciled: true`.** A mismatch must surface a prominent client warning — never be silently absorbed.
- **Sanitization**: 1.5x IQR outlier filter (**flag, never delete**), imputation by CROSS_SOURCE then CELL_MEAN then CARRY_FORWARD (max 3 days) then EXCLUDED.
- **Surge detection** (distinct from outlier filtering): 3.5x MAD over a 14-day rolling seasonal baseline.

---

## 5. RBAC — Four Access Tiers (Firebase Auth JWT)

1. **Public** — no auth. `landing/*` surfaces and `/api/v1/public/*` plus `/api/v1/methodology`.
2. **VIEWER** — index latest/history/family, routes and fares, lead-time matrix, quality coverage and imputation, vintages.
3. **ANALYST** — everything above plus attribution waterfall, `/health` and `/sources` circuit breakers, full observation audit records, CSV and SDMX export.
4. **ADMIN** — everything above plus administrative operations.

Enforced in `dashboard/backend/server/core/` JWT middleware. Role gating in the UI is **presentation only** and is never the security boundary.

---

## 6. The Seven Non-Negotiable Frontend Rules (TRD Part C, section 2)

1. **No dual-axis charts anywhere.** Share one Y-axis or split into two stacked charts.
2. **Fixed categorical slot order.** Color follows the entity, never the filtered rank. Removing a carrier never repaints the remaining lines.
3. **Neutral grey midpoint on diverging ramps.** Never a distinct hue at zero.
4. **Accessible table view on every chart.** Every `ChartFrame` toggles to a semantic sortable `DataTable`.
5. **Mandatory quality metadata.** Every published number carries a `QualityBadge`; coverage < 90% renders a serious status band.
6. **Explicit texture for simulated data.** `provenance == SIMULATED` renders a 45-degree tone-on-tone hatch.
7. **Integer paise throughout.** 1 INR = 100 paise. No floats for money, ever.

Plus: all color comes from `packages/design-tokens/tokens.css` via the Tailwind preset. **Never hand-write a hex value into a component.** WCAG 2.1 AA, light and dark themes.

---

## 7. Ethical Collection Posture (binding on @BE and @ETHICS)

AeroFareX is a **declared, transparent collector**, not a clandestine botnet — a covert scraper is an unacceptable liability for a government ministry.

- `User-Agent: AeroFareX-StatisticalCollector/2.0 (+https://mospi.gov.in/aerofarex-collector)`
- Off-peak windows only: 01:00-04:00 IST and mid-day off-peak. Scheduled runs **02:30, 05:30, 13:00, 19:00 IST**.
- **3.5s jittered delay, zero concurrent requests per domain.**
- Circuit breaker states: `HEALTHY -> DEGRADED -> OPEN -> RECOVERING`.
- Source weighting: Tier-1 carrier-direct **75%** (IndiGo ~62% share, Air India Group, Akasa, SpiceJet); Tier-2 OTA **25%** (MakeMyTrip, EaseMyTrip, Ixigo — specifically to measure the convenience-fee wedge).
- Positioned as a temporary observation bridge toward statutory carrier API feeds under MoCA authority.

**Non-commercial invariant:** no products to sell, no affiliate commissions, no price-freeze upsells, no ads. Any feature that monetizes the user is out of scope by definition.

---

## 8. Data Invariants

- **Money is integer paise (`BIGINT`)** in the database, the API, and the UI layer.
- **`raw_observations` and Firebase Storage are append-only.** Never update, never delete; corrections create a new vintage.
- **Hash chain**: each batch stores `sha256`, `batch_hash`, and `prev_batch_hash`, plus `adapter_version`.
- **Vintages**: `index_snapshots` is unique on `(index_name, index_date, vintage)`; revisions increment `vintage` rather than overwriting.
- **Zero silent zeroes.** Missing, low-confidence, and simulated cells must be visibly marked. A gap is never rendered as a zero or quietly interpolated.
- **Provenance is a first-class field** (`REAL` | `SIMULATED`) on observations and snapshots.
- **Standard response envelope** on every endpoint: `{ "data": [...], "meta": { page, page_size, total, generated_at } }`.

---

## 9. Success Criteria (demo checklist — PRD section 8)

| # | Criterion | Verification |
| :--- | :--- | :--- |
| 1 | Continuous unattended daily index | 30 consecutive published days |
| 2 | Agreement with official DGCA data | Pearson R-squared >= 0.88 vs DGCA monthly route averages |
| 3 | Quantified drip-pricing gap | TCT-AFI minus AFI shown numerically in the hero |
| 4 | Independent reproducibility | Live recomputation of a past date from stored raw records |
| 5 | Attribution reconciliation | sum(contributions) == delta(total), shown live |
| 6 | Transparency of uncertainty | Quality badges, coverage, imputation % on every card face |
| 7 | Zero silent zeroes | Missing / low-confidence / simulated cells hatched and labeled |

---

## 10. Current Build State (as of 2026-09-26)

**Documentation is complete; implementation is approximately 3% done.** Every directory the TRD promises exists, but most contain only a `README.md` describing the files that *should* be there.

| Component | State |
| :--- | :--- |
| `PRD.md`, `TRD.md` | DONE — complete v2.1 |
| `landing/frontend` | PARTIAL — working Vite + React 19 page, but violates token rules (inline hex), money in rupees not paise, hardcoded `localhost:3000` |
| `packages/design-tokens` | DONE — real `tokens.css` + Tailwind preset |
| `packages/shared-types` | EMPTY — `export {}` placeholder |
| `landing/backend` | EMPTY — `.env.example` + README only |
| `dashboard/frontend` | EMPTY — 9 README stubs, no `.tsx`, no `package.json` |
| `dashboard/backend` | EMPTY — 8 README stubs, no `.py` |
| `services/collector` | EMPTY — 5 README stubs |
| `infra/` db, firebase, docker | EMPTY — no migrations, no compose file, no rules |
| `data/seed` | EMPTY — no generator |

### Known defects carried forward (for @REPAIR / @FE)

1. `landing/frontend/src/App.tsx` — roughly 60 hardcoded hex values inline, never imports the design tokens, no Tailwind, no dark mode, not split into `src/views` + `src/components` per TRD Part G.
2. `landing/frontend/src/mockData.ts` — money in rupees (`baseFare: 4850`), violating Rule 7 (integer paise).
3. `http://localhost:3000` hardcoded in three places in `App.tsx`.
4. Quality metadata in the hero is decorative static text, not a real `QualityBadge` (violates Rule 5).
5. No 45-degree hatch treatment exists yet for `SIMULATED` provenance (Rule 6).
6. `package-lock.json` is committed alongside `pnpm-workspace.yaml` + `packageManager: pnpm@9` — pick one package manager.
7. `dev:dashboard` cannot resolve: `dashboard/frontend` has no `package.json`.

### Pipeline position
Planning agents (@PM, @GUARD, @ARCH, @DESIGN) have **not** produced AeroFareX output — the prior contents of `shared_memory/` belonged to an unrelated project and are archived under `shared_memory/_archive/patha-shilpa/`. The root `PRD.md` and `TRD.md` are authoritative and stand in for @PM and @ARCH output. The three hard gates (@SEC, @ETHICS, @QA) are unrun.

**Recommended next actions, in order:**
1. **@BE -> `dashboard/backend/server/econometrics/`** — nothing can be demonstrated or tested until Laspeyres + Jevons + attribution exist and reconcile to 1e-4.
2. **@BE -> `data/seed/`** — unblocks both frontends via `NEXT_PUBLIC_USE_MOCK=true` with no database.
3. **@ARCH -> `infra/db/migrations/`** — the DDL in TRD Part E is ready to transcribe.
4. **@REPAIR / @FE -> `landing/frontend`** — token refactor, paise conversion, env-driven portal URL.

---

## 11. Context Update Protocol

Per `Global_system_rules.md` section 3, whenever there is an addition, erasure, or shift in architecture or process, the AI **must explicitly ask**: *"Should I add these new details to the final_project_context.md?"* — and update **only** on an explicit YES. This prevents unwanted state overwrites and preserves a rollback path.
