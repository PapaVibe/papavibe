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

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8787";

const badScenario: ReviewRequest = {
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
  context: {
    agentId: "demo-agent-1",
    sessionId: "demo-session-1",
    reason: "Need approval before staking",
  },
};

const goodScenario: ReviewRequest = {
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
  context: {
    agentId: "demo-agent-1",
    sessionId: "demo-session-2",
    reason: "Bounded approval for staking",
  },
};

const manualScenario: ReviewRequest = {
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
  context: {
    agentId: "demo-agent-1",
    sessionId: "demo-session-3",
    reason: "Treasury operations payment",
  },
};

export function App() {
  const [scenario, setScenario] = useState<"bad" | "good" | "manual">("bad");
  const [result, setResult] = useState<ReviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const current = useMemo(() => {
    if (scenario === "good") return goodScenario;
    if (scenario === "manual") return manualScenario;
    return badScenario;
  }, [scenario]);

  async function runReview() {
    setLoading(true);
    setResult(null);
    const res = await fetch(`${API_BASE}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(current),
    });
    const data = (await res.json()) as ReviewResponse;
    setResult(data);
    setLoading(false);
  }

  return (
    <main style={{ fontFamily: "Arial, sans-serif", maxWidth: 980, margin: "0 auto", padding: 24, color: "#111" }}>
      <h1 style={{ marginBottom: 4 }}>PapaVibe</h1>
      <p style={{ marginTop: 0, color: "#444" }}>Trust Gate for Agent-Controlled Funds</p>

      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <button onClick={() => { setScenario("bad"); setResult(null); }} style={{ padding: "10px 14px" }}>Bad scenario</button>
        <button onClick={() => { setScenario("good"); setResult(null); }} style={{ padding: "10px 14px" }}>Good scenario</button>
        <button onClick={() => { setScenario("manual"); setResult(null); }} style={{ padding: "10px 14px" }}>Manual review scenario</button>
        <button onClick={runReview} disabled={loading} style={{ padding: "10px 14px", fontWeight: 700 }}>
          {loading ? "Running..." : "Run review"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <section style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
          <h2 style={{ marginTop: 0 }}>Assigned task</h2>
          <p><strong>Intent:</strong> {current.task.intent}</p>
          <p><strong>Allowed action types:</strong> {current.task.allowedActionTypes.join(", ")}</p>
          <p><strong>Allowed targets:</strong> {current.task.allowedTargets.join(", ")}</p>
          <p><strong>Policy:</strong> unlimited approval = {String(current.task.policy.allowUnlimitedApproval)}</p>
        </section>

        <section style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
          <h2 style={{ marginTop: 0 }}>Proposed action</h2>
          <p><strong>Type:</strong> {current.proposedAction.type}</p>
          <p><strong>Token:</strong> {current.proposedAction.token || "-"}</p>
          <p><strong>Amount:</strong> {current.proposedAction.amount || "-"}</p>
          <p><strong>Target:</strong> {current.proposedAction.target}</p>
          <p><strong>Description:</strong> {current.proposedAction.rawDescription}</p>
        </section>
      </div>

      <section style={{ border: "1px solid #111", borderRadius: 12, padding: 16, marginTop: 20 }}>
        <h2 style={{ marginTop: 0 }}>Review result</h2>
        {!result && <p style={{ color: "#555" }}>Run a scenario to see the verdict.</p>}
        {result && (
          <>
            <p>
              <strong>Verdict:</strong>{" "}
              <span style={{ color: result.verdict === "approve" ? "green" : result.verdict === "block" ? "crimson" : "#b26a00", fontWeight: 700 }}>
                {result.verdict.toUpperCase()}
              </span>
            </p>
            <p><strong>Reason:</strong> {result.summary}</p>
            <ul>
              {result.signals.map((signal, idx) => (
                <li key={idx}>
                  <strong>{signal.type}</strong>: {signal.message}
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </main>
  );
}
