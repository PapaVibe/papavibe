# PapaVibe Current State

_Last updated: 2026-03-20 (Europe/Kiev)_

## Product thesis

PapaVibe is trust middleware for agent-controlled funds.

Core loop:

`task -> proposed action -> review -> verdict -> execute / pause / abort`

PapaVibe is intentionally **not** a wallet or executor. Its job is to stop unsafe or off-task actions before funds move.

## Repo / local state audit

### Branch
- `main`

### Local working tree when this pass started
- Pre-existing untracked docs:
  - `docs/agent-handoff.md`
  - `docs/openclaw-session-backups/`
- No tracked-file edits were present before this Block 4 pass.

### Repo shape
- `apps/api` - Fastify review service
- `apps/web` - Vite/React browser demo
- `apps/landing` - marketing / public landing page
- `packages/schemas` - shared review types + contract source of truth
- `packages/demo-data` - shared demo fixtures and judge-facing scenario metadata
- `examples` - host-agent demo, stdin example, smoke check, service inspection
- `scripts` - local start, demo, verification, and contract generation helpers

## Block 4 contract-and-visibility hardening

Completed in this pass:
- introduced a clearer **contract source of truth** in `packages/schemas/src/contract.ts`
- made the API `/contract` response come directly from that shared contract bundle instead of a separate hand-maintained description
- added a generated machine-readable OpenAPI artifact at `docs/review-api-contract.json`
- added `npm run generate:contract` so the artifact can be refreshed from the shared schema source
- moved the browser demo onto shared fixtures from `packages/demo-data/src/fixtures.ts` so the UI, tests, and judge story stay aligned
- expanded the browser demo explanation layer with judge-facing headlines, trust-focus chips, trust pillars, and plain-language decision summaries
- widened automated coverage using fixture-driven regression tests for both review verdicts and API boundary failures
- added a contract coverage test so the shared OpenAPI bundle is verified in CI/local test runs

## What currently works

### API / trust gate
Verified locally on 2026-03-20:
- API starts with `npm run dev:api`
- Service binds on `http://127.0.0.1:8787`
- `GET /status` works
- `GET /contract` now returns the shared contract bundle including OpenAPI + JSON-schema-style structures
- `GET /endpoints` works
- `POST /review` works for current review fixtures and rejects malformed boundary fixtures with structured `400` responses

### Contract layer
Verified locally on 2026-03-20:
- canonical contract source lives in `packages/schemas/src/contract.ts`
- generated artifact lives at `docs/review-api-contract.json`
- refresh command `npm run generate:contract` works
- runtime contract endpoint and committed artifact now describe the same review API shape

### Automated coverage
Verified locally on 2026-03-20:
- fixture-driven review regression tests pass for:
  - bad -> `block`
  - good -> `approve`
  - manual_review -> `manual_review`
  - missing_amount -> `block`
  - action_mismatch -> `block`
  - amount_too_high -> `block`
  - unknown_allowed_target -> `block`
- boundary regression tests pass for:
  - malformed_amount_payload -> `400 invalid_review_request`
  - missing_context_fields -> `400 invalid_review_request`
- contract bundle presence test passes

### Web / browser demo
Verified locally on 2026-03-20:
- `npm run dev:web` starts Vite on `http://localhost:5173/`
- `npm --workspace apps/web run build` succeeds
- browser UI now explains verdicts in non-technical language and exposes trust signals as:
  - judge headline
  - why-it-matters summary
  - trust-focus chips
  - trust pillars for task alignment / counterparty trust / execution safety
  - plain-language decision story tied to the returned signals

### Host-agent demo path
Still valid and still the canonical live demo:
- `node .\examples\host-agent-demo.js .\examples\review-request.bad.json` -> `block`
- full multi-scenario host-agent demo path still prints expected execute / pause / abort behavior
- browser UI is now the explanation layer after the host-agent path, not a separate disconnected toy

## What is still weak / not done

These are real follow-up gaps, but not blockers for the hackathon demo:
- validation still uses hand-rolled runtime checks rather than being generated directly from the contract schema
- trust data is still static / registry-driven rather than backed by live onchain or reputation sources
- the web UI is richer, but still single-screen and demo-focused rather than a full analyst console
- the API contract artifact is now clear and machine-readable, but not yet published with swagger/redoc-style rendering
- no execution interceptor or wallet integration yet; PapaVibe remains a trust gate in front of execution

## Last verified state

### Commands run successfully
- `npm run generate:contract`
- `npm run check`
- `npm run build`
- `npm run test`
- `powershell -ExecutionPolicy Bypass -File .\scripts\judge-readiness.ps1`

### Expected startup path right now
API:
- `npm run dev:api`
- or `scripts\start-api.cmd`

Web:
- `npm run dev:web`
- or `scripts\start-web.cmd`

Fastest end-to-end verification:
1. `npm run generate:contract`
2. start API
3. run `powershell -ExecutionPolicy Bypass -File .\scripts\judge-readiness.ps1`
4. start web
5. walk judges through host-agent flow first, then the browser explanation layer

## Immediate blockers

No hard blocker remains for the local hackathon demo path.

## Top next tasks

1. Make runtime validation derive directly from the shared contract definitions so schema, docs, and enforcement cannot drift.
2. Add one lightweight external trust input (static protocol metadata snapshot, chain-aware allowlist, or spender classification file).
3. Add a compact judge-mode or presenter-mode UI for live demos.
4. Decide whether to expose `/contract/openapi.json` or a rendered docs page in the API itself.
5. Keep host-agent + browser explanation flow crisp for submission video and live judging.

## Practical recommendation for the next block

Recommended next block: **BLOCK 5 = runtime-enforcement and presentation polish**.

That means:
- derive validation from the shared contract instead of maintaining it separately
- optionally expose rendered API docs from the service itself
- add one stronger externalized trust input
- tighten presenter flow for the hackathon demo and submission video
