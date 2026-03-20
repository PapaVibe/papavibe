# PapaVibe Submission Assets

## Project name

PapaVibe

## One-line description

Trust review before an AI agent moves money.

## Short summary

PapaVibe is trust middleware for agent-controlled funds. Before an autonomous agent executes a money-related onchain action, it sends PapaVibe the assigned task and the exact action it wants to take. PapaVibe reviews task alignment, execution risk, and counterparty trust, then returns a machine-readable verdict: `approve`, `manual_review`, or `block`.

## Why this fits "Agents that trust"

The product is built around one core question: should an autonomous agent trust this specific action enough to execute it with real funds? PapaVibe turns that trust question into a concrete pre-execution decision. Instead of assuming the agent will stay inside the task envelope, PapaVibe checks the action, explains the result, and either lets execution continue, pauses for a human, or stops the flow.

## Problem statement

Autonomous agents can receive valid high-level tasks and still choose unsafe execution paths. In crypto, that drift can mean unlimited approvals, wrong targets, wrong tokens, excessive amounts, or malformed requests that should never reach execution. Teams need a simple trust gate that another agent can call before moving money.

## Solution statement

PapaVibe is an API-first trust gate. Another agent sends a task plus a proposed onchain action to `POST /review`, and PapaVibe returns a structured verdict with reasons and recommended next steps. The MVP demonstrates that this gate can approve safe flows, pause ambiguous ones, block unsafe ones, and reject malformed payloads before trust logic even runs.

## 30-second pitch

"PapaVibe is trust middleware for agent-controlled funds. Autonomous agents can get a valid task and still choose a dangerous execution path. PapaVibe sits between the assigned task and the final transaction, reviews whether the proposed action still deserves trust, and returns one of three verdicts: approve, manual review, or block. That makes it easy for judges to understand and easy for another agent to integrate today."

## 2-minute demo outline

1. State the problem: agents can drift from task to execution.
2. Show the hero scenario: valid staking task, but unlimited approval to an unfamiliar contract.
3. Show PapaVibe returning `block`.
4. Show a clean scenario returning `approve`.
5. Show an ambiguous scenario returning `manual_review`.
6. Show malformed payload rejection at the boundary.
7. Close on the product claim: PapaVibe is a trust gate before execution, not a passive warning layer.

## Demo links inside this repo

- `docs/demo.md` - live demo script and narration
- `docs/quickstart.md` - fastest local setup path
- `docs/integration.md` - copy-paste adoption flow
- `README.md` - top-level product story

## Submission-ready proof points

- Clear core loop: `task -> proposed action -> review -> verdict -> execute / pause / abort`
- Real API surface: `GET /status`, `GET /contract`, `GET /endpoints`, `POST /review`
- Real verdict coverage: approve / manual_review / block
- Real malformed-request rejection path with structured `400 invalid_review_request`
- Browser demo plus host-agent demo for judge-facing presentation
- Local scripts for cold-start verification and judge readiness
