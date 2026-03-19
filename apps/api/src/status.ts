export function getStatus() {
  return {
    ok: true,
    service: "PapaVibe",
    stage: "local-demo",
    supportedActionTypes: ["transfer", "approve", "contract_interaction"],
    supportedVerdicts: ["approve", "manual_review", "block"],
    endpoints: ["GET /health", "GET /status", "POST /review"],
    demoScenarios: ["bad", "good", "manual_review"],
  };
}
