import React, { useMemo, useState } from "react";

type ActionType = "transfer" | "approve" | "contract_interaction";
type Verdict = "approve" | "manual_review" | "block";
type Severity = "low" | "medium" | "high";

type ReviewRequest = {
  task: {
    id: string;
    intent: string;
    allowedActionTypes: ActionType[];
    allowedTargets: string[];
    policy: {
      allowUnlimitedApproval: boolean;
      requireKnownTarget: boolean;
    };
    amount?: {
      token: string;
      value: string;
    };
  };
  proposedAction: {
    type: ActionType;
    token?: string;
    amount?: string;
    target: string;
    rawDescription: string;
  };
  context: {
    agentId: string;
    sessionId: string;
    reason?: string;
  };
};

type ReviewResponse = {
  verdict: Verdict;
  summary: string;
  score: number;
  signals: { type: string; severity: Severity; message: string }[];
  recommendedNextStep: string;
  receipt: { reviewId: string; timestamp: string };
};

type ApiErrorResponse = {
  error: string;
  message: string;
  details?: string[];
};

type DemoScenario = {
  label: string;
  category: "review" | "boundary";
  expected: string;
  note: string;
  payload: unknown;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8787";

const scenarios: Record<string, DemoScenario> = {
  bad: {
    label: "Bad scenario",
    category: "review",
    expected: "block",
    note: "Hero demo: unlimited approval to a suspicious target should be blocked.",
    payload: {
      task: {
        id: "task-hero-001",
        intent: "Stake 1000 USDC into approved protocol X",
        allowedActionTypes: ["approve", "contract_interaction"],
        allowedTargets: ["protocol-x-router", "protocol-x-vault"],
        policy: { allowUnlimitedApproval: false, requireKnownTarget: true },
        amount: { token: "USDC", value: "1000" },
      },
      proposedAction: {
        type: "approve",
        token: "USDC",
        amount: "MAX_UINT256",
        target: "contract-y",
        rawDescription: "Approve unlimited USDC to contract Y before staking",
      },
      context: { agentId: "demo-agent-1", sessionId: "demo-session-1", reason: "Need approval before staking" },
    } satisfies ReviewRequest,
  },
  good: {
    label: "Good scenario",
    category: "review",
    expected: "approve",
    note: "Bounded approval to the primary approved target should pass.",
    payload: {
      task: {
        id: "task-happy-001",
        intent: "Stake 1000 USDC into approved protocol X",
        allowedActionTypes: ["approve", "contract_interaction"],
        allowedTargets: ["protocol-x-router", "protocol-x-vault"],
        policy: { allowUnlimitedApproval: false, requireKnownTarget: true },
        amount: { token: "USDC", value: "1000" },
      },
      proposedAction: {
        type: "approve",
        token: "USDC",
        amount: "1000",
        target: "protocol-x-router",
        rawDescription: "Approve 1000 USDC to approved protocol X router",
      },
      context: { agentId: "demo-agent-1", sessionId: "demo-session-2", reason: "Bounded approval for staking" },
    } satisfies ReviewRequest,
  },
  manual: {
    label: "Manual review",
    category: "review",
    expected: "manual_review",
    note: "Allowed action, but a secondary destination should still force a pause.",
    payload: {
      task: {
        id: "task-manual-001",
        intent: "Transfer 500 USDC to approved treasury destination",
        allowedActionTypes: ["transfer"],
        allowedTargets: ["treasury-wallet", "ops-wallet"],
        policy: { allowUnlimitedApproval: false, requireKnownTarget: true },
        amount: { token: "USDC", value: "500" },
      },
      proposedAction: {
        type: "transfer",
        token: "USDC",
        amount: "500",
        target: "ops-wallet",
        rawDescription: "Transfer 500 USDC to secondary approved ops wallet",
      },
      context: { agentId: "demo-agent-1", sessionId: "demo-session-3", reason: "Treasury operations payment" },
    } satisfies ReviewRequest,
  },
  missingAmount: {
    label: "Missing amount",
    category: "review",
    expected: "block",
    note: "Money-moving actions without an amount should be blocked before execution.",
    payload: {
      task: {
        id: "task-missing-amount-001",
        intent: "Transfer USDC to approved treasury destination",
        allowedActionTypes: ["transfer"],
        allowedTargets: ["treasury-wallet"],
        policy: { allowUnlimitedApproval: false, requireKnownTarget: true },
      },
      proposedAction: {
        type: "transfer",
        token: "USDC",
        target: "treasury-wallet",
        rawDescription: "Transfer USDC to treasury without amount",
      },
      context: { agentId: "demo-agent-1", sessionId: "demo-session-4", reason: "Treasury transfer" },
    } satisfies ReviewRequest,
  },
  actionMismatch: {
    label: "Action mismatch",
    category: "review",
    expected: "block",
    note: "The task only allows a transfer, so an approval attempt should be rejected.",
    payload: {
      task: {
        id: "task-action-mismatch-001",
        intent: "Transfer 250 USDC to approved treasury destination",
        allowedActionTypes: ["transfer"],
        allowedTargets: ["treasury-wallet"],
        policy: { allowUnlimitedApproval: false, requireKnownTarget: true },
        amount: { token: "USDC", value: "250" },
      },
      proposedAction: {
        type: "approve",
        token: "USDC",
        amount: "250",
        target: "treasury-wallet",
        rawDescription: "Approve 250 USDC even though task only allows transfer",
      },
      context: { agentId: "demo-agent-1", sessionId: "demo-session-5", reason: "Unexpected approval" },
    } satisfies ReviewRequest,
  },
  amountTooHigh: {
    label: "Amount too high",
    category: "review",
    expected: "block",
    note: "Correct target, wrong amount: PapaVibe should still stop it.",
    payload: {
      task: {
        id: "task-amount-high-001",
        intent: "Transfer 100 USDC to approved treasury destination",
        allowedActionTypes: ["transfer"],
        allowedTargets: ["treasury-wallet"],
        policy: { allowUnlimitedApproval: false, requireKnownTarget: true },
        amount: { token: "USDC", value: "100" },
      },
      proposedAction: {
        type: "transfer",
        token: "USDC",
        amount: "250",
        target: "treasury-wallet",
        rawDescription: "Transfer 250 USDC even though task only allows 100",
      },
      context: { agentId: "demo-agent-1", sessionId: "demo-session-6", reason: "Unexpected larger transfer" },
    } satisfies ReviewRequest,
  },
  unknownAllowedTarget: {
    label: "Unknown allowed target",
    category: "review",
    expected: "block",
    note: "Even if a target appears in the task, requireKnownTarget should block unknown registry entries.",
    payload: {
      task: {
        id: "task-unknown-target-001",
        intent: "Transfer 75 USDC to a newly suggested settlement address",
        allowedActionTypes: ["transfer"],
        allowedTargets: ["fresh-router"],
        policy: { allowUnlimitedApproval: false, requireKnownTarget: true },
        amount: { token: "USDC", value: "75" },
      },
      proposedAction: {
        type: "transfer",
        token: "USDC",
        amount: "75",
        target: "fresh-router",
        rawDescription: "Transfer 75 USDC to a target with no trust profile on file",
      },
      context: { agentId: "demo-agent-1", sessionId: "demo-session-7", reason: "Suggested by external source" },
    } satisfies ReviewRequest,
  },
  malformedAmount: {
    label: "Malformed amount payload",
    category: "boundary",
    expected: "400 invalid_review_request",
    note: "Boundary check: non-numeric amount strings should be rejected before review logic runs.",
    payload: {
      task: {
        id: "task-malformed-amount-001",
        intent: "Transfer 10 USDC to treasury",
        allowedActionTypes: ["transfer"],
        allowedTargets: ["treasury-wallet"],
        policy: { allowUnlimitedApproval: false, requireKnownTarget: true },
        amount: { token: "USDC", value: "10" },
      },
      proposedAction: {
        type: "transfer",
        token: "USDC",
        amount: "ten",
        target: "treasury-wallet",
        rawDescription: "Transfer ten USDC in malformed text form",
      },
      context: { agentId: "demo-agent-1", sessionId: "demo-session-8", reason: "Malformed payload test" },
    },
  },
  missingContext: {
    label: "Missing context fields",
    category: "boundary",
    expected: "400 invalid_review_request",
    note: "Boundary check: missing agent/session identity should come back as a structured API error.",
    payload: {
      task: {
        id: "task-missing-context-001",
        intent: "Transfer 10 USDC to treasury",
        allowedActionTypes: ["transfer"],
        allowedTargets: ["treasury-wallet"],
        policy: { allowUnlimitedApproval: false, requireKnownTarget: true },
        amount: { token: "USDC", value: "10" },
      },
      proposedAction: {
        type: "transfer",
        token: "USDC",
        amount: "10",
        target: "treasury-wallet",
        rawDescription: "Transfer 10 USDC to treasury",
      },
      context: {
        agentId: "",
      },
    },
  },
};

const chipColors = {
  approve: "#136f3a",
  manual_review: "#9a6700",
  block: "#b42318",
  boundary: "#005cc5",
};

function prettyJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

export function App() {
  const [scenario, setScenario] = useState<keyof typeof scenarios>("bad");
  const [result, setResult] = useState<ReviewResponse | null>(null);
  const [apiError, setApiError] = useState<ApiErrorResponse | null>(null);
  const [httpStatus, setHttpStatus] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const current = useMemo(() => scenarios[scenario], [scenario]);

  async function runReview() {
    setLoading(true);
    setResult(null);
    setApiError(null);
    setHttpStatus(null);

    try {
      const res = await fetch(`${API_BASE}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(current.payload),
      });

      setHttpStatus(res.status);
      const data = (await res.json()) as ReviewResponse | ApiErrorResponse;

      if (!res.ok) {
        setApiError(data as ApiErrorResponse);
        return;
      }

      setResult(data as ReviewResponse);
    } catch (error) {
      setApiError({
        error: "network_error",
        message: error instanceof Error ? error.message : "Failed to reach the PapaVibe API.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ fontFamily: "Arial, sans-serif", maxWidth: 1200, margin: "0 auto", padding: 24, color: "#111", lineHeight: 1.45 }}>
      <h1 style={{ marginBottom: 4 }}>PapaVibe</h1>
      <p style={{ marginTop: 0, color: "#444" }}>Trust Gate for Agent-Controlled Funds</p>

      <section style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16, marginBottom: 20, background: "#fafafa" }}>
        <p style={{ marginTop: 0 }}>
          <strong>Canonical demo path:</strong> run the host-agent flow first, then use this UI to spotlight edge cases and API-boundary rejections.
        </p>
        <p style={{ marginBottom: 0, color: "#555" }}>
          This screen now shows both decision-level guardrails and malformed-request failures so judges can see where PapaVibe blocks bad execution plans versus rejects bad inputs outright.
        </p>
      </section>

      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        {Object.entries(scenarios).map(([key, item]) => (
          <button
            key={key}
            onClick={() => {
              setScenario(key as keyof typeof scenarios);
              setResult(null);
              setApiError(null);
              setHttpStatus(null);
            }}
            style={{
              padding: "10px 14px",
              borderRadius: 999,
              border: key === scenario ? "2px solid #111" : "1px solid #ccc",
              background: key === scenario ? "#111" : "#fff",
              color: key === scenario ? "#fff" : "#111",
              cursor: "pointer",
            }}
          >
            {item.label}
          </button>
        ))}
        <button onClick={runReview} disabled={loading} style={{ padding: "10px 14px", fontWeight: 700, borderRadius: 999, cursor: "pointer" }}>
          {loading ? "Running..." : "Run review"}
        </button>
      </div>

      <section style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16, marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <h2 style={{ margin: 0 }}>{current.label}</h2>
          <span style={{ background: current.category === "review" ? "#ede7ff" : "#e7f1ff", color: current.category === "review" ? "#5b21b6" : "#005cc5", borderRadius: 999, padding: "4px 10px", fontSize: 12, fontWeight: 700 }}>
            {current.category === "review" ? "Guardrail verdict" : "API boundary rejection"}
          </span>
          <span style={{ background: "#f3f4f6", color: "#374151", borderRadius: 999, padding: "4px 10px", fontSize: 12 }}>
            Expected: {current.expected}
          </span>
        </div>
        <p style={{ marginBottom: 0, color: "#555" }}>{current.note}</p>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <section style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
          <h2 style={{ marginTop: 0 }}>Payload sent to /review</h2>
          <pre style={{ margin: 0, whiteSpace: "pre-wrap", overflowX: "auto", fontSize: 13 }}>{prettyJson(current.payload)}</pre>
        </section>

        <section style={{ border: "1px solid #111", borderRadius: 12, padding: 16 }}>
          <h2 style={{ marginTop: 0 }}>API result</h2>
          {!result && !apiError && <p style={{ color: "#555" }}>Run a scenario to see the verdict or validation failure.</p>}

          {httpStatus !== null && (
            <p>
              <strong>HTTP status:</strong> {httpStatus}
            </p>
          )}

          {result && (
            <>
              <p>
                <strong>Verdict:</strong>{" "}
                <span style={{ color: chipColors[result.verdict], fontWeight: 700 }}>
                  {result.verdict.toUpperCase()}
                </span>
              </p>
              <p><strong>Reason:</strong> {result.summary}</p>
              <p><strong>Recommended next step:</strong> {result.recommendedNextStep}</p>
              <ul>
                {result.signals.map((signal, idx) => (
                  <li key={idx}>
                    <strong>{signal.type}</strong> ({signal.severity}): {signal.message}
                  </li>
                ))}
              </ul>
            </>
          )}

          {apiError && (
            <>
              <p>
                <strong>Error:</strong>{" "}
                <span style={{ color: chipColors.boundary, fontWeight: 700 }}>{apiError.error}</span>
              </p>
              <p><strong>Message:</strong> {apiError.message}</p>
              {apiError.details && apiError.details.length > 0 && (
                <>
                  <p><strong>Details:</strong></p>
                  <ul>
                    {apiError.details.map((detail, idx) => (
                      <li key={idx}>{detail}</li>
                    ))}
                  </ul>
                </>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
