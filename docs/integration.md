# PapaVibe Integration

## One-minute version

PapaVibe is a trust gate for agent-controlled funds.

Another AI agent integrates PapaVibe in one place:
- after it has decided on a money-related action
- before it executes that action

The agent sends:
- the task it was assigned
- the proposed action it wants to take
- basic execution context

PapaVibe returns:
- `approve`
- `manual_review`
- `block`

Your agent then:
- executes
- pauses for a human
- or aborts

That is the whole product loop.

## The simple adoption story

If your agent can already produce a proposed transfer, approval, or contract interaction, you do **not** need to redesign the whole agent.

You only need to add one review call:

1. build the proposed action
2. send it to `POST /review`
3. read the verdict
4. gate execution on that verdict

## When to call PapaVibe

Call PapaVibe **after** the agent has decided what action it wants to take, but **before** the action is executed.

Flow:
1. agent receives task
2. agent prepares proposed action
3. agent calls PapaVibe `/review`
4. PapaVibe returns verdict
5. agent executes, pauses, or aborts

## Endpoints

### Review endpoint

`POST /review`

### Service status endpoint

`GET /status`

Use it to confirm that PapaVibe is running and to see:
- current stage
- supported action types
- supported verdicts
- available endpoints
- available demo scenarios

### Contract endpoint

`GET /contract`

Use it to inspect the request and response shape without opening the source code.

### Endpoint index

`GET /endpoints`

Use it to see the currently available service routes.

## Copy-paste integration example

```ts
const review = await fetch("http://127.0.0.1:8787/review", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ task, proposedAction, context })
}).then((r) => r.json());

if (review.verdict === "approve") {
  // execute transaction
} else if (review.verdict === "manual_review") {
  // stop and ask a human
} else if (review.verdict === "block") {
  // abort execution
} else if (review.error) {
  // malformed request or boundary failure
}
```

## Fastest local test path

### Option 1: send a prepared payload file

```powershell
powershell -ExecutionPolicy Bypass -File .\examples\call-review.ps1 .\examples\review-request.good.json
```

### Option 2: pipe JSON from stdin

```powershell
Get-Content .\examples\review-request.good.json -Raw | node .\examples\review-from-stdin.js
```

### Option 3: run the host-agent demo

```powershell
node .\examples\host-agent-demo.js .\examples\review-request.good.json
```

## Example request

```json
{
  "task": {
    "id": "task-hero-001",
    "intent": "Stake 1000 USDC into approved protocol X",
    "allowedActionTypes": ["approve", "contract_interaction"],
    "allowedTargets": ["protocol-x-router", "protocol-x-vault"],
    "policy": {
      "allowUnlimitedApproval": false,
      "requireKnownTarget": true
    },
    "amount": {
      "token": "USDC",
      "value": "1000"
    }
  },
  "proposedAction": {
    "type": "approve",
    "token": "USDC",
    "amount": "MAX_UINT256",
    "target": "contract-y",
    "rawDescription": "Approve unlimited USDC to contract Y before staking"
  },
  "context": {
    "agentId": "demo-agent-1",
    "sessionId": "demo-session-1",
    "reason": "Need approval before staking"
  }
}
```

## Example response

```json
{
  "verdict": "block",
  "summary": "Action breaks trust constraints and should not proceed.",
  "score": 75,
  "signals": [
    {
      "type": "target_mismatch",
      "severity": "high",
      "message": "Proposed target is outside the allowed task targets."
    },
    {
      "type": "dangerous_approval_scope",
      "severity": "high",
      "message": "Unlimited approval is not allowed by task policy."
    }
  ],
  "recommendedNextStep": "block_execution",
  "receipt": {
    "reviewId": "review-001",
    "timestamp": "2026-03-18T12:00:00.000Z"
  }
}
```

## Malformed-request response

```json
{
  "error": "invalid_review_request",
  "message": "Review request failed validation at the API boundary.",
  "details": [
    "proposedAction.amount must be a positive numeric string or MAX_UINT256 for approvals.",
    "context.sessionId must be a non-empty string."
  ]
}
```

## How an agent should react

- `approve` -> execute the action
- `manual_review` -> pause and ask for human approval
- `block` -> do not execute the action
- `invalid_review_request` -> fix the payload and retry, do not execute blindly

## What the current MVP checks

### Built-in guardrails currently demonstrated
- block when target is outside task scope
- block when approval scope is too broad
- manual review when target is allowed but not primary
- block when a money-related action is missing an explicit amount
- block when the proposed action type is not allowed by the task
- block when the proposed amount is higher than the amount allowed by the task
- block when a task requires a known target profile but the target has no registry entry
- block when the proposed token diverges from the task token
- block when the target is known but not trusted for the proposed action type
- block when the task intent points to protocol funding but the counterparty category looks like treasury/ops, or vice versa
- block when a target requires bounded approvals even if the task otherwise allows unlimited approval
- reject malformed payloads before trust review logic runs

## Ready-made example payloads

- `review-request.bad.json` -> returns `block`
- `review-request.good.json` -> returns `approve`
- `review-request.manual.json` -> returns `manual_review`
- `review-request.missing-amount.json` -> returns `block`
- `review-request.action-mismatch.json` -> returns `block`
- `review-request.amount-too-high.json` -> returns `block`
- `examples\boundary-check.ps1` -> returns structured `400 invalid_review_request` failures for malformed inputs

You can test them locally with:

```powershell
powershell -ExecutionPolicy Bypass -File .\examples\call-review.ps1 .\examples\review-request.bad.json
powershell -ExecutionPolicy Bypass -File .\examples\call-review.ps1 .\examples\review-request.good.json
powershell -ExecutionPolicy Bypass -File .\examples\call-review.ps1 .\examples\review-request.manual.json
```

## Minimal agent-side examples in the repo

### File-based example
- `examples/agent-integration-example.js`

This shows the exact pattern an agent should use:
1. load a task/action payload
2. call PapaVibe `/review`
3. read the verdict
4. either execute, pause, or abort

### Direct stdin integration
- `examples/review-from-stdin.js`

Use it when another agent wants to send payloads directly without writing a prepared file first.

Example:

```powershell
Get-Content .\examples\review-request.good.json -Raw | node .\examples\review-from-stdin.js
```

### Host-agent demo
- `examples/host-agent-demo.js`

Example:

```powershell
node .\examples\host-agent-demo.js .\examples\review-request.bad.json
node .\examples\host-agent-demo.js .\examples\review-request.good.json
node .\examples\host-agent-demo.js .\examples\review-request.manual.json
```
