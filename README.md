# PapaVibe

**Trust Gate for Agent-Controlled Funds**

PapaVibe is a trust middleware for autonomous agents handling money-related onchain actions.

Before an agent can execute a sensitive action like a token transfer, approval, or contract interaction, PapaVibe reviews whether that action is trustworthy and aligned with the task the agent was actually assigned.

It then returns one of three decisions:

- **Approve**
- **Manual Review**
- **Block**

## Why this exists

Autonomous agents are starting to control real onchain value, but there is still no reliable trust layer between:

- the task the agent was given
- the action the agent proposes
- the execution of that action onchain

PapaVibe closes that gap.

## Core idea

PapaVibe checks:

- **task-action alignment**
- **action risk**
- **counterparty trust**

before execution is allowed.

## MVP

The MVP supports three high-risk onchain action types:

- `transfer`
- `approve`
- `contract_interaction`

For each proposed action, PapaVibe reviews:

- whether the action matches the assigned task
- whether the action itself is risky
- whether the target is trusted enough

and returns:

- `approve`
- `manual_review`
- `block`

## Hero demo

Assigned task:

> Stake 1000 USDC into approved protocol X

Proposed action:

> Unlimited approve to an unfamiliar contract

PapaVibe detects the mismatch between task and execution path, flags the approval as dangerous, and blocks execution before funds are exposed.

## Main demo path

The most important way to show PapaVibe is not just the browser UI, but the full host-agent flow:

1. a host agent receives a task
2. the host agent proposes an onchain action
3. the host agent sends that action to PapaVibe
4. PapaVibe returns a verdict
5. the host agent either executes, pauses, or aborts

Use:

- `node .\examples\host-agent-demo.js .\examples\review-request.bad.json`
- `node .\examples\host-agent-demo.js .\examples\review-request.good.json`
- `node .\examples\host-agent-demo.js .\examples\review-request.manual.json`

## Local demo run

1. Start backend:
   - `scripts\start-api.cmd`
2. Start frontend:
   - `scripts\start-web.cmd`
3. Open demo:
   - `scripts\demo.cmd`
   - or open `http://localhost:5173/`
4. Run quick check:
   - `scripts\check.cmd`
5. Check service status:
   - `http://127.0.0.1:8787/status`
6. Inspect service contract and endpoints:
   - `powershell -ExecutionPolicy Bypass -File .\examples\inspect-service.ps1`
7. Run the host-agent demo path:
   - `scripts\demo-host-agent.cmd`
8. Or use one helper:
   - `scripts\run-all.cmd`
9. Full MVP verification (API + host-agent flow):
   - `powershell -ExecutionPolicy Bypass -File .\scripts\verify-mvp.ps1`

For the shortest developer path, read:
- `docs\quickstart.md`

For an honest product-state review, read:
- `docs\sanity-pass.md`

For the final MVP testing path, read:
- `docs\mvp-ready.md`

## Demo scenarios

- **Bad scenario** -> `BLOCK`
- **Good scenario** -> `APPROVE`
- **Manual review scenario** -> `MANUAL_REVIEW`
- **Missing amount example** -> `BLOCK`

## Repository structure

- `apps/web` - demo frontend
- `apps/api` - review API
- `packages/schemas` - shared request/response schemas
- `packages/demo-data` - demo tasks, targets, scenarios
- `docs/` - hackathon docs, logs, architecture, submission notes, and integration docs
- `scripts/start-api.cmd` - start backend locally
- `scripts/start-web.cmd` - start frontend locally
- `examples/` - ready-made review payloads, a simple local call script, and a smoke check

## Integration

PapaVibe is meant to sit between an agent's planned action and final execution.

Read `docs/integration.md` for:
- what the agent sends
- what PapaVibe returns
- how the agent should react to the verdict
- a minimal integration example
- verified example payloads for `approve`, `block`, and `manual_review`

## Hackathon notes

This project is being built for **The Synthesis** under the theme **Agents that trust**.

We are treating the following as hard constraints:

- open source by default
- working demo over concept-only scope
- document human + agent collaboration
- keep Ethereum/onchain context meaningful
- keep the agent as a real participant in the workflow
