$root = "C:\Users\petro\.openclaw\workspace\papavibe"
$apiCmd = "cmd /c npm.cmd run dev:api"
$apiStartedHere = $false
$apiProc = $null

function Stop-OwnedApi {
  if ($apiStartedHere -and $apiProc) {
    Stop-Process -Id $apiProc.Id -Force -ErrorAction SilentlyContinue
  }
}

try {
  Write-Host "=== PapaVibe judge readiness ==="

  Write-Host "`n[1/5] Typecheck + build"
  cmd /c "cd /d $root && npm.cmd run check"
  if ($LASTEXITCODE -ne 0) { exit 1 }
  cmd /c "cd /d $root && npm.cmd run build"
  if ($LASTEXITCODE -ne 0) { exit 1 }

  Write-Host "`n[2/5] Automated tests"
  cmd /c "cd /d $root && npm.cmd run test"
  if ($LASTEXITCODE -ne 0) { exit 1 }

  Write-Host "`n[3/5] API readiness"
  $existing = Get-NetTCPConnection -LocalPort 8787 -State Listen -ErrorAction SilentlyContinue
  if (-not $existing) {
    $apiProc = Start-Process -FilePath "powershell" -ArgumentList "-NoProfile", "-Command", $apiCmd -WorkingDirectory $root -PassThru -WindowStyle Hidden
    $apiStartedHere = $true
    Start-Sleep -Seconds 4
  }
  powershell -ExecutionPolicy Bypass -File "$root\examples\inspect-service.ps1"
  if ($LASTEXITCODE -ne 0) { exit 1 }

  Write-Host "`n[4/5] Canonical host-agent path"
  cmd /c "$root\scripts\demo-host-agent.cmd"
  if ($LASTEXITCODE -ne 0) { exit 1 }

  Write-Host "`n[5/5] API boundary path"
  powershell -ExecutionPolicy Bypass -File "$root\examples\boundary-check.ps1"
  if ($LASTEXITCODE -ne 0) { exit 1 }

  Write-Host "`nREADY: judge path passes (types/build/tests/api/host-agent/boundary)."
}
finally {
  Stop-OwnedApi
}
