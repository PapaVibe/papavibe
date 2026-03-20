$base = "http://127.0.0.1:8787/review"

$checks = @(
  @{
    name = "malformed_amount"
    expectedStatus = 400
    expectedError = "invalid_review_request"
    body = @'
{
  "task": {
    "id": "task-malformed-amount-001",
    "intent": "Transfer 10 USDC to treasury",
    "allowedActionTypes": ["transfer"],
    "allowedTargets": ["treasury-wallet"],
    "policy": {
      "allowUnlimitedApproval": false,
      "requireKnownTarget": true
    },
    "amount": {
      "token": "USDC",
      "value": "10"
    }
  },
  "proposedAction": {
    "type": "transfer",
    "token": "USDC",
    "amount": "ten",
    "target": "treasury-wallet",
    "rawDescription": "Transfer ten USDC in malformed text form"
  },
  "context": {
    "agentId": "demo-agent-1",
    "sessionId": "demo-session-boundary-1"
  }
}
'@
  },
  @{
    name = "missing_context"
    expectedStatus = 400
    expectedError = "invalid_review_request"
    body = @'
{
  "task": {
    "id": "task-missing-context-001",
    "intent": "Transfer 10 USDC to treasury",
    "allowedActionTypes": ["transfer"],
    "allowedTargets": ["treasury-wallet"],
    "policy": {
      "allowUnlimitedApproval": false,
      "requireKnownTarget": true
    },
    "amount": {
      "token": "USDC",
      "value": "10"
    }
  },
  "proposedAction": {
    "type": "transfer",
    "token": "USDC",
    "amount": "10",
    "target": "treasury-wallet",
    "rawDescription": "Transfer 10 USDC to treasury"
  },
  "context": {
    "agentId": ""
  }
}
'@
  }
)

$failed = $false

foreach ($check in $checks) {
  try {
    $response = Invoke-WebRequest -UseBasicParsing $base -Method POST -ContentType "application/json" -Body $check.body
    $statusCode = [int]$response.StatusCode
    $payload = $response.Content | ConvertFrom-Json
  }
  catch {
    $statusCode = [int]$_.Exception.Response.StatusCode
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $reader.BaseStream.Position = 0
    $reader.DiscardBufferedData()
    $content = $reader.ReadToEnd()
    $payload = $content | ConvertFrom-Json
  }

  $ok = $statusCode -eq $check.expectedStatus -and $payload.error -eq $check.expectedError
  Write-Host ($check.name + ": expected_status=" + $check.expectedStatus + ", got_status=" + $statusCode + ", expected_error=" + $check.expectedError + ", got_error=" + $payload.error)

  if (-not $ok) {
    $failed = $true
  }
}

if ($failed) {
  exit 1
}
