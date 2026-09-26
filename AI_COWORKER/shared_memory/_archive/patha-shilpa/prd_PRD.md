# Product Requirement Document (PRD): Patha-Shilpa (v1.0 MVP)

> **Owner**: `@PM` (Product Manager & Orchestrator)
> **Status**: FINALIZED & APPROVED
> **Target Users**: Rural Indian Artisans, Global Craft Buyers, Field Supervisors, Handcraft Clusters
> **Key Value Proposition**: Complete listing creation and fair pricing in offline airplane mode with intelligent silent sync.

---

## Feature Modules & Functional Specifications

### 1. Authentication & Role Selection (`@PM-FEAT-01`)
- Phone number input with Firebase Phone OTP (`firebase_auth.verifyPhoneNumber`).
- Role selection screen on first login: "I make things" (मैं बनाता/बनाती हूँ) vs. "I want to buy" (मुझे खरीदना है).
- Write role to `users/{uid}` (immutable post-creation) and mirror to Hive `session` box for fast shell routing.

### 2. Four-Step Add-Product Workflow (`@PM-FEAT-02`)
- **Step 1: Visual Capture & Quality**:
  - Image capture via camera/gallery.
  - On-device quality check (Laplacian blur/brightness score) and MobileNetV3 evaluation.
  - Offline center-crop & 1200x1200 white padding. Online upgrade: RMBG-1.4 background removal + Real-ESRGAN upscaling via fal.ai.
- **Step 2: Vernacular Voice Description**:
  - Offline: Vosk on-device Indic ASR. Tier 3 fallback: Audio recording + guided attribute picker (craft, material, color, hours).
  - Online: Sarvam AI + Bhashini ULCA Indic speech recognition and translation.
- **Step 3: Cost & Time Input**:
  - Direct input of raw material cost (₹) and labor hours spent.
- **Step 4: Review & Pricing Confirmation**:
  - Auto-generated bilingual title and description (Gemini 2.0 Flash online / ARB template offline).
  - Deterministic pricing computation: Floor price, Suggested price, Maximum price, and Hindi rationale.
  - Voice readback of title and suggested price via Bhashini TTS (online) or `flutter_tts` (offline).
  - Artisan can adjust and confirm `priceFinal`.

### 3. Offline Engine & Idempotent Sync (`@PM-FEAT-03`)
- Save complete product draft to Hive `drafts` box with client UUID `localId`.
- "Offline Draft" status badge displayed on the artisan home screen.
- Auto-sync worker listening on `connectivity_plus` network stream:
  - Upload compressed images (`processed.jpg` $\le$ 300KB, `audio.m4a` $\le$ 100KB, `original.jpg` $\le$ 1.5MB).
  - Upsert Firestore document `products/{localId}`.
  - AI upgrade (Gemini copy + fal.ai media enhancements) without altering confirmed `priceFinal`.
  - State progression: `CAPTURED` $\rightarrow$ `OFFLINE_PROCESSED` $\rightarrow$ `SYNCING` $\rightarrow$ `AI_UPGRADED` $\rightarrow$ `LIVE`.

### 4. Buyer Exploration & Inquiries (`@PM-FEAT-04`)
- Discover handcrafted products with craft type, region, price, and tag filters.
- Artisan story and provenance block (`giTag`, `cluster`, `technique`, `verifiedBy`).
- Buyer enquiry submission (`quantity`, `message`) stored in `enquiries/{enquiryId}` with real-time artisan alerts.
- RFQ (Request for Quote) creation form for custom bulk craft orders.

### 5. Web Public Showcase (`@PM-FEAT-05`)
- React + Vite + Tailwind marketing site reading public Firestore collections (`products`, `artisans`).
- Highlighting artisan stories, cluster heritage, and craft preservation.
