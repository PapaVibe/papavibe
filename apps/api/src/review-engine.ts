import type { ReviewRequest, ReviewResponse } from "../../../packages/schemas/src/review";
import { getTargetProfile } from "./target-registry";

function classifyIntent(intent: string): "protocol_funding" | "treasury_payout" | "generic" {
  const normalized = intent.toLowerCase();

  if (
    normalized.includes("stake") ||
    normalized.includes("deposit") ||
    normalized.includes("vault") ||
    normalized.includes("protocol")
  ) {
    return "protocol_funding";
  }

  if (
    normalized.includes("treasury") ||
    normalized.includes("payout") ||
    normalized.includes("pay") ||
    normalized.includes("wallet")
  ) {
    return "treasury_payout";
  }

  return "generic";
}

export function runReview(input: ReviewRequest): ReviewResponse {
  const { task, proposedAction } = input;

  const signals: ReviewResponse["signals"] = [];
  let verdict: ReviewResponse["verdict"] = "approve";
  let score = 20;

  const isMoneyAction = proposedAction.type === "transfer" || proposedAction.type === "approve";
  const hasAmount = typeof proposedAction.amount === "string" && proposedAction.amount.length > 0;
  const isTargetAllowed = task.allowedTargets.includes(proposedAction.target);
  const isPrimaryTarget = proposedAction.target === task.allowedTargets[0];
  const isActionAllowed = task.allowedActionTypes.includes(proposedAction.type);
  const isUnlimitedApproval = proposedAction.type === "approve" && proposedAction.amount === "MAX_UINT256";
  const expectedAmount = Number(task.amount?.value ?? 0);
  const proposedAmount = Number(proposedAction.amount ?? 0);
  const amountIsHigherThanExpected = expectedAmount > 0 && proposedAmount > expectedAmount;
  const targetProfile = getTargetProfile(proposedAction.target);
  const isKnownTarget = targetProfile.trustLevel !== "unknown";
  const intentClass = classifyIntent(task.intent);
  const taskToken = task.amount?.token;
  const proposedToken = proposedAction.token;
  const tokenMismatch = Boolean(taskToken && proposedToken && taskToken !== proposedToken);
  const targetDisallowsAction = Boolean(
    targetProfile.expectedActions && !targetProfile.expectedActions.includes(proposedAction.type)
  );
  const targetDisallowsToken = Boolean(
    proposedToken && targetProfile.allowedTokens && !targetProfile.allowedTokens.includes(proposedToken)
  );
  const intentCategoryMismatch =
    intentClass === "protocol_funding"
      ? targetProfile.category === "treasury" || targetProfile.category === "operations"
      : intentClass === "treasury_payout"
        ? targetProfile.category === "protocol" || targetProfile.category === "vault"
        : false;

  signals.push({
    type: "target_profile",
    severity:
      targetProfile.trustLevel === "trusted"
        ? "low"
        : targetProfile.trustLevel === "secondary"
          ? "medium"
          : "high",
    message: `${targetProfile.label}: ${targetProfile.note}`,
  });

  if (targetProfile.counterpartyRisk === "medium") {
    signals.push({
      type: "counterparty_risk_medium",
      severity: "medium",
      message: "Counterparty is known but carries moderate operational trust risk.",
    });
    score += 5;
  }

  if (targetProfile.counterpartyRisk === "high") {
    signals.push({
      type: "counterparty_risk_high",
      severity: "high",
      message: "Counterparty has elevated trust risk and should be treated cautiously.",
    });
    score += 10;
  }

  if (!isActionAllowed) {
    signals.push({
      type: "action_not_allowed",
      severity: "high",
      message: "Proposed action type is not allowed by the assigned task.",
    });
    verdict = "block";
    score += 40;
  }

  if (verdict === "approve" && isMoneyAction && !hasAmount) {
    signals.push({
      type: "missing_amount",
      severity: "high",
      message: "Money-related actions must include an explicit amount.",
    });
    verdict = "block";
    score += 25;
  }

  if (!isTargetAllowed) {
    signals.push({
      type: "target_mismatch",
      severity: "high",
      message: "Proposed target is outside the allowed task targets.",
    });
    verdict = "block";
    score += 25;
  }

  if (verdict === "approve" && task.policy.requireKnownTarget && !isKnownTarget) {
    signals.push({
      type: "unknown_target_profile",
      severity: "high",
      message: "Task policy requires a known target profile before execution can proceed.",
    });
    verdict = "block";
    score += 20;
  }

  if (verdict === "approve" && targetProfile.trustLevel === "suspicious") {
    signals.push({
      type: "suspicious_target",
      severity: "high",
      message: "The target has a suspicious trust profile and should not be used for this action.",
    });
    verdict = "block";
    score += 20;
  }

  if (verdict === "approve" && tokenMismatch) {
    signals.push({
      type: "task_token_mismatch",
      severity: "high",
      message: "Proposed token does not match the token expected by the assigned task.",
    });
    verdict = "block";
    score += 20;
  }

  if (verdict === "approve" && targetDisallowsAction) {
    signals.push({
      type: "target_action_profile_mismatch",
      severity: "high",
      message: "This target is known, but it is not trusted for the proposed action type.",
    });
    verdict = "block";
    score += 20;
  }

  if (verdict === "approve" && targetDisallowsToken) {
    signals.push({
      type: "target_token_profile_mismatch",
      severity: "high",
      message: "This target is not trusted for the proposed token in the current MVP registry.",
    });
    verdict = "block";
    score += 20;
  }

  if (verdict === "approve" && intentCategoryMismatch) {
    signals.push({
      type: "intent_counterparty_mismatch",
      severity: "high",
      message: "Counterparty category does not match the economic intent of the task.",
    });
    verdict = "block";
    score += 20;
  }

  if (isUnlimitedApproval && !task.policy.allowUnlimitedApproval) {
    signals.push({
      type: "dangerous_approval_scope",
      severity: "high",
      message: "Unlimited approval is not allowed by task policy.",
    });
    verdict = "block";
    score += 30;
  }

  if (verdict === "approve" && isUnlimitedApproval && targetProfile.requiresBoundedApproval) {
    signals.push({
      type: "bounded_approval_required",
      severity: "high",
      message: "This counterparty may only receive bounded approvals in the MVP trust registry.",
    });
    verdict = "block";
    score += 25;
  }

  if (verdict === "approve" && amountIsHigherThanExpected) {
    signals.push({
      type: "amount_exceeds_task",
      severity: "high",
      message: "Proposed amount is higher than the amount allowed by the task.",
    });
    verdict = "block";
    score += 20;
  }

  if (verdict === "approve" && !isPrimaryTarget) {
    signals.push({
      type: "secondary_allowed_target",
      severity: "medium",
      message: "Action uses an allowed target, but not the primary expected destination.",
    });
    verdict = "manual_review";
    score += 15;
  }

  const summary =
    verdict === "approve"
      ? "Action is aligned with the task and safe to proceed."
      : verdict === "manual_review"
        ? "Action is allowed, but should be manually reviewed before execution."
        : "Action breaks trust constraints and should not proceed.";

  return {
    verdict,
    summary,
    score,
    signals,
    recommendedNextStep:
      verdict === "approve"
        ? "execute_action"
        : verdict === "manual_review"
          ? "request_human_review"
          : "block_execution",
    receipt: {
      reviewId: `review-${Date.now()}`,
      timestamp: new Date().toISOString(),
    },
  };
}
