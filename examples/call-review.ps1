$base = "http://127.0.0.1:8787"
$payloadPath = $args[0]
if (-not $payloadPath) {
  Write-Host "Usage: .\call-review.ps1 <path-to-json>"
  exit 1
}

$body = Get-Content $payloadPath -Raw
Invoke-WebRequest -UseBasicParsing "$base/review" -Method POST -ContentType "application/json" -Body $body |
  Select-Object -ExpandProperty Content
