# Shared Memory — AeroFareX Project Instance

> This folder is the communication bus between all agents.
> **Active project: AeroFareX v2.1** (sovereign airfare price index for MoSPI / SIH 2026).
> **Start here:** [`final_project_context.md`](./final_project_context.md) — omnipresent and binding on every agent.
> **Root source of truth:** [`PRD.md`](../../PRD.md) and [`TRD.md`](../../TRD.md). Where shared memory and those two disagree, the root documents win.

## Folder Structure

```text
shared_memory/
├── final_project_context.md   ← OMNIPRESENT: read before any build work
├── temporary_project_context.md ← superseded; pipeline record only
├── prd/              ← @PM writes here
├── architecture/     ← @ARCH writes here
├── design/           ← @DESIGN writes here
├── frontend/         ← @FE writes here      (empty — no output yet)
├── backend/          ← @BE writes here      (empty — no output yet)
├── security/         ← @SEC writes here     (PENDING — gate unrun)
├── compliance/       ← @ETHICS writes here  (PENDING — gate unrun)
├── tests/            ← @QA writes here      (PENDING — gate unrun)
├── deployment/       ← @OPS writes here     (PENDING — blocked on @QA)
├── logs/             ← @GUARD, @QA, @DATA write here (PENDING)
└── _archive/         ← superseded content, retained not deleted
```

## Current State (2026-09-26)

| Artifact | Owner | Status |
| :--- | :--- | :--- |
| `final_project_context.md` | all | **CURRENT — AeroFareX v2.1** |
| `prd/PRD.md` | @PM | FINALIZED (mirrors root `PRD.md`) |
| `architecture/ARCHITECTURE.md` | @ARCH | FINALIZED (mirrors root `TRD.md`) |
| `design/DESIGN_SYSTEM.md` | @DESIGN | FINALIZED (mirrors `tokens.css` + TRD Part C) |
| `logs/risk_report.md` | @GUARD | PENDING — not run |
| `frontend/`, `backend/` | @FE, @BE | No output yet; build phase barely started |
| `security/`, `compliance/`, `tests/` | @SEC, @ETHICS, @QA | PENDING — all three gates unrun |
| `deployment/` | @OPS | PENDING — blocked until @QA returns PASS |

**Pipeline position:** Phase 4 (build) has begun on `landing/frontend` only. See section 10 of `final_project_context.md` for the full component-by-component build state, the known defect list, and the recommended next actions.

## Rules

1. **After every agent session** → save output to the correct subfolder
2. **Before starting an agent** → feed it `final_project_context.md` plus the files from the subfolders it reads
3. **Never delete** — only append or create new versions. Superseded content goes to `_archive/`.
4. **Gate blocking** → if @SEC, @ETHICS, or @QA output has `approval_status: false`, stop the pipeline
5. **Context updates** → per `Global_system_rules.md` section 3, ask the user explicitly before writing to `final_project_context.md`, and update only on an explicit YES
