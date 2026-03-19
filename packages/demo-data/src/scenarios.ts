import type { ReviewRequest } from "../../schemas/src/review";

export const heroScenario: ReviewRequest = {
  task: {
    id: "task-hero-001",
    intent: "Stake 1000 USDC into approved protocol X",
    allowedActionTypes: ["approve", "contract_interaction"],
    allowedTargets: ["protocol-x-router", "protocol-x-vault"],
    policy: {
      allowUnlimitedApproval: false,
      requireKnownTarget: true,
    },
    amount: {
      token: "USDC",
      value: "1000",
    },
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

export const happyPathScenario: ReviewRequest = {
  task: {
    id: "task-happy-001",
    intent: "Stake 1000 USDC into approved protocol X",
    allowedActionTypes: ["approve", "contract_interaction"],
    allowedTargets: ["protocol-x-router", "protocol-x-vault"],
    policy: {
      allowUnlimitedApproval: false,
      requireKnownTarget: true,
    },
    amount: {
      token: "USDC",
      value: "1000",
    },
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

export const manualReviewScenario: ReviewRequest = {
  task: {
    id: "task-manual-001",
    intent: "Transfer 500 USDC to approved treasury destination",
    allowedActionTypes: ["transfer"],
    allowedTargets: ["treasury-wallet", "ops-wallet"],
    policy: {
      allowUnlimitedApproval: false,
      requireKnownTarget: true,
    },
    amount: {
      token: "USDC",
      value: "500",
    },
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
