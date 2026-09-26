# AeroFareX: Real-time Airfare Price Index for India
## Technical Requirements & Build Specification Document (TRD) · Version 2.1
**Project:** AeroFareX  
**Companions:** AeroFareX PRD v2.1  
**Stack Architecture:**
- **Public Citizen Landing Surface (`landing/`):**
  - **Frontend (`landing/frontend`):** Lightweight Next.js / Vite, TypeScript, Tailwind CSS (bound to `packages/design-tokens`), citizen fare widget, public methodology.
  - **Backend (`landing/backend`):** FastAPI (Python 3.11+), Pydantic v2, in-memory/Redis cached public endpoints (`/api/v1/public/*`), zero authentication barrier.
- **Sovereign Analyst & Econometric Platform (`dashboard/`):**
  - **Frontend (`dashboard/frontend`):** Next.js 18+ App Router (`src/app`), TypeScript, Tailwind CSS, Framer Motion, Firebase Auth SDK (RBAC: VIEWER, ANALYST, ADMIN), Accessible DataTables.
  - **Backend (`dashboard/backend/server`):** FastAPI (Python 3.11+), Pydantic v2, NumPy, Pandas, Scipy, Statsmodels, SQLAlchemy / Asyncpg, Firebase Admin SDK.
- **Data & Ingestion Engine (`services/collector`):** Python/Playwright/curl_cffi direct API adapters, Rate-limited ethical scraper (3.5s jittered delays, circuit breakers).
- **Databases & Cloud Storage:** PostgreSQL 16 with TimescaleDB extension, Firebase Cloud Storage (Raw artifacts), Cloud Firestore (Live health & telemetry).

---

## Part A · System Architecture & Tech Stack

```
   ┌────────────────────────────────────────────────────────┐
   │            Public Citizens & General Fliers            │
   └───────────────────────────┬────────────────────────────┘
                               │ HTTP / HTTPS
                               ▼
   ┌────────────────────────────────────────────────────────┐
   │          landing/frontend (Public Next.js)             │
   │  • Headline AFI & TCT-AFI Widget (+12.6% Drip Gap)     │
   │  • Public Methodology & Citizen Fare Comparison        │
   └───────────────────────────┬────────────────────────────┘
                               │ REST / CORS
                               ▼
   ┌────────────────────────────────────────────────────────┐
   │          landing/backend (FastAPI Public Cache)        │
   │  • GET /api/v1/public/latest                           │
   │  • GET /api/v1/public/methodology                      │
   └────────────────────────────────────────────────────────┘

                               ══════════════════════════════════════════════════════════════════

                               ┌─────────────────────────────────────────┐
                               │       Firebase Auth (JWT + RBAC)        │
                               │    Roles: VIEWER | ANALYST | ADMIN      │
                               └────────────────────┬────────────────────┘
                                                    │
                 ┌──────────────────────────────────┴──────────────────────────────────┐
                 ▼                                                                     ▼
   ┌───────────────────────────┐      HTTP REST / Bearer JWT            ┌─────────────────────────────┐
   │    dashboard/frontend     ├───────────────────────────────────────►│      dashboard/backend      │
   │ Next.js App Router (src/) │                                        │ (FastAPI server/ package)   │
   │ Framer Motion Animations  │◄───────────────────────────────────────┤ Econometric Index Engine    │
   │ Accessible DataTables     │      Standard Response Envelope        │ Chained Laspeyres & Hedonic │
   └─────────────┬─────────────┘                                        └──────────────┬──────────────┘
                 │                                                                     │
                 │ Firestore onSnapshot                                                │ Asyncpg Pool
                 ▼                                                                     ▼
   ┌───────────────────────────┐                                        ┌─────────────────────────────┐
   │      Cloud Firestore      │                                        │   TimescaleDB (PostgreSQL)  │
   │ • Live Scraper Health     │                                        │ • Hypertable: observations  │
   │ • Circuit Breaker States  │                                        │ • Hypertable: snapshots     │
   │ • Real-time Surge Alerts  │                                        │ • Integer paise everywhere  │
   └─────────────▲─────────────┘                                        └──────────────▲──────────────┘
                 │                                                                     │
                 │ Health Updates                                                      │ Structured Writes
                 │                                                                     │
   ┌─────────────┴─────────────────────────────────────────────────────────────────────┴──────────────┐
   │                           services/collector (Ingestion Engine)                                  │
   │ • Scheduled Runs: 02:30, 05:30, 13:00, 19:00 IST                                                 │
   │ • Declared Scraping Adapters: IndiGo, Air India, Akasa, SpiceJet, MakeMyTrip                     │
   │ • 3.5s Jittered Delays & Circuit Breaker Logic (HEALTHY -> DEGRADED -> OPEN -> RECOVERING)       │
   │ • Hash-chained Batches & Raw Artifacts pushed to Firebase Storage (gs://aerofarex-raw-observations) │
   └──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Part B · Mathematical & Econometric Methodology

### 1. The Chained DGCA-Weighted Laspeyres Formula
The national headline index **AFI** on day $t$ relative to base period $0$ is computed as:

$$\text{AFI}_t = 100 \times \sum_{r \in R} \left[ W_r \times \sum_{k \in K} \left( \omega_k \times \frac{P_{r,k,t}}{P_{r,k,0}} \right) \right]$$

Where:
* $r \in R$: The 5 representative route sectors ($R = \{\text{DEL-BOM}, \text{DEL-BLR}, \text{BOM-BLR}, \text{DEL-CCU}, \text{BLR-HYD}\}$).
* $W_r$: Normalized official DGCA passenger volume share for route $r$ ($\sum_{r \in R} W_r = 1.0$).
* $k \in K$: Advance booking horizons ($K = \{T+1, T+7, T+15, T+30, T+45\}$).
* $\omega_k$: Empirical booking share allocation (derived from DGCA booking curves; $\sum_{k \in K} \omega_k = 1.0$).
* $P_{r,k,t}$: Elementary cell aggregate (Jevons geometric mean of sanitized fares on day $t$).
* $P_{r,k,0}$: Base period price benchmark (September 2026 = 100).
* **Monthly Chaining:** Links new route shares periodically to prevent long-term basket distortion while restricting chain drift to $< 0.15$.

### 2. Elementary Aggregation (Cell Level)
For every route-window cell $(r, k)$ on day $t$, individual quotes are aggregated using the unweighted geometric mean:
$$P_{r,k,t} = \left( \prod_{i=1}^{N_{r,k,t}} p_{r,k,t,i} \right)^{\frac{1}{N_{r,k,t}}}$$
*Using geometric mean satisfies the axiomatic properties of transitivity and commensurability under IMF/ILO Consumer Price Index Manual standards.*

### 3. Offer-to-Transaction Correction (Booking Curve)
Advertised fares at short horizons ($T+1$) exhibit sharp exponential spikes, but represent minimal passenger volume. The booking curve weights each horizon empirically:
- **$T+1$ (Emergency / Day-before):** $\omega_{T+1} = 0.10$ (or $0.08$)
- **$T+7$ (Short-lead business):** $\omega_{T+7} = 0.22$
- **$T+15$ (Mid-lead leisure/business):** $\omega_{T+15} = 0.35$
- **$T+30$ (Standard advance):** $\omega_{T+30} = 0.23$
- **$T+45$ (Early bird):** $\omega_{T+45} = 0.10$

### 4. Hedonic Quality-Adjustment Regression ($h\text{-1.2}$)
To ensure changes in fare family inclusions (e.g. loss of free baggage, change fees) are not recorded as pure inflation, prices are quality-adjusted:
$$\ln(p_i) = \beta_0 + \sum_{m} \beta_m X_{i,m} + \sum_{\tau} \delta_\tau D_{i,\tau} + \epsilon_i$$
Where $X_{i,m}$ represents characteristic vector $m$ (carrier LCC status, departure time band, baggage allowance kg, refundability flag), and $D_{i,\tau}$ are time dummy coefficients capturing true underlying price movement.

### 5. Movement Attribution Engine (Waterfall Decomposition)
When $\text{AFI}_t$ moves by $\Delta I_t = \text{AFI}_t - \text{AFI}_{t-1}$, the change is decomposed additively:
$$\Delta I_t = \sum_{r \in R} \delta_r = \sum_{c \in C} \delta_c = \sum_{k \in K} \delta_k = \sum_{m \in M} \delta_m = \delta_{\text{fuel}} + \delta_{\text{demand}}$$
* **Reconciliation Constraint:** The API enforces $\left| \sum \delta - \Delta I_t \right| < 10^{-4}$ and flags `reconciled: true`. If the client detects a mismatch, a prominent reconciliation warning is displayed.

---

## Part C · Design Tokens & UI Component Specifications

### 1. Color Palette & Semantic Tokens
Defined once as CSS custom properties in `tokens.css` and mapped to Tailwind utilities:

```css
:root {
  /* Surfaces & Ink */
  --page: #f9f9f7;
  --surface: #fcfcfb;
  --surface-raised: #ffffff;
  --brand: #12304a;          /* Top bar chrome only; never a data mark */
  --brand-accent: #0b6e8f;   /* Links, active nav indicator, focus rings */
  --text-primary: #0b0b0b;
  --text-secondary: #52514e;
  --text-muted: #898781;
  --grid: #e1e0d9;
  --axis: #c3c2b7;
  --border: rgba(11, 11, 11, 0.10);

  /* Categorical Series (Fixed Slot Order - Never Recycled) */
  --slot-1: #2a78d6;  /* Blue: AFI Headline / IndiGo */
  --slot-2: #eb6834;  /* Orange: TCT-AFI / Air India */
  --slot-3: #1baf7a;  /* Aqua: AFI uncorrected / Akasa Air */
  --slot-4: #eda100;  /* Yellow: ANC-AFI / SpiceJet */
  --slot-5: #e87ba4;  /* Magenta: MakeMyTrip */

  /* Status Colors (Never reused as series lines) */
  --status-good: #0ca30c;
  --status-warning: #fab219;
  --status-serious: #ec835a;
  --status-critical: #d03b3b;

  /* Typography & Elevation */
  --r-sm: 4px; --r-md: 8px; --r-lg: 12px; --r-pill: 999px;
  --e-1: 0 1px 2px rgba(11, 11, 11, 0.06);
  --e-2: 0 4px 12px rgba(11, 11, 11, 0.10);
  --e-3: 0 12px 32px rgba(11, 11, 11, 0.16);
  --dur-fast: 120ms; --dur-base: 200ms;
}

[data-theme='dark'] {
  --page: #0d0d0d;
  --surface: #1a1a19;
  --surface-raised: #242423;
  --text-primary: #ffffff;
  --text-secondary: #c3c2b7;
  --text-muted: #898781;
  --grid: #2c2c2a;
  --axis: #383835;
  --border: rgba(255, 255, 255, 0.10);
  --slot-1: #3987e5;
  --slot-2: #d95926;
  --slot-3: #199e70;
  --slot-4: #c98500;
  --slot-5: #d55181;
}
```

### 2. Seven Non-Negotiable Frontend Rules
1. **No Dual-Axis Charts Anywhere:** Multiple series must share a single Y-axis or be converted into two separate stacked charts.
2. **Fixed Categorical Slot Order:** Colors follow the entity, never the filtered rank. Removing a carrier does not repaint remaining lines.
3. **Neutral Grey Midpoint on Diverging Ramps:** Used only where zero-crossing occurs (waterfalls, period change). Never place a distinct hue at zero.
4. **Accessible Table View on Every Chart:** Every `ChartFrame` provides a toggle switch producing a semantic, sortable `DataTable`.
5. **Mandatory Quality Metadata:** Every published index number is accompanied by a `QualityBadge`. If coverage $< 90\%$, a serious status band is rendered.
6. **Explicit Texture for Simulated Data:** Records with `provenance == SIMULATED` render with a 45° tone-on-tone hatch pattern.
7. **Integer Paise Throughout:** Money values are strictly represented in integer paise ($1\text{ INR} = 100\text{ paise}$) to eliminate float reconciliation glitches.

---

## Part D · API Contracts & Endpoint Specifications

Base URL: `/api/v1`  
All responses follow the standard envelope:
```json
{
  "data": [ ... ],
  "meta": {
    "page": 1,
    "page_size": 50,
    "total": 1284,
    "generated_at": "2026-09-21T02:47:11Z"
  }
}
```

### Key Endpoints

#### 1. Public Landing Endpoints (`landing/backend` — Port 8001, Public CDN-cached)
- `GET /api/v1/public/latest?series={AFI|TCT-AFI}` (Role: Public — Headline numbers & drip-pricing wedge for citizen hero)
- `GET /api/v1/public/methodology` (Role: Public — Plain-language methodology explainer)
- `GET /api/v1/public/routes/summary` (Role: Public — 5-trunk sector fare comparison)

#### 2. Sovereign Analyst Portal Endpoints (`dashboard/backend` — Port 8000, JWT + RBAC)
- `GET /api/v1/index/latest?series={AFI|TCT-AFI|ANC-AFI}` (Role: VIEWER+)
- `GET /api/v1/index/history?series=AFI,TCT-AFI&from=YYYY-MM-DD&to=YYYY-MM-DD` (Role: VIEWER+)
- `GET /api/v1/index/family?date=YYYY-MM-DD` (Role: VIEWER+)
- `GET /api/v1/index/attribution/{date}` (Role: ANALYST+ — Additive waterfall decomposition)
- `GET /api/v1/routes` & `GET /api/v1/routes/{routeId}/fares` (Role: VIEWER+)
- `GET /api/v1/lead-time/matrix?date=YYYY-MM-DD` (Role: VIEWER+ — T+1 to T+45 booking horizon matrix)
- `GET /api/v1/quality/coverage` & `GET /api/v1/quality/imputation` (Role: VIEWER+)
- `GET /api/v1/health` & `GET /api/v1/sources` (Role: ANALYST+ — Scraper circuit breakers)
- `GET /api/v1/observations/{id}` (Full canonical audit record with SHA-256 hash) (Role: ANALYST+)
- `GET /api/v1/methodology` & `GET /api/v1/index/vintages/{date}` (Role: Public / VIEWER)
- `GET /api/v1/export/csv` & `GET /api/v1/export/sdmx` (Role: ANALYST+)

---

## Part E · PostgreSQL & TimescaleDB Database Schema

### 1. Enums
```sql
CREATE TYPE source_type AS ENUM ('AIRLINE', 'OTA', 'REFERENCE');
CREATE TYPE fetch_tier AS ENUM ('HTTP', 'DYNAMIC', 'BROWSER');
CREATE TYPE circuit_state AS ENUM ('HEALTHY', 'DEGRADED', 'OPEN', 'RECOVERING');
CREATE TYPE missing_reason AS ENUM ('SOLD_OUT', 'NO_FLIGHT', 'MISSING_SOURCE', 'SOURCE_ERROR', 'PARSER_ERROR', 'BLOCKED', 'UNKNOWN');
CREATE TYPE imputation_rule AS ENUM ('CROSS_SOURCE', 'CELL_MEAN', 'CARRY_FORWARD', 'EXCLUDED');
CREATE TYPE provenance AS ENUM ('REAL', 'SIMULATED');
CREATE TYPE validation_status AS ENUM ('VALID', 'INVALID', 'FLAGGED');
CREATE TYPE job_state AS ENUM ('QUEUED', 'RUNNING', 'SUCCESS', 'RETRY_WAIT', 'DEAD_LETTER');
```

### 2. Core Observation & Snapshot Tables
```sql
-- Append-only raw observations
CREATE TABLE raw_observations (
    raw_id UUID PRIMARY KEY,
    run_id UUID NOT NULL,
    source TEXT NOT NULL,
    object_key TEXT NOT NULL, -- Firebase Storage / MinIO URL
    sha256 CHAR(64) NOT NULL,
    batch_hash CHAR(64) NOT NULL,
    prev_batch_hash CHAR(64),
    adapter_version TEXT NOT NULL,
    fetched_at TIMESTAMPTZ NOT NULL
);

-- Granular Fare Observations Hypertable
CREATE TABLE fare_observations (
    observation_id UUID NOT NULL,
    observed_at TIMESTAMPTZ NOT NULL,
    raw_id UUID NOT NULL REFERENCES raw_observations(raw_id),
    source TEXT NOT NULL,
    fetch_tier fetch_tier NOT NULL,
    route_id TEXT NOT NULL,
    carrier_code CHAR(2) NOT NULL,
    flight_number TEXT,
    departure_datetime TIMESTAMPTZ NOT NULL,
    search_date DATE NOT NULL,
    departure_date DATE NOT NULL,
    advance_days SMALLINT NOT NULL,
    fare_family TEXT,
    baggage_allowance_kg SMALLINT,
    refundable BOOLEAN,
    available BOOLEAN NOT NULL DEFAULT true,
    missing_reason missing_reason,
    validation_status validation_status NOT NULL DEFAULT 'VALID',
    provenance provenance NOT NULL DEFAULT 'REAL',
    fingerprint CHAR(64) NOT NULL,
    PRIMARY KEY (observation_id, observed_at)
);
SELECT create_hypertable('fare_observations', 'observed_at');

-- Unbundled Fare Components
CREATE TABLE fare_components (
    observation_id UUID NOT NULL,
    observed_at TIMESTAMPTZ NOT NULL,
    base_fare_paise BIGINT NOT NULL,
    fuel_surcharge_paise BIGINT NOT NULL,
    gst_paise BIGINT NOT NULL,
    udf_paise BIGINT NOT NULL,
    psf_paise BIGINT NOT NULL,
    platform_fee_paise BIGINT NOT NULL DEFAULT 0,
    total_payable_paise BIGINT NOT NULL,
    currency CHAR(3) NOT NULL DEFAULT 'INR',
    PRIMARY KEY (observation_id, observed_at)
);

-- Published Index Snapshots Hypertable
CREATE TABLE index_snapshots (
    snapshot_id UUID PRIMARY KEY,
    index_name TEXT NOT NULL, -- AFI | TCT-AFI | ANC-AFI
    index_date DATE NOT NULL,
    value NUMERIC(10, 4) NOT NULL,
    base_value NUMERIC(10, 4) NOT NULL DEFAULT 100,
    base_period TEXT NOT NULL,
    coverage_ratio NUMERIC(4, 3) NOT NULL,
    imputation_ratio NUMERIC(4, 3) NOT NULL,
    provenance provenance NOT NULL,
    vintage SMALLINT NOT NULL DEFAULT 1,
    is_provisional BOOLEAN NOT NULL DEFAULT false,
    calculated_at TIMESTAMPTZ NOT NULL,
    UNIQUE (index_name, index_date, vintage)
);
SELECT create_hypertable('index_snapshots', 'index_date');
```

---

## Part F · Seed Data & Mock Server Specification

To achieve complete frontend-backend decoupling on Day One, the platform features a mock engine (`NEXT_PUBLIC_USE_MOCK=true`) fueled by pre-calculated seed payloads:
1. **Time Span:** 30 consecutive days of data (e.g. 2026-08-22 to 2026-09-20).
2. **Provenance Split:** First 18 days marked `SIMULATED`, final 12 days marked `REAL` (with an explicit vertical `provenance_boundary` rule drawn in time series charts).
3. **Realistic Price Structure:** $T+1$ fares $2.5\times$ to $4\times$ the $T+45$ fare; weekend departures 15%–25% higher; 1 festival demand surge week.
4. **Component Split:** Base fare 60%–70%, Fuel surcharge 8%–12%, UDF/PSF fixed by airport, GST 5%, Platform fee ₹350–₹550 on OTAs.
5. **Deliberate Edge Cases:** 4% missing cells spread across all `missing_reason` types, flagged outliers retained (demonstrating flag-not-delete policy), and one source in `DEGRADED` status to exercise all 5 UI component states.

---

## Part G · Repository Structure & Monorepo Layout

The repository is organized as a pnpm workspace and modular multi-tier monorepo separating the public citizen surface (`landing/`) from the sovereign econometric engine (`dashboard/`):

```text
AeroFareX/
├── landing/                     # Public Citizen Transparency Surface
│   ├── frontend/                # Public landing web app (citizen transparency, headline index widget)
│   │   ├── src/
│   │   │   ├── views/           # Hero, citizen fare explorer, methodology overview
│   │   │   ├── components/      # Public metric counters, index badges, comparison widgets
│   │   │   └── styles/          # Tailwind styling bound to packages/design-tokens
│   │   ├── .env.example
│   │   └── README.md
│   │
│   └── backend/                 # Public Lightweight REST API (FastAPI, Python 3.11+)
│       ├── server/
│       │   ├── routes/          # Public cached endpoints (/public/latest, /public/methodology)
│       │   ├── services/        # High-level aggregate cache layer (zero authentication required)
│       │   └── schemas/         # Public response envelopes
│       ├── tests/               # Public API regression tests
│       ├── .env.example
│       └── README.md
│
├── dashboard/                   # Sovereign Gated Analyst Platform & Econometric Engine
│   ├── frontend/                # Next.js 18+ Sovereign Analyst Portal
│   │   ├── src/
│   │   │   ├── app/             # Next.js App Router (Role-gated: VIEWER, ANALYST, ADMIN)
│   │   │   ├── components/      # UI component library
│   │   │   │   ├── charts/      # Accessible chart frames, Laspeyres series, lead-time matrix
│   │   │   │   └── ui/          # Quality badges, breadcrumbs, status indicators, DataTables
│   │   │   ├── lib/             # API client, Firebase auth helpers, mock server
│   │   │   ├── styles/          # Global styles importing design tokens
│   │   │   └── types/           # Frontend-specific type augmentations
│   │   ├── .env.example
│   │   └── README.md
│   │
│   └── backend/                 # FastAPI Analytical Backend (Python 3.11+)
│       ├── server/              # Sovereign calculation engine (TimescaleDB, RBAC, SDMX)
│       │   ├── api/v1/          # Versioned REST router modules (index, routes, attribution, audit)
│       │   ├── core/            # Config, security middleware, JWT RBAC verification
│       │   ├── db/              # Asyncpg connection pooling, TimescaleDB sessions
│       │   ├── econometrics/    # Chained Laspeyres, Jevons aggregation, booking curve, hedonic regression
│       │   ├── models/          # SQLAlchemy ORM models for observations, snapshots, ledger
│       │   ├── schemas/         # Pydantic v2 request & response schemas
│       │   └── services/        # Orchestration, cache management, export services
│       ├── tests/               # Unit, integration, and econometric mathematical test suites
│       ├── .env.example
│       └── README.md
│
├── services/
│   └── collector/               # Data Collection & Ingestion Engine
│       ├── adapters/            # Carrier & OTA scrapers (IndiGo, Air India, Akasa, SpiceJet, MakeMyTrip)
│       ├── orchestrator/        # Cron scheduler (02:30, 05:30, 13:00, 19:00 IST), circuit breakers
│       ├── pipeline/            # Fare decomposition, IQR outlier filtering, cell-mean imputation
│       ├── storage/             # SHA-256 batch hasher, Firebase Cloud Storage raw payload archiver
│       ├── .env.example
│       └── README.md
│
├── packages/
│   ├── design-tokens/           # Shared design tokens (tokens.css, Tailwind CSS presets)
│   └── shared-types/            # Canonical TypeScript contracts shared across apps
│
├── infra/
│   ├── db/migrations/           # PostgreSQL 16 + TimescaleDB hypertable DDL migrations
│   ├── firebase/                # Firestore security rules, Storage bucket policies
│   └── docker/                  # Docker Compose multi-container local stack definitions
│
├── data/
│   └── seed/                    # 30-day realistic seed dataset & generator (NEXT_PUBLIC_USE_MOCK)
│
├── PRD.md                       # Product Requirements Document v2.0
├── TRD.md                       # Technical Requirements & Build Specification v2.0
├── README.md                    # Monorepo onboarding guide & non-negotiable rules
├── package.json                 # Root monorepo workspace configuration
└── pnpm-workspace.yaml          # pnpm workspace definition
```


