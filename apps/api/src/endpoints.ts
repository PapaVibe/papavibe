export function getEndpoints() {
  return {
    endpoints: [
      {
        method: "GET",
        path: "/health",
        purpose: "basic liveness check"
      },
      {
        method: "GET",
        path: "/status",
        purpose: "service status, supported capabilities, and current stage"
      },
      {
        method: "GET",
        path: "/contract",
        purpose: "machine-readable contract bundle and OpenAPI source of truth"
      },
      {
        method: "POST",
        path: "/review",
        purpose: "review a proposed agent action before execution"
      }
    ]
  };
}
