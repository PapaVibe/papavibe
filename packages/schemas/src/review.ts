export type ActionType =
  | "transfer"
  | "approve"
  | "contract_interaction";

export type Verdict =
  | "approve"
  | "manual_review"
  | "block";

export type Severity =
  | "low"
  | "medium"
  | "high";

export interface TaskEnvelope {
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
}

export interface ProposedAction {
  type: ActionType;
  token?: string;
  amount?: string;
  target: string;
  rawDescription: string;
}

export interface ReviewContext {
  agentId: string;
  sessionId: string;
  reason?: string;
}

export interface ReviewRequest {
  task: TaskEnvelope;
  proposedAction: ProposedAction;
  context: ReviewContext;
}

export interface ReviewSignal {
  type: string;
  severity: Severity;
  message: string;
}

export interface ReviewReceipt {
  reviewId: string;
  timestamp: string;
}

export interface ReviewResponse {
  verdict: Verdict;
  summary: string;
  score: number;
  signals: ReviewSignal[];
  recommendedNextStep: string;
  receipt: ReviewReceipt;
}

export interface ApiErrorResponse {
  error: string;
  message: string;
  details?: string[];
}
