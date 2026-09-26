# System Architecture Document: Patha-Shilpa (v1.0 MVP)

> **Owner**: `@ARCH` (System Architect)
> **Status**: APPROVED
> **Backend Stack**: FastAPI (Python 3.11) + Docker on Render
> **Database & Storage**: Firebase Admin SDK (Auth, Firestore, Cloud Storage)
> **Local Persistence**: Hive on-device boxes (`session`, `drafts`, `queue`, `cache_products`, `cache_medians`, `media`)
> **Frontend**: Flutter (Android Baseline: Android 8.0, 2GB RAM)

---

## 1. System Topology & Dual-Shell Design

```
┌──────────────────────────────────────────────────────────────┐
│  pathashilpo_frontend   FLUTTER · Single Binary, Dual Shells │
│  ├── 1. SELLER Mode     Onboarding, Add-Product, Enquiries   │
│  └── 2. BUYER Mode      Explore, Product PDP, Enquiries, RFQ │
└──────────────────────────────────────────────────────────────┘
                    │
            HTTPS REST APIs + JWT Auth / Phone OTP
                    ▼
┌──────────────────────────────────────────────────────────────┐
│  pathashilpo_backend    FASTAPI in DOCKER (Render)           │
│  • AI Gateway: fal.ai, Sarvam AI, Bhashini, Gemini           │
│  • Idempotent Sync Controller & Firebase Admin SDK           │
│  • Modular RBAC & Rate Limiting                              │
└──────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────────┐
│  FIREBASE INFRASTRUCTURE                                     │
│  Auth (Phone OTP) · Firestore · Cloud Storage                │
│  Modular RBAC Rules (artisan, buyer, moderator, dept)        │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. API Contracts & Endpoints (`/api/v1`)

- `POST /api/v1/ai/image/process` — Invokes fal.ai RMBG-1.4 background removal, Real-ESRGAN upscaling, and CLIP tagging.
- `POST /api/v1/ai/voice/transcribe` — Invokes Sarvam AI Saaras / Bhashini Indic ASR & translation.
- `POST /api/v1/ai/listing/generate` — Invokes Gemini 2.0 Flash for structured bilingual listing JSON.
- `POST /api/v1/sync/batch` — Idempotent sync worker processing draft products by `localId`.
- `GET  /api/v1/products/` — Catalog querying with craft, price, and tag filters.
