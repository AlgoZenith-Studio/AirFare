# Temporary Project Context: AeroFareX (v2.1)

> **Status**: SUPERSEDED BY `final_project_context.md` — retained for the pipeline record only.
> **Owner**: @PM
> **Note**: AeroFareX did not pass through a raw-idea phase inside this MAS. Requirements arrived already formalized as `PRD.md` v2.1 and `TRD.md` v2.1 at the repository root, which serve as the authoritative @PM and @ARCH artifacts. Build agents must read `final_project_context.md`, not this file.

## Vision

**AeroFareX** is a sovereign-grade, daily-frequency domestic airfare price index for India, built for MoSPI/NSO, RBI, and DGCA. It replaces monthly manual ticket-counter surveys with automated collection across the top DGCA trunk sectors, unbundles every fare quote into its components, corrects advertised prices into realized paid prices, and publishes cryptographically auditable indices.

## Core Architecture

- **Dual-surface separation**: a public citizen transparency tier (`landing/`) and a gated sovereign analyst tier (`dashboard/`), physically separated in the repository and deployed as four independent services.
- **Public tier**: Vite + React 19 frontend (port 3001) and a cached read-only FastAPI (port 8001, `/api/v1/public/*`), no authentication.
- **Sovereign tier**: Next.js 18+ App Router analyst portal (port 3000) and a FastAPI econometric engine (port 8000, package `server/`) behind Firebase Auth JWT with VIEWER / ANALYST / ADMIN roles.
- **Ingestion**: `services/collector` — declared ethical scrapers for IndiGo, Air India, Akasa, SpiceJet, MakeMyTrip, on a 02:30 / 05:30 / 13:00 / 19:00 IST schedule with circuit breakers.
- **Persistence**: PostgreSQL 16 + TimescaleDB hypertables for observations and index snapshots; Firebase Cloud Storage for append-only hash-chained raw payloads; Cloud Firestore for live scraper health telemetry.

## Key Invariants & Constraints

1. **Three indices, one wedge**: AFI (headline base), TCT-AFI (total out-of-pocket), ANC-AFI (ancillaries), plus the tracked drip-pricing spread between TCT-AFI and AFI.
2. **Integer paise everywhere** — no floating-point money in the database, API, or UI.
3. **Append-only provenance** — raw artifacts are never mutated; index corrections create a new vintage.
4. **Attribution must reconcile** to within 1e-4 or the UI must warn loudly.
5. **Declared collection only** — identified User-Agent, off-peak windows, 3.5s jittered delays, zero concurrency per domain. No covert scraping.
6. **Non-commercial** — no ads, affiliate links, or upsells of any kind.
7. **Accessibility** — WCAG 2.1 AA, a table alternative for every chart, no dual-axis charts.
