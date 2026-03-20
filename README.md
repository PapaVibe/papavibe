# PapaVibe

**Trust review before an AI agent moves money**

PapaVibe is an API-first trust middleware for autonomous agents handling onchain funds.

It sits between:
- the task an agent was assigned
- the action the agent wants to take
- the final execution step

Before execution, the agent sends PapaVibe:
- the task
- the proposed action
- basic context

PapaVibe returns one of three verdicts:
- `approve`
- `manual_review`
- `block`

That gives another agent a simple loop to adopt immediately:

**task -> proposed action -> PapaVibe review -> execute / pause / abort**

## One-line submission summary

PapaVibe helps autonomous agents move funds more safely by checking whether a proposed onchain action still deserves trust before execution.

## Short pitch

Autonomous agents can receive a valid task and still choose a dangerous execution path. PapaVibe is the trust gate in front of execution: it compares the assigned task with the exact action the agent wants to take, checks execution risk and counterparty trust, and returns a machine-readable verdict of `approve`, `manual_review`, or `block`. The result is simple for judges to understand and simple for another agent to integrate.

## What problem PapaVibe solves

AI agents can receive a legitimate money-related task and still choose a dangerous execution path.

Example:
- task: stake 1000 USDC into an approved protocol
- proposed action: unlimited approval to an unfamiliar contract

PapaVibe catches that drift before funds move.

## What PapaVibe checks

PapaVibe focuses on three trust questions:

1. **Task alignment**
   - Does the proposed action still match the task the agent was assigned?
2. **Execution risk**
   - Is the action too broad, too large, malformed, or outside policy bounds?
3. **Counterparty trust**
   - Is the destination trusted for that action, token, and economic intent?

## MVP scope

This hackathon MVP is intentionally narrow.

Supported action types:
- `transfer`
- `approve`
- `contract_interaction`

Verdicts:
- `approve`
- `manual_review`
- `block`

Guardrails currently demonstrated:
- block target mismatch
- block unlimited approval when policy forbids it
- block amount above task allowance
- block action type mismatch
- block wrong token
- block unknown or untrusted targets
- block target category mismatch against task intent
- reject malformed requests at the API boundary
- send borderline but allowed flows to `manual_review`

For the disciplined MVP framing, read:
- `docs/mvp-scope.md`

## Why judges and product owners should care

PapaVibe is not a passive warning layer.

It is an **execution gate**.

That means the product value is easy to understand without deep crypto or security context:
- an agent gets a task
- an agent proposes a money movement
- PapaVibe reviews whether that move should be trusted
- the system either proceeds, pauses for a human, or stops

## Start here

If you only have a few minutes, use this order:

1. `docs/submission-assets.md` for the short pitch, summary, and judge-facing framing
2. `docs/demo.md` for the live demo script and narration
3. `docs/quickstart.md` for the fastest cold-start local path
4. `docs/integration.md` for the copy-paste adoption flow

## Integrate PapaVibe

If another AI agent already knows how to construct a proposed action, integration is one extra step:

1. call `GET /status` to verify PapaVibe is alive
2. optionally call `GET /contract` to inspect the schema
3. call `POST /review` before every money-related execution
4. obey the verdict

Minimal integration example:

```ts
const review = await fetch("http://127.0.0.1:8787/review", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ task, proposedAction, context })
}).then((r) => r.json());

if (review.verdict === "approve") {
  // execute transaction
} else if (review.verdict === "manual_review") {
  // pause and ask a human
} else {
  // abort execution
}
```

Fast local examples:

```powershell
powershell -ExecutionPolicy Bypass -File .\examples\call-review.ps1 .\examples\review-request.good.json
Get-Content .\examples\review-request.good.json -Raw | node .\examples\review-from-stdin.js
node .\examples\host-agent-demo.js .\examples\review-request.bad.json
```

The main integration guide is here:
- `docs/integration.md`

## Demo story

The clean demo story for the hackathon is:

1. show the host agent receiving a task
2. show the proposed action
3. show PapaVibe returning `approve`, `manual_review`, and `block`
4. show the host agent executing, pausing, or aborting
5. then show malformed payload rejection and extra guardrails in the browser or boundary check

Hero scenario:
- assigned task: stake 1000 USDC into approved protocol X
- bad action: unlimited approval to unfamiliar contract Y
- expected verdict: `block`

Judge/demo docs:
- `docs/submission-assets.md`
- `docs/demo.md`
- `docs/quickstart.md`
- `docs/mvp-ready.md`

## Local run

Backend:

```powershell
cmd /c .\scripts\start-api.cmd
```

Frontend demo app:

```powershell
cmd /c .\scripts\start-web.cmd
```

Landing page:

```powershell
npm run dev:landing
```

Core checks:

```powershell
cmd /c .\scripts\check.cmd
powershell -ExecutionPolicy Bypass -File .\scripts\verify-mvp.ps1
powershell -ExecutionPolicy Bypass -File .\scripts\judge-readiness.ps1
```

## Repository structure

- `apps/api` - review API
- `apps/web` - browser demo frontend
- `apps/landing` - landing page for judges and adopters
- `packages/schemas` - shared request/response schemas
- `packages/demo-data` - demo tasks, targets, scenarios
- `examples/` - ready-made request payloads and integration examples
- `docs/` - product, demo, scope, and integration docs

## Hackathon framing

Built for **The Synthesis** under the theme **Agents that trust**.

This repo is deliberately trying to feel like a product another agent can already adopt today, not just a concept demo.
