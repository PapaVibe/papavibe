$root = "C:\Users\petro\.openclaw\workspace\papavibe"
$apiCmd = "cmd /c npm.cmd run dev:api"

$existing = Get-NetTCPConnection -LocalPort 8787 -State Listen -ErrorAction SilentlyContinue
$startedHere = $false
$proc = $null

if (-not $existing) {
  $proc = Start-Process -FilePath "powershell" -ArgumentList "-NoProfile", "-Command", $apiCmd -WorkingDirectory $root -PassThru -WindowStyle Hidden
  $startedHere = $true
  Start-Sleep -Seconds 4
}

Write-Host "--- SMOKE CHECK ---"
cmd /c "$root\scripts\check.cmd"
if ($LASTEXITCODE -ne 0) {
  if ($startedHere -and $proc) { Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue }
  exit 1
}

Write-Host "`n--- HOST AGENT DEMO ---"
cmd /c "$root\scripts\demo-host-agent.cmd"
if ($LASTEXITCODE -ne 0) {
  if ($startedHere -and $proc) { Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue }
  exit 1
}

if ($startedHere -and $proc) {
  Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
}

Write-Host "`nMVP verification complete."
