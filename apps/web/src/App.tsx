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

const scenarios: Record<string, ReviewRequest> = {
  bad: {
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
  },
  good: {
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
  },
  manual: {
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
  },
  missingAmount: {
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
  },
  actionMismatch: {
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
  },
  amountTooHigh: {
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
  },
};

const labels: Record<string, string> = {
  bad: "Bad scenario",
  good: "Good scenario",
  manual: "Manual review scenario",
  missingAmount: "Missing amount scenario",
  actionMismatch: "Action mismatch scenario",
  amountTooHigh: "Amount too high scenario",
};

export function App() {
  const [scenario, setScenario] = useState<keyof typeof scenarios>("bad");
  const [result, setResult] = useState<ReviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const current = useMemo(() => scenarios[scenario], [scenario]);

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
    <main style={{ fontFamily: "Arial, sans-serif", maxWidth: 1100, margin: "0 auto", padding: 24, color: "#111" }}>
      <h1 style={{ marginBottom: 4 }}>PapaVibe</h1>
      <p style={{ marginTop: 0, color: "#444" }}>Trust Gate for Agent-Controlled Funds</p>

      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        {Object.entries(labels).map(([key, label]) => (
          <button key={key} onClick={() => { setScenario(key as keyof typeof scenarios); setResult(null); }} style={{ padding: "10px 14px" }}>
            {label}
          </button>
        ))}
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
