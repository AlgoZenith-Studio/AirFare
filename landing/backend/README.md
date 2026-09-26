# landing/backend

Public-facing lightweight REST API service for the citizen landing page.
Python 3.11+, FastAPI, Pydantic v2.

## Responsibilities
- Public read-only cached endpoints (`/api/v1/public/latest`, `/api/v1/public/methodology`)
- Rate-limited and CDN-cache friendly
- Serves high-level aggregated index series to the public landing page with zero auth requirement
- Completely decoupled from the internal authenticated sovereign analyst engine (`dashboard/backend`)
