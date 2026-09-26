# System Architecture Document: AeroFareX (v2.1)

> **Owner**: @ARCH (System Architect)
> **Status**: FINALIZED
> **Canonical source**: the root [`TRD.md`](../../../TRD.md) v2.1, Parts A, D, E, and G. This file is the @ARCH shared-memory mirror. On any conflict, the root `TRD.md` wins.
> **Stack**: FastAPI (Python 3.11+) x2 · Next.js 18+ App Router · Vite + React 19 · PostgreSQL 16 + TimescaleDB · Firebase (Auth, Firestore, Cloud Storage)

---

## 1. System Topology — Dual-Surface Physical Separation

```text
PUBLIC CITIZENS                              SOVEREIGN ANALYSTS (Firebase Auth JWT)
       |                                                    |
       v                                          VIEWER | ANALYST | ADMIN
+---------------------------+                              |
| landing/frontend  :3001   |            +-----------------+------------------+
| Vite + React 19           |            v                                    v
| Hero index widget         |   +---------------------+          +------------------------+
| Trunk route explorer      |   | dashboard/frontend  |  Bearer  | dashboard/backend      |
| Public methodology        |   | Next.js App Router  |<-------->| FastAPI  server/  :8000|
+------------+--------------+   | :3000               |   JWT    | Econometric engine     |
             | REST/CORS        | Framer Motion       |          | Laspeyres + Hedonic    |
             v                  | Accessible DataTable|          +-----------+------------+
+---------------------------+   +----------+----------+                      |
| landing/backend   :8001   |              | onSnapshot                      | Asyncpg pool
| FastAPI cached, no auth   |              v                                 v
| /api/v1/public/*          |   +---------------------+          +------------------------+
+---------------------------+   | Cloud Firestore     |          | TimescaleDB (PG 16)    |
                                | Scraper health      |          | HT: fare_observations  |
                                | Circuit breakers    |          | HT: index_snapshots    |
                                | Surge alerts        |          | Integer paise only     |
                                +----------+----------+          +-----------+------------+
                                           ^ health                          ^ structured writes
                                           |                                 |
                                +----------+---------------------------------+-----------+
                                | services/collector  (Ingestion Engine)                 |
                                | Runs 02:30 / 05:30 / 13:00 / 19:00 IST                 |
                                | Adapters: IndiGo, Air India, Akasa, SpiceJet, MakeMyTrip|
                                | 3.5s jittered delay, circuit breakers, hash-chained     |
                                | Raw -> gs://aerofarex-raw-observations (append-only)    |
                                +--------------------------------------------------------+
```

**Why the split is physical, not logical:** the public tier must remain online, cacheable, and un-authenticated under citizen-scale load without exposing a single analyst endpoint or database credential. The sovereign tier holds the credentials, the raw ledger, and the econometric engine. Compromise of `landing/*` must not yield any path into `dashboard/*`.

---

## 2. Service Inventory

| Service | Path | Port | Auth | Package rule |
| :--- | :--- | :--- | :--- | :--- |
| Public citizen frontend | `landing/frontend` | 3001 | none | `@aerofarex/landing-frontend` |
| Public cached API | `landing/backend` | 8001 | none | `server/routes`, `server/services`, `server/schemas` |
| Analyst portal | `dashboard/frontend` | 3000 | Firebase JWT | the **only** `src/app` in the repo |
| Econometric backend | `dashboard/backend` | 8000 | Firebase JWT + RBAC | package named **`server`**, never `app` |
| Collector | `services/collector` | — | service account | `adapters/`, `orchestrator/`, `pipeline/`, `storage/` |

---

## 3. API Contracts

Base URL `/api/v1`. **Every** response uses the standard envelope:

```json
{
  "data": [],
  "meta": { "page": 1, "page_size": 50, "total": 1284, "generated_at": "2026-09-21T02:47:11Z" }
}
```

### 3.1 Public endpoints (`landing/backend`, port 8001, CDN-cached, 60 req/min)

- `GET /api/v1/public/latest?series={AFI|TCT-AFI}` — headline values and drip-pricing wedge for the citizen hero.
- `GET /api/v1/public/methodology` — plain-language methodology explainer.
- `GET /api/v1/public/routes/summary` — 5-trunk-sector fare comparison.

### 3.2 Sovereign endpoints (`dashboard/backend`, port 8000, JWT + RBAC, 120 req/min)

| Endpoint | Role |
| :--- | :--- |
| `GET /api/v1/index/latest?series={AFI\|TCT-AFI\|ANC-AFI}` | VIEWER+ |
| `GET /api/v1/index/history?series=AFI,TCT-AFI&from=&to=` | VIEWER+ |
| `GET /api/v1/index/family?date=YYYY-MM-DD` | VIEWER+ |
| `GET /api/v1/index/attribution/{date}` | **ANALYST+** |
| `GET /api/v1/routes` and `GET /api/v1/routes/{routeId}/fares` | VIEWER+ |
| `GET /api/v1/lead-time/matrix?date=YYYY-MM-DD` | VIEWER+ |
| `GET /api/v1/quality/coverage` and `GET /api/v1/quality/imputation` | VIEWER+ |
| `GET /api/v1/health` and `GET /api/v1/sources` | **ANALYST+** |
| `GET /api/v1/observations/{id}` (canonical audit record + SHA-256) | **ANALYST+** |
| `GET /api/v1/methodology` and `GET /api/v1/index/vintages/{date}` | Public / VIEWER |
| `GET /api/v1/export/csv` and `GET /api/v1/export/sdmx` | **ANALYST+** |

**Rule:** RBAC is enforced in `server/core/` middleware. UI role gating is cosmetic and is never the security boundary.

---

## 4. Data Model (TRD Part E)

### 4.1 Enums

`source_type`, `fetch_tier`, `circuit_state`, `missing_reason`, `imputation_rule`, `provenance`, `validation_status`, `job_state`.

### 4.2 Tables

- **`raw_observations`** (append-only ledger) — `raw_id`, `run_id`, `source`, `object_key`, `sha256`, `batch_hash`, `prev_batch_hash`, `adapter_version`, `fetched_at`.
- **`fare_observations`** (TimescaleDB hypertable on `observed_at`) — route, carrier, flight, departure datetime, `advance_days`, fare family, baggage kg, refundability, availability, `missing_reason`, `validation_status`, `provenance`, `fingerprint`. PK `(observation_id, observed_at)`.
- **`fare_components`** — `base_fare_paise`, `fuel_surcharge_paise`, `gst_paise`, `udf_paise`, `psf_paise`, `platform_fee_paise`, `total_payable_paise`, all `BIGINT`.
- **`index_snapshots`** (hypertable on `index_date`) — `index_name`, `value`, `base_value`, `base_period`, `coverage_ratio`, `imputation_ratio`, `provenance`, `vintage`, `is_provisional`. UNIQUE `(index_name, index_date, vintage)`.

### 4.3 Storage invariants

1. `raw_observations` and Cloud Storage objects are **append-only** — no UPDATE, no DELETE.
2. Batches are **hash-chained** via `prev_batch_hash`; a broken chain is a hard audit failure.
3. Index corrections **increment `vintage`**; a published number is never overwritten in place.
4. All money is **`BIGINT` integer paise**.

---

## 5. Econometric Module Layout (`dashboard/backend/server/econometrics/`)

| Module | Responsibility |
| :--- | :--- |
| `jevons.py` | Unweighted geometric mean per route-window cell |
| `booking_curve.py` | Offer-to-transaction correction, weights T+1..T+45 summing to 1.0 |
| `laspeyres.py` | Chained DGCA-weighted index, base Sept 2026 = 100, chain drift < 0.15 |
| `hedonic.py` | Quality-adjustment regression, model h-1.2 |
| `attribution.py` | Waterfall decomposition with a hard 1e-4 reconciliation assertion |
| `outliers.py` | 1.5x IQR flagging (never deleting) plus the imputation cascade |
| `surge.py` | 3.5x MAD surge alerting, deliberately separate from outlier filtering |

**Dependency order:** `outliers` -> `jevons` -> `hedonic` -> `booking_curve` -> `laspeyres` -> `attribution`. `surge.py` is independent of the index path and must not feed back into it.

---

## 6. Failure Points & Mitigations

| # | Failure point | Mitigation |
| :--- | :--- | :--- |
| 1 | A carrier portal blocks or changes its markup | Per-source circuit breaker; CROSS_SOURCE imputation from the remaining sources; `missing_reason = BLOCKED / PARSER_ERROR`; coverage ratio drops visibly rather than silently. |
| 2 | Prolonged multi-source outage | CARRY_FORWARD capped at 3 days, then EXCLUDED; index marked `is_provisional`; coverage badge escalates to a serious band below 90%. |
| 3 | Attribution fails to reconcile | Hard assertion at 1e-4; API returns `reconciled: false`; client renders a prominent warning. Never silently absorbed into a residual. |
| 4 | Float drift in money arithmetic | Integer paise end to end; components asserted to sum exactly to `total_payable_paise`. |
| 5 | Raw artifact tampering | SHA-256 per payload plus a `prev_batch_hash` chain; recomputation test in CI. |
| 6 | TimescaleDB unavailable | Public tier serves from its own cache with a stale-as-of timestamp shown; the analyst tier degrades to read-only with an explicit banner (no fabricated values). |
| 7 | Frontend blocked on backend delivery | `NEXT_PUBLIC_USE_MOCK=true` against `data/seed` keeps both frontends fully buildable and demonstrable with no database. |
| 8 | Single point of failure in ingestion | 4 runs per day across 5 sources; any single run or source loss is recoverable within the same day. |

---

## 7. Scaling Plan

- **Tier 1 (now)**: 5 routes x 5 windows x 5 sources, roughly 3,000 observations per 30 days — comfortably single-node.
- **Tier 3 (national)**: 120+ sectors including RCS-UDAN. TimescaleDB hypertable partitioning plus continuous aggregates on `observed_at`; collector fans out to a work queue with `job_state` (QUEUED, RUNNING, SUCCESS, RETRY_WAIT, DEAD_LETTER); adapters scale horizontally while the per-domain concurrency limit of 1 is preserved.
- Rate limits (60/min public, 120/min analyst) and CDN caching absorb citizen-scale read traffic without touching the sovereign tier.

---

## 8. Local Development Topology (`infra/docker`)

Docker Compose brings up PostgreSQL 16 + TimescaleDB, the two FastAPI services, and optionally MinIO as a Cloud Storage stand-in. `infra/db/migrations/` holds the DDL from TRD Part E. `infra/firebase/` holds Firestore and Storage security rules enforcing append-only semantics on `gs://aerofarex-raw-observations`. Local data volumes (`infra/docker/pgdata/`, `minio-data/`) are gitignored.
