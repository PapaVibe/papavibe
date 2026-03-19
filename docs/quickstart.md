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

## 4. Run the host-agent demo

```powershell
cmd /c .\scripts\demo-host-agent.cmd
```

## 5. Open the browser demo

Open:

- `http://localhost:5173/`

Then click:
- `Bad scenario` -> `Run review`
- `Good scenario` -> `Run review`
- `Manual review scenario` -> `Run review`

## 6. Try direct integration

```powershell
Get-Content .\examples\review-request.good.json -Raw | node .\examples\review-from-stdin.js
```
