$base = "http://127.0.0.1:8787"

Write-Host "--- STATUS ---"
Invoke-WebRequest -UseBasicParsing "$base/status" | Select-Object -ExpandProperty Content
Write-Host "`n--- CONTRACT ---"
Invoke-WebRequest -UseBasicParsing "$base/contract" | Select-Object -ExpandProperty Content
Write-Host "`n--- ENDPOINTS ---"
Invoke-WebRequest -UseBasicParsing "$base/endpoints" | Select-Object -ExpandProperty Content
