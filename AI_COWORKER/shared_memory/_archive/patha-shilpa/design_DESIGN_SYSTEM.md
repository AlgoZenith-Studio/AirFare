# Design System Specification: Patha-Shilpa

> **Owner**: `@DESIGN` (UI/UX Designer)
> **Status**: APPROVED
> **Target Device**: Android Baseline (Android 8.0, 2GB RAM, 720x1280)
> **Rule**: ALWAYS refer to exact HEX codes directly to prevent any discrepancy across all agents and implementations.

---

## 1. Approved Brand Color Palette (Strict 5 HEX Codes)

| HEX Code | RGB Values | Role & Application in UI |
| :--- | :--- | :--- |
| **`#fffbb6`** | `(255, 251, 182)` | Primary app scaffold background canvas (`scaffoldBackgroundColor`) |
| **`#d4a262`** | `(212, 162, 98)` | Secondary accent, heritage badges, verified GI tag highlights |
| **`#cc915c`** | `(204, 145, 92)` | Primary CTA action buttons, floating action buttons, active filter chips |
| **`#bb8f67`** | `(187, 143, 103)` | Card borders, dividers, unselected chip borders, subtle secondary text |
| **`#513a24`** | `(81, 58, 36)` | All primary typography, headings, title text, and high-contrast labels |

---

## 2. Component Design & Placement Rules

### 🛍️ A. Cards & Surfaces
- **Background**: `#FFFFFF` (Surface White) on `#fffbb6` canvas.
- **Borders**: Thin `0.8dp` border using **`#bb8f67`**.
- **Border Radius**: `18dp` (`BorderRadius.circular(18)`).
- **Text & Headings**: Strictly **`#513a24`**.

### 🧭 B. Category Filter Rails
- **Selected State**: Background **`#cc915c`** with white text.
- **Unselected State**: Background `#FFFFFF` with **`#bb8f67`** border and **`#513a24`** text.

### 📱 C. Modals & Draggable Bottom Sheets
- **Background**: `#FFFFFF` with `24dp` rounded top corners.
- **Sticky Footer Action Bar**: Primary bilingual button in **`#cc915c`** floating over bottom fade gradient to **`#fffbb6`**.

### 🎙️ D. Add-Product & Voice Buttons
- **Primary Action Buttons**: Background **`#cc915c`** with white text on top (English) and **`#fffbb6`** subtext (Hindi).
- **Voice Mic Trigger**: Circular button in **`#cc915c`** with gentle pulsing rings in **`#d4a262`**.
