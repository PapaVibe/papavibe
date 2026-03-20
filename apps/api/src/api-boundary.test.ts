import test from "node:test";
import assert from "node:assert/strict";
import type { ReviewRequest } from "../../../packages/schemas/src/review";
import { buildApp } from "./app";
import goodRequest from "../../../examples/review-request.good.json" with { type: "json" };

function asReviewRequest(value: unknown): ReviewRequest {
  return structuredClone(value) as ReviewRequest;
}

test("POST /review rejects malformed amount payloads at the boundary", async () => {
  const app = buildApp();
  const request = asReviewRequest(goodRequest);
  request.proposedAction.amount = "abc";

  try {
    const response = await app.inject({
      method: "POST",
      url: "/review",
      payload: request,
    });

    assert.equal(response.statusCode, 400);
    const body = response.json();
    assert.equal(body.error, "invalid_review_request");
    assert.ok(body.details.some((detail: string) => detail.includes("proposedAction.amount")));
  } finally {
    await app.close();
  }
});

test("POST /review accepts valid requests and returns a verdict payload", async () => {
  const app = buildApp();

  try {
    const response = await app.inject({
      method: "POST",
      url: "/review",
      payload: asReviewRequest(goodRequest),
    });

    assert.equal(response.statusCode, 200);
    const body = response.json();
    assert.equal(body.verdict, "approve");
    assert.equal(body.recommendedNextStep, "execute_action");
  } finally {
    await app.close();
  }
});
