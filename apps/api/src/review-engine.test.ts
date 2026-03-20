import test from "node:test";
import assert from "node:assert/strict";
import type { ReviewRequest } from "../../../packages/schemas/src/review";
import { runReview } from "./review-engine";
import goodRequest from "../../../examples/review-request.good.json" with { type: "json" };
import manualRequest from "../../../examples/review-request.manual.json" with { type: "json" };

function asReviewRequest(value: unknown): ReviewRequest {
  return structuredClone(value) as ReviewRequest;
}

test("approves the happy path review request", () => {
  const result = runReview(asReviewRequest(goodRequest));

  assert.equal(result.verdict, "approve");
  assert.equal(result.recommendedNextStep, "execute_action");
});

test("downgrades secondary but allowed target to manual review", () => {
  const result = runReview(asReviewRequest(manualRequest));

  assert.equal(result.verdict, "manual_review");
  assert.ok(result.signals.some((signal) => signal.type === "secondary_allowed_target"));
  assert.ok(result.signals.some((signal) => signal.type === "counterparty_risk_medium"));
});

test("blocks when task token and proposed token diverge", () => {
  const request = asReviewRequest(goodRequest);
  request.proposedAction.token = "WETH";
  request.proposedAction.rawDescription = "Approve 1000 WETH to approved protocol X router";

  const result = runReview(request);

  assert.equal(result.verdict, "block");
  assert.ok(result.signals.some((signal) => signal.type === "task_token_mismatch"));
});

test("blocks when economic intent points to a wallet but the target is a protocol counterparty", () => {
  const request = asReviewRequest(manualRequest);
  request.task.allowedTargets = ["protocol-x-router"];
  request.proposedAction.target = "protocol-x-router";
  request.proposedAction.rawDescription = "Transfer 500 USDC to protocol router";

  const result = runReview(request);

  assert.equal(result.verdict, "block");
  assert.ok(result.signals.some((signal) => signal.type === "target_action_profile_mismatch"));
});

test("blocks unlimited approval even for trusted targets that require bounded approvals", () => {
  const request = asReviewRequest(goodRequest);
  request.task.policy.allowUnlimitedApproval = true;
  request.proposedAction.amount = "MAX_UINT256";
  request.proposedAction.rawDescription = "Approve unlimited USDC to protocol X router";

  const result = runReview(request);

  assert.equal(result.verdict, "block");
  assert.ok(result.signals.some((signal) => signal.type === "bounded_approval_required"));
});
