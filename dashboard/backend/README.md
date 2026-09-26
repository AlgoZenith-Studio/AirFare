# dashboard/backend

FastAPI sovereign analytical backend. Python 3.11+, Pydantic v2, NumPy/Pandas/Scipy/Statsmodels,
SQLAlchemy/Asyncpg, Firebase Admin SDK (token verification for RBAC).
Serves authenticated econometric endpoints, TimescaleDB hypertable queries, and cryptographic audit proofs.

Hosts the econometric index engine (chained Laspeyres, Jevons geometric mean, booking-curve
correction, hedonic quality adjustment, movement attribution) and the REST contracts in TRD Part D.
