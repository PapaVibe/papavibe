export function getStatus() {
  return {
    ok: true,
    service: "PapaVibe",
    stage: "local-demo",
    supportedActionTypes: ["transfer", "approve", "contract_interaction"],
    supportedVerdicts: ["approve", "manual_review", "block"],
    contractSourceOfTruth: "packages/schemas/src/contract.ts",
    contractArtifacts: ["GET /contract", "docs/review-api-contract.json"],
    endpoints: ["GET /health", "GET /status", "GET /contract", "GET /endpoints", "POST /review"],
    demoScenarios: [
      "bad",
      "good",
      "manual_review",
      "missing_amount",
      "action_mismatch",
      "amount_too_high",
      "unknown_allowed_target",
      "malformed_amount_payload",
      "missing_context_fields"
    ],
  };
}
