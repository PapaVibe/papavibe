# PapaVibe Demo

## Demo goal

Show that PapaVibe can stop an autonomous agent from executing a money-related onchain action that breaks the task it was assigned.

## The story judges should leave with

PapaVibe is not a wallet and not a passive dashboard.

It is a trust gate that sits between:
- the task the agent was given
- the action the agent wants to take
- the final execution step

That means the demo should feel like a product story, not just an API response gallery.

## Hero scenario

### Assigned task
Stake 1000 USDC into approved protocol X.

### Proposed action
Unlimited approve to unfamiliar contract Y.

### PapaVibe review
Checks:
- task-action alignment
- approval risk
- target trust

### Expected verdict
Block

### Why
- target not approved
- approval scope too broad
- action does not remain within task envelope

## Secondary scenario: happy path

### Assigned task
Stake 1000 USDC into approved protocol X.

### Proposed action
Bounded approval to approved contract + correct interaction path.

### Expected verdict
Approve

## Third scenario: manual review

### Assigned task
Transfer 500 USDC to approved treasury destination.

### Proposed action
Transfer 500 USDC to a secondary allowed destination.

### Expected verdict
Manual review

### Why
The action is allowed, but it does not use the primary expected destination.

## Fourth scenario: missing amount

### Assigned task
Transfer USDC to approved treasury destination.

### Proposed action
Transfer to treasury without an explicit amount.

### Expected verdict
Block

### Why
Money-related actions must include an explicit amount.

## Fifth scenario: action type mismatch

### Assigned task
Transfer 250 USDC to approved treasury destination.

### Proposed action
Approve 250 USDC even though the task only allows transfer.

### Expected verdict
Block

### Why
The proposed action type is not allowed by the task.

## Sixth scenario: amount too high

### Assigned task
Transfer 100 USDC to approved treasury destination.

### Proposed action
Transfer 250 USDC to the correct target.

### Expected verdict
Block

### Why
The proposed amount is higher than the amount allowed by the task.

## Canonical demo path

Use the host-agent flow as the main story, then use the browser UI as the edge-case gallery.

### Recommended order
1. show the host agent receiving a task
2. show the proposed action the host agent wants to execute
3. show PapaVibe review
4. show the host agent decision:
   - execute
   - pause and ask human
   - abort execution
5. show malformed-request rejection and extra guardrails in the browser UI or boundary check

### Commands
```powershell
cmd /c .\scripts\demo-host-agent.cmd
powershell -ExecutionPolicy Bypass -File .\examples\boundary-check.ps1
```

The host-agent demo runs the core verdict scenarios:
- bad
- good
- manual review
- missing amount
- action type mismatch
- amount too high

The boundary check proves the API rejects malformed payloads with structured `400 invalid_review_request` errors.

## Judge narration cheat sheet

Use language like this:
- "The agent got a valid task."
- "Now the agent is proposing a specific money movement."
- "PapaVibe checks whether that move still deserves trust."
- "If trust holds, execution continues. If not, the flow pauses or stops."

## What judges should understand

- the agent had a real task
- the proposed action could drift from that task
- PapaVibe catches that drift before funds move
- trust is being used as an execution gate, not a passive warning
- another AI agent can already adopt this with a simple review call before execution
