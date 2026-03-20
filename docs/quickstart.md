# PapaVibe Quickstart

## What you are starting

PapaVibe is a trust gate that reviews an agent's money-related action before execution.

The shortest useful local path is:
1. start the API
2. prove the service is alive
3. run the core verdict checks
4. run the host-agent demo
5. optionally open the browser demo and landing page

## 1. Start the service

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

## 2. Check that PapaVibe is alive

```powershell
powershell -ExecutionPolicy Bypass -File .\examples\inspect-service.ps1
```

You should see:
- service status
- endpoints
- supported action types
- supported verdicts

## 3. Run the core service check

```powershell
cmd /c .\scripts\check.cmd
```

Expected:
- bad -> block
- good -> approve
- manual -> manual_review
- missing_amount -> block
- action_mismatch -> block
- amount_too_high -> block

## 4. Run the canonical demo path

Fastest single-command judge path:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\judge-readiness.ps1
```

Or step through it manually.

Start with the host-agent flow:

```powershell
cmd /c .\scripts\demo-host-agent.cmd
```

Then prove the API boundary rejects malformed payloads:

```powershell
powershell -ExecutionPolicy Bypass -File .\examples\boundary-check.ps1
```

## 5. Open the browser demo

Open:

- `http://localhost:5173/`

Then click through these in order:
- `Bad scenario` -> `Run review`
- `Good scenario` -> `Run review`
- `Manual review` -> `Run review`
- `Unknown allowed target` -> `Run review`
- `Malformed amount payload` -> `Run review`
- `Missing context fields` -> `Run review`

This gives judges and developers one coherent story:
- the host agent gets a task
- the host agent proposes an action
- PapaVibe decides whether that action can proceed
- the UI then shows edge cases and malformed-input rejection

## 6. Try direct integration

```powershell
Get-Content .\examples\review-request.good.json -Raw | node .\examples\review-from-stdin.js
```

## 7. Run the full MVP verification

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\verify-mvp.ps1
```

## Where to go next

- `docs/submission-assets.md` -> short summary, pitch, and judging framing
- `README.md` -> product story and adoption path
- `docs/integration.md` -> copy-paste integration guide
- `docs/demo.md` -> judge-facing walkthrough
- `docs/mvp-scope.md` -> MVP boundaries and hackathon discipline
