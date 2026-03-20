import React, { useMemo, useState } from "react";
import { boundaryFixtures, reviewFixtures, type BoundaryFixture, type ReviewFixture } from "../../../packages/demo-data/src/fixtures";
import type { ApiErrorResponse, ReviewResponse, ReviewSignal } from "../../../packages/schemas/src/review";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8787";
const scenarios = [...reviewFixtures, ...boundaryFixtures];
type DemoScenario = (typeof scenarios)[number];

type TrustPillar = {
  label: string;
  status: "good" | "warning" | "danger";
  detail: string;
};

const chipColors = {
  approve: "#136f3a",
  manual_review: "#9a6700",
  block: "#b42318",
  boundary: "#005cc5",
};

const pillarColors: Record<TrustPillar["status"], string> = {
  good: "#136f3a",
  warning: "#9a6700",
  danger: "#b42318",
};

function prettyJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function isBoundaryFixture(item: DemoScenario): item is BoundaryFixture {
  return item.category === "boundary";
}

function describeSignal(signal: ReviewSignal): string {
  const map: Record<string, string> = {
    target_profile: "Counterparty profile loaded",
    counterparty_risk_medium: "Counterparty carries moderate risk",
    counterparty_risk_high: "Counterparty carries elevated risk",
    action_not_allowed: "Action type drifted from the task",
    missing_amount: "Action amount is missing",
    target_mismatch: "Destination is outside the approved task envelope",
    unknown_target_profile: "Destination has no trusted profile",
    suspicious_target: "Destination is explicitly suspicious",
    task_token_mismatch: "Token changed from the approved task",
    target_action_profile_mismatch: "Destination is not trusted for this action type",
    target_token_profile_mismatch: "Destination is not trusted for this token",
    intent_counterparty_mismatch: "Economic intent does not match the counterparty category",
    dangerous_approval_scope: "Approval scope is too broad",
    bounded_approval_required: "Destination requires bounded approvals",
    amount_exceeds_task: "Amount exceeds the task allowance",
    secondary_allowed_target: "Destination is allowed but not the primary path",
  };

  return map[signal.type] ?? signal.message;
}

function buildTrustPillars(result: ReviewResponse | null, apiError: ApiErrorResponse | null): TrustPillar[] {
  if (apiError) {
    return [
      {
        label: "Input contract",
        status: "danger",
        detail: "The payload failed validation before PapaVibe even considered the trust decision.",
      },
      {
        label: "Agent provenance",
        status: "warning",
        detail: "Request identity or structure is incomplete, so execution cannot be trusted.",
      },
      {
        label: "Execution gate",
        status: "danger",
        detail: "Boundary rejection means the action never reaches the review engine.",
      },
    ];
  }

  if (!result) {
    return [];
  }

  const hasHighSignal = result.signals.some((signal) => signal.severity === "high");
  const hasMediumSignal = result.signals.some((signal) => signal.severity === "medium");
  const hasTargetTrustIssue = result.signals.some((signal) =>
    ["unknown_target_profile", "suspicious_target", "counterparty_risk_high", "counterparty_risk_medium"].includes(signal.type)
  );
  const hasTaskMismatch = result.signals.some((signal) =>
    ["action_not_allowed", "target_mismatch", "task_token_mismatch", "amount_exceeds_task", "intent_counterparty_mismatch"].includes(signal.type)
  );
  const hasApprovalIssue = result.signals.some((signal) =>
    ["dangerous_approval_scope", "bounded_approval_required"].includes(signal.type)
  );

  return [
    {
      label: "Task alignment",
      status: hasTaskMismatch ? "danger" : result.verdict === "manual_review" ? "warning" : "good",
      detail: hasTaskMismatch
        ? "The proposed move drifted from the assigned task envelope."
        : result.verdict === "manual_review"
          ? "The action mostly fits the task, but still needs a human pause."
          : "The action stays aligned with the assigned task.",
    },
    {
      label: "Counterparty trust",
      status: hasTargetTrustIssue ? (hasHighSignal ? "danger" : "warning") : "good",
      detail: hasTargetTrustIssue
        ? "PapaVibe found trust-profile issues with the destination or risk tier."
        : "Destination trust profile looks acceptable for this demo flow.",
    },
    {
      label: "Approval / execution safety",
      status: hasApprovalIssue ? "danger" : hasMediumSignal ? "warning" : "good",
      detail: hasApprovalIssue
        ? "Approval scope or execution safety rules were violated."
        : hasMediumSignal
          ? "No hard stop, but the action still deserves human attention."
          : "No approval-scope or execution-safety guardrail was tripped.",
    },
  ];
}

function buildJudgeSummary(item: DemoScenario, result: ReviewResponse | null, apiError: ApiErrorResponse | null): string {
  if (apiError) {
    return `${item.label}: PapaVibe rejected the payload at the API boundary, which shows the contract layer refuses malformed or incomplete requests before any execution verdict is produced.`;
  }

  if (!result) {
    return item.judgeExplanation.headline;
  }

  if (result.verdict === "approve") {
    return `${item.label}: PapaVibe approved this flow because the action stayed inside the task envelope, used a trusted path, and avoided risky approval behavior.`;
  }

  if (result.verdict === "manual_review") {
    return `${item.label}: PapaVibe did not hard-block the flow, but it paused for a human because the action used a less trusted path than the primary one.`;
  }

  return `${item.label}: PapaVibe blocked this flow because one or more trust guardrails failed before funds could move.`;
}

export function App() {
  const [scenarioId, setScenarioId] = useState<string>(scenarios[0].id);
  const [result, setResult] = useState<ReviewResponse | null>(null);
  const [apiError, setApiError] = useState<ApiErrorResponse | null>(null);
  const [httpStatus, setHttpStatus] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const current = useMemo(() => scenarios.find((item) => item.id === scenarioId) ?? scenarios[0], [scenarioId]);
  const trustPillars = useMemo(() => buildTrustPillars(result, apiError), [result, apiError]);

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
        error: "request_error",
        message: error instanceof Error ? error.message : "Failed to reach the PapaVibe API.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ fontFamily: "Arial, sans-serif", maxWidth: 1280, margin: "0 auto", padding: 24, color: "#111", lineHeight: 1.45 }}>
      <h1 style={{ marginBottom: 4 }}>PapaVibe</h1>
      <p style={{ marginTop: 0, color: "#444" }}>Trust Gate for Agent-Controlled Funds</p>

      <section style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16, marginBottom: 20, background: "#fafafa" }}>
        <p style={{ marginTop: 0 }}>
          <strong>Canonical judge path:</strong> run the host-agent flow first, then use this UI as the explanation layer.
        </p>
        <p style={{ marginBottom: 0, color: "#555" }}>
          This screen is tuned for non-technical judges: it shows not only the verdict, but also the trust pillars behind that decision and why PapaVibe allowed, paused, or blocked the action.
        </p>
      </section>

      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        {scenarios.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setScenarioId(item.id);
              setResult(null);
              setApiError(null);
              setHttpStatus(null);
            }}
            style={{
              padding: "10px 14px",
              borderRadius: 999,
              border: item.id === current.id ? "2px solid #111" : "1px solid #ccc",
              background: item.id === current.id ? "#111" : "#fff",
              color: item.id === current.id ? "#fff" : "#111",
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
            Expected: {isBoundaryFixture(current) ? `${current.expectedStatus} ${current.expectedError}` : current.expected}
          </span>
        </div>
        <p style={{ color: "#555" }}>{current.note}</p>
        <p style={{ marginBottom: 8 }}><strong>Judge headline:</strong> {current.judgeExplanation.headline}</p>
        <p style={{ marginTop: 0, marginBottom: 8, color: "#444" }}>{current.judgeExplanation.whyItMatters}</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {current.judgeExplanation.trustFocus.map((item) => (
            <span key={item} style={{ background: "#f3f4f6", borderRadius: 999, padding: "4px 10px", fontSize: 12 }}>
              {item}
            </span>
          ))}
        </div>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "start" }}>
        <section style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
          <h2 style={{ marginTop: 0 }}>Payload sent to /review</h2>
          <pre style={{ margin: 0, whiteSpace: "pre-wrap", overflowX: "auto", fontSize: 13 }}>{prettyJson(current.payload)}</pre>
        </section>

        <section style={{ border: "1px solid #111", borderRadius: 12, padding: 16 }}>
          <h2 style={{ marginTop: 0 }}>Decision story</h2>
          {!result && !apiError && <p style={{ color: "#555" }}>Run a scenario to see the verdict, validation result, and trust explanation.</p>}

          {httpStatus !== null && (
            <p>
              <strong>HTTP status:</strong> {httpStatus}
            </p>
          )}

          {(result || apiError) && (
            <>
              <p style={{ marginBottom: 8 }}><strong>What judges should take away:</strong></p>
              <p style={{ marginTop: 0 }}>{buildJudgeSummary(current, result, apiError)}</p>
            </>
          )}

          {result && (
            <>
              <p>
                <strong>Verdict:</strong>{" "}
                <span style={{ color: chipColors[result.verdict], fontWeight: 700 }}>{result.verdict.toUpperCase()}</span>
              </p>
              <p><strong>Reason:</strong> {result.summary}</p>
              <p><strong>Recommended next step:</strong> {result.recommendedNextStep}</p>
              <p><strong>Risk score:</strong> {result.score}</p>

              <div style={{ display: "grid", gap: 12, marginBottom: 16 }}>
                {trustPillars.map((pillar) => (
                  <div key={pillar.label} style={{ border: `1px solid ${pillarColors[pillar.status]}`, borderRadius: 12, padding: 12, background: "#fff" }}>
                    <p style={{ margin: "0 0 4px 0", color: pillarColors[pillar.status], fontWeight: 700 }}>{pillar.label}</p>
                    <p style={{ margin: 0, color: "#333" }}>{pillar.detail}</p>
                  </div>
                ))}
              </div>

              <p><strong>Signals:</strong></p>
              <ul>
                {result.signals.map((signal) => (
                  <li key={`${signal.type}-${signal.message}`}>
                    <strong>{describeSignal(signal)}</strong> ({signal.severity}): {signal.message}
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
              <div style={{ display: "grid", gap: 12, marginBottom: 16 }}>
                {trustPillars.map((pillar) => (
                  <div key={pillar.label} style={{ border: `1px solid ${pillarColors[pillar.status]}`, borderRadius: 12, padding: 12, background: "#fff" }}>
                    <p style={{ margin: "0 0 4px 0", color: pillarColors[pillar.status], fontWeight: 700 }}>{pillar.label}</p>
                    <p style={{ margin: 0, color: "#333" }}>{pillar.detail}</p>
                  </div>
                ))}
              </div>
              {apiError.details && apiError.details.length > 0 && (
                <>
                  <p><strong>Validation details:</strong></p>
                  <ul>
                    {apiError.details.map((detail) => (
                      <li key={detail}>{detail}</li>
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
