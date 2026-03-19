# PapaVibe MVP Ready

## What this MVP is

PapaVibe is a trust gate for agent-controlled funds.

It reviews a proposed onchain action before execution and returns one of three decisions:
- approve
- manual_review
- block

## What is included in the MVP

- browser demo
- host-agent demo
- review API
- service status and contract endpoints
- direct integration examples
- smoke-check script
- quickstart path
- sanity-pass document

## What to test

### 1. Browser demo
Run:
- `scripts\start-api.cmd`
- `scripts\start-web.cmd`

Open:
- `http://localhost:5173/`

Check:
- Bad scenario -> BLOCK
- Good scenario -> APPROVE
- Manual review scenario -> MANUAL_REVIEW

### 2. Full service verification
Run:
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\verify-mvp.ps1
```

Expected:
- smoke check passes
- host-agent demo passes
- final line says `MVP verification complete.`

### 3. Direct integration
Run:
```powershell
Get-Content .\examples\review-request.good.json -Raw | node .\examples\review-from-stdin.js
```

Expected:
- verdict = approve

### 4. Service inspection
Run:
```powershell
powershell -ExecutionPolicy Bypass -File .\examples\inspect-service.ps1
```

Expected:
- STATUS
- CONTRACT
- ENDPOINTS

## Honest MVP status

This is a coherent hackathon MVP.
It is not production-ready.
But it is ready for structured manual testing.
