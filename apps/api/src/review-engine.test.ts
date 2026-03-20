import test from "node:test";
import assert from "node:assert/strict";
import { reviewFixtures } from "../../../packages/demo-data/src/fixtures";
import { runReview } from "./review-engine";

for (const fixture of reviewFixtures) {
  test(`review fixture ${fixture.id} -> ${fixture.expected}`, () => {
    const result = runReview(structuredClone(fixture.payload));

    assert.equal(result.verdict, fixture.expected);
    assert.ok(result.summary.length > 0);
    assert.ok(result.receipt.reviewId.startsWith("review-"));
    assert.ok(result.signals.length >= 1);
  });
}

test("manual review fixture surfaces the secondary target signal", () => {
  const manualFixture = reviewFixtures.find((fixture) => fixture.id === "manual_review");
  assert.ok(manualFixture);

  const result = runReview(structuredClone(manualFixture.payload));

  assert.ok(result.signals.some((signal) => signal.type === "secondary_allowed_target"));
  assert.ok(result.signals.some((signal) => signal.type === "counterparty_risk_medium"));
});

test("good fixture stays executable", () => {
  const goodFixture = reviewFixtures.find((fixture) => fixture.id === "good");
  assert.ok(goodFixture);

  const result = runReview(structuredClone(goodFixture.payload));

  assert.equal(result.recommendedNextStep, "execute_action");
});
