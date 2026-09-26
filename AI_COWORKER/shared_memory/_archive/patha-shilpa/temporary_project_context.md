# Temporary Project Context: Patha-Shilpa (MVP)

> **Status**: INITIALIZED — Synchronized from Patha-Shilpa Architecture & TRD
> **Owner**: @PM

## Vision
**Patha-Shilpa** is an offline-first, voice-guided cataloging and discovery platform empowering rural Indian artisans to photograph, speak in their vernacular, auto-price fairly, and publish their handcrafted goods to global buyers — fully operational even without internet connectivity.

## Core Architecture
- **Mobile Client**: Flutter (Android baseline: Android 8.0, 2 GB RAM).
- **Backend & RBAC**: Firebase Auth (Phone OTP), Cloud Firestore, Cloud Storage, Firestore Security Rules (4 roles: `artisan`, `buyer`, `moderator`, `dept`).
- **Offline Persistence & Sync**: Hive (`session`, `drafts`, `queue`, `cache_products`, `cache_medians`, `media`), idempotent sync via client-generated UUID (`localId`), server-wins conflict resolution without altering artisan-confirmed `priceFinal`.
- **Vision AI Pipeline**:
  - Offline: MobileNetV3 (quality, lighting & feature scoring) + center-crop/white canvas pad.
  - Online: RMBG-1.4 (background removal via fal.ai), Real-ESRGAN (super resolution via fal.ai), CLIP (zero-shot visual tagging).
- **Voice AI Pipeline**:
  - Offline: Vosk (on-device Indic/Hindi ASR) + Tier 3 record-and-form fallback.
  - Online: Sarvam AI + Bhashini (ULCA) Indic ASR, translation, and TTS.
- **Copy & Listing Intelligence**: Gemini 2.0 Flash (Online structured JSON) $\leftrightarrow$ Rule-based ARB template fill (Offline).
- **Web Showcase**: React 18 + TypeScript + Vite + Tailwind CSS (read-only Firestore).

## Key Invariants & Constraints
1. **Offline Twin for Every Pipeline**: Abstract interfaces with online and on-device offline implementations; router never throws to UI.
2. **Airplane Mode Demonstration**: Complete listing creation and pricing in airplane mode; background silent sync upgrades media/copy on reconnection.
3. **Bilingual Accessibility**: Simultaneous English + Hindi labels on all primary artisan-facing actions; Flutter i18n (`app_en.arb`, `app_hi.arb`, `app_bn.arb`).
4. **Authoritative RBAC**: Enforced at Firestore Security Rules layer.
