# PapaVibe Current State

_Last updated: 2026-03-20 (Europe/Kiev)_

## Product thesis

PapaVibe is trust middleware for agent-controlled funds.

Core loop:

`task -> proposed action -> review -> verdict -> execute / pause / abort`

The product is intentionally **not** a wallet or transaction executor. The strongest differentiator in the current MVP is task-action mismatch detection before execution, especially around approvals, transfers, and other money-adjacent contract actions.

## Repo / local state audit

### Branch
- `main`

### Local working tree when this pass started
- Pre-existing untracked docs:
  - `docs/agent-handoff.md`
  - `docs/openclaw-session-backups/`
- No tracked-file edits were present before this pass.

### Repo shape
- `apps/api` - Fastify review service
- `apps/web` - Vite/React browser demo
- `apps/landing` - marketing / public landing page
- `packages/schemas` - shared review contract types
- `packages/demo-data` - demo scenarios / fixtures
- `examples` - host-agent demo, stdin example, smoke check, service inspection
- `scripts` - local start, demo, and MVP verification scripts

## What currently works

### API / trust gate
Verified locally on 2026-03-20:
- API starts with `npm run dev:api`
- Service binds on `http://127.0.0.1:8787`
- `GET /status` works
- `GET /contract` works
- `GET /endpoints` works
- `POST /review` works for all current scripted scenarios

### Smoke / verification scripts
Verified locally on 2026-03-20:
- `powershell -ExecutionPolicy Bypass -File .\scripts\verify-mvp.ps1` -> **passes**
- `scripts\check.cmd` -> **passes**
- `scripts\demo-host-agent.cmd` -> **passes**
- `powershell -ExecutionPolicy Bypass -File .\examples\inspect-service.ps1` -> **passes**

Verified scenario outcomes:
- bad -> `block`
- good -> `approve`
- manual -> `manual_review`
- missing_amount -> `block`
- action_mismatch -> `block`
- amount_too_high -> `block`

### Host-agent demo path
Verified locally on 2026-03-20:
- `node .\examples\host-agent-demo.js .\examples\review-request.bad.json` -> `block`
- Full multi-scenario host-agent demo path runs and prints expected execute / pause / abort behavior.

### Web / browser demo baseline
Verified locally on 2026-03-20:
- `npm run dev:web` starts Vite on `http://localhost:5173/`
- `curl.exe -I http://localhost:5173/` returns `HTTP/1.1 200 OK`
- `npm --workspace apps/web run build` succeeds

### Landing app
Verified locally on 2026-03-20:
- `apps/landing` production build succeeds as part of root `npm run build` once API typing issue is fixed.

## What was broken in this pass

### API TypeScript check/build was failing
Observed on first audit run:
- `npm run check` failed in `apps/api`
- `npm run build` failed in `apps/api`

Failure:
- `Cannot find name 'process'`
- TypeScript suggested missing Node type definitions.

Root cause:
- Root workspace dev dependencies did not include `@types/node`, while the API uses Node globals like `process`.

Fix applied:
- Added `@types/node` to root `devDependencies`
- Ran `npm install` to update the lockfile

Result after fix:
- Root `npm run check` -> **passes**
- Root `npm run build` -> **passes**

## What is still weak / not done

These are not baseline blockers, but they are still real gaps:
- Review logic is still rule-based and narrow
- Counterparty trust is still shallow (`allowedTargets` + target profile heuristics)
- Browser demo only exposes part of the guardrail coverage; deeper cases are script-first
- No real wallet / execution interception yet
- Malformed-input handling is still lighter than it should be for broader external-agent use
- Browser automation from the OpenClaw browser tool could not directly render the local Vite page in this session even though the local dev server itself returned `200 OK`; this looks like environment/tool connectivity rather than an app defect

## Last verified state

### Commands run successfully
- `npm run check`
- `npm run build`
- `npm run dev:api`
- `powershell -ExecutionPolicy Bypass -File .\scripts\verify-mvp.ps1`
- `powershell -ExecutionPolicy Bypass -File .\examples\inspect-service.ps1`
- `npm run dev:web`
- `curl.exe -I http://localhost:5173/`
- `node .\examples\host-agent-demo.js .\examples\review-request.bad.json`

### Expected startup path right now
API:
- `npm run dev:api`
- or `scripts\start-api.cmd`

Web:
- `npm run dev:web`
- or `scripts\start-web.cmd`

Fastest full baseline verification:
- Start API
- Run `powershell -ExecutionPolicy Bypass -File .\scripts\verify-mvp.ps1`
- Start web if you need the browser demo

## Immediate blockers

No hard blocker remains for the local MVP baseline.

The main blocker that existed during this pass was the missing Node typings for the API workspace, and that is now fixed.

## Top next tasks

1. Expand the browser demo so all important guardrails are visible in the UI, not only via scripts.
2. Harden malformed-input validation and error responses at the API boundary.
3. Deepen target / counterparty trust signals beyond simple allowlists and primary-vs-secondary profiles.
4. Add a single clean baseline script that starts API + web and clearly reports readiness for both.
5. Keep docs and demo flow tight for submission / handoff so the strongest path stays obvious: host agent -> PapaVibe -> verdict -> execute/pause/abort.

## Practical recommendation for the next block

Recommended next block: **BLOCK 2 = harden demo + API boundary**.

That means:
- expose the extra negative scenarios in the browser UI
- add stricter request validation and clearer failures
- document one canonical demo path for judges / new developers

That is the highest-leverage move now that the baseline runs again.
