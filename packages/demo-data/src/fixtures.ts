import type { ApiErrorResponse, ReviewRequest, ReviewResponse } from "../../schemas/src/review";
import { happyPathScenario, heroScenario, manualReviewScenario } from "./scenarios";

export type DemoScenarioCategory = "review" | "boundary";

export type ReviewFixture = {
  id: string;
  label: string;
  category: DemoScenarioCategory;
  expected: ReviewResponse["verdict"];
  note: string;
  payload: ReviewRequest;
  judgeExplanation: {
    headline: string;
    whyItMatters: string;
    trustFocus: string[];
  };
};

export type BoundaryFixture = {
  id: string;
  label: string;
  category: DemoScenarioCategory;
  expectedStatus: number;
  expectedError: ApiErrorResponse["error"];
  note: string;
  payload: unknown;
  judgeExplanation: {
    headline: string;
    whyItMatters: string;
    trustFocus: string[];
  };
};

function clone<T>(value: T): T {
  return structuredClone(value);
}

const missingAmountScenario: ReviewFixture = {
  id: "missing_amount",
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
  },
  judgeExplanation: {
    headline: "PapaVibe blocks money movement when the amount is missing.",
    whyItMatters: "A vague transfer is dangerous because an agent could move more value than the task owner intended.",
    trustFocus: ["explicit amount requirement", "task clarity before execution"],
  },
};

const actionMismatchScenario: ReviewFixture = {
  id: "action_mismatch",
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
  },
  judgeExplanation: {
    headline: "PapaVibe catches when the agent tries the wrong kind of onchain action.",
    whyItMatters: "Even a familiar token and destination are unsafe if the action type drifts from what the human actually assigned.",
    trustFocus: ["task-action alignment", "approval-vs-transfer mismatch"],
  },
};

const amountTooHighScenario: ReviewFixture = {
  id: "amount_too_high",
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
  },
  judgeExplanation: {
    headline: "PapaVibe checks the size of the action, not just the destination.",
    whyItMatters: "A safe counterparty is not enough if the agent is about to move a larger amount than approved.",
    trustFocus: ["amount bound enforcement", "same target but unsafe size"],
  },
};

const unknownAllowedTargetScenario: ReviewFixture = {
  id: "unknown_allowed_target",
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
  },
  judgeExplanation: {
    headline: "PapaVibe can stop execution when a destination lacks a trust profile.",
    whyItMatters: "This makes the demo feel like a real execution gate, not a cosmetic warning system.",
    trustFocus: ["known-target requirement", "counterparty trust registry"],
  },
};

export const reviewFixtures: ReviewFixture[] = [
  {
    id: "bad",
    label: "Bad scenario",
    category: "review",
    expected: "block",
    note: "Hero demo: unlimited approval to a suspicious target should be blocked.",
    payload: clone(heroScenario),
    judgeExplanation: {
      headline: "PapaVibe blocks an approval path that could expose funds.",
      whyItMatters: "The task was to stake into Protocol X, but the agent drifted to an unlimited approval for a suspicious contract.",
      trustFocus: ["unlimited approval", "suspicious counterparty", "task-to-action drift"],
    },
  },
  {
    id: "good",
    label: "Good scenario",
    category: "review",
    expected: "approve",
    note: "Bounded approval to the primary approved target should pass.",
    payload: clone(happyPathScenario),
    judgeExplanation: {
      headline: "PapaVibe allows execution when the action stays inside the approved task envelope.",
      whyItMatters: "This proves PapaVibe is not just blocking everything; it distinguishes safe flows from unsafe ones.",
      trustFocus: ["approved destination", "bounded approval", "task alignment"],
    },
  },
  {
    id: "manual_review",
    label: "Manual review",
    category: "review",
    expected: "manual_review",
    note: "Allowed action, but a secondary destination should still force a pause.",
    payload: clone(manualReviewScenario),
    judgeExplanation: {
      headline: "PapaVibe pauses ambiguous but not obviously malicious actions.",
      whyItMatters: "Judges can see the middle state: the system escalates when something is allowed but still less trusted than the primary path.",
      trustFocus: ["secondary destination", "human escalation", "risk-tiered trust"],
    },
  },
  missingAmountScenario,
  actionMismatchScenario,
  amountTooHighScenario,
  unknownAllowedTargetScenario,
];

export const boundaryFixtures: BoundaryFixture[] = [
  {
    id: "malformed_amount_payload",
    label: "Malformed amount payload",
    category: "boundary",
    expectedStatus: 400,
    expectedError: "invalid_review_request",
    note: "Boundary check: non-numeric amount strings should be rejected before review logic runs.",
    payload: {
      ...clone(happyPathScenario),
      proposedAction: {
        ...clone(happyPathScenario).proposedAction,
        amount: "ten",
        rawDescription: "Transfer ten USDC in malformed text form",
      },
      context: {
        agentId: "demo-agent-1",
        sessionId: "demo-session-8",
        reason: "Malformed payload test",
      },
    },
    judgeExplanation: {
      headline: "PapaVibe rejects malformed requests before any trust decision is made.",
      whyItMatters: "This shows input hygiene: the API refuses broken payloads instead of making a risky best guess.",
      trustFocus: ["API boundary validation", "structured 400 errors"],
    },
  },
  {
    id: "missing_context_fields",
    label: "Missing context fields",
    category: "boundary",
    expectedStatus: 400,
    expectedError: "invalid_review_request",
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
    judgeExplanation: {
      headline: "PapaVibe requires agent/session identity before review.",
      whyItMatters: "For a trust layer, explainability includes knowing which agent session asked for the action in the first place.",
      trustFocus: ["request provenance", "structured validation details"],
    },
  },
];

export const demoFixtures = [...reviewFixtures, ...boundaryFixtures];
