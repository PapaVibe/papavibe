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

## Block 2 hardening pass

Completed in this pass:
- browser demo now surfaces more negative and edge scenarios directly in the UI, including an unknown-target trust failure and malformed-request boundary failures
- `/review` now validates malformed payloads at the API boundary and returns structured `400 invalid_review_request` responses instead of relying on implicit runtime behavior
- canonical demo path is now explicitly documented as: host-agent flow first, browser edge-case gallery second, malformed-input rejection third

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
- Counterparty trust is still shallow beyond the current registry + task-policy checks
- No real wallet / execution interception yet
- API validation is stronger, but still hand-rolled rather than generated from a formal schema / OpenAPI contract
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

1. Deepen target / counterparty trust signals beyond the current registry + task-policy checks.
2. Add a single clean baseline script that starts API + web and clearly reports readiness for both.
3. Introduce a formal machine-readable API contract (for example JSON Schema/OpenAPI) so validation, docs, and examples stay in lockstep.
4. Add a small automated test suite around review logic and boundary validation so future demo changes do not regress the guardrails.
5. Keep docs and demo flow tight for submission / handoff so the strongest path stays obvious: host agent -> PapaVibe -> verdict -> execute/pause/abort.

## Practical recommendation for the next block

Recommended next block: **BLOCK 3 = trust-depth + lightweight automated coverage**.

That means:
- expand target reputation / counterparty heuristics beyond the current registry model
- add automated tests for both verdict logic and malformed-input rejection
- optionally add one command that brings up the full judge/demo environment and confirms readiness

That is the highest-leverage move now that BLOCK 2 hardening is in place.
