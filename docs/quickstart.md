# PapaVibe Quickstart

## 1. Start the service

Backend:

```powershell
cmd /c .\scripts\start-api.cmd
```

Frontend:

```powershell
cmd /c .\scripts\start-web.cmd
```

## 2. Check that PapaVibe is alive

```powershell
powershell -ExecutionPolicy Bypass -File .\examples\inspect-service.ps1
```

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

This gives judges and developers one clean path: host-agent verdicts first, UI edge cases second, malformed-input rejection last.

## 6. Try direct integration

```powershell
Get-Content .\examples\review-request.good.json -Raw | node .\examples\review-from-stdin.js
```
