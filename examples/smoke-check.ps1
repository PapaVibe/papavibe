$base = "http://127.0.0.1:8787/review"
$root = "C:\Users\petro\.openclaw\workspace\papavibe\examples"

$checks = @(
  @{ name = "bad"; path = "$root\review-request.bad.json"; expected = "block" },
  @{ name = "good"; path = "$root\review-request.good.json"; expected = "approve" },
  @{ name = "manual"; path = "$root\review-request.manual.json"; expected = "manual_review" },
  @{ name = "missing_amount"; path = "$root\review-request.missing-amount.json"; expected = "block" },
  @{ name = "action_mismatch"; path = "$root\review-request.action-mismatch.json"; expected = "block" }
)

$failed = $false

foreach ($check in $checks) {
  $body = Get-Content $check.path -Raw
  $response = Invoke-WebRequest -UseBasicParsing $base -Method POST -ContentType "application/json" -Body $body |
    Select-Object -ExpandProperty Content |
    ConvertFrom-Json

  $ok = $response.verdict -eq $check.expected
  Write-Host ($check.name + ": expected=" + $check.expected + ", got=" + $response.verdict)

  if (-not $ok) {
    $failed = $true
  }
}

if ($failed) {
  exit 1
}
