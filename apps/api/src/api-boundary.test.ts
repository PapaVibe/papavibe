import test from "node:test";
import assert from "node:assert/strict";
import { boundaryFixtures, reviewFixtures } from "../../../packages/demo-data/src/fixtures";
import { buildApp } from "./app";

for (const fixture of boundaryFixtures) {
  test(`boundary fixture ${fixture.id} -> ${fixture.expectedStatus} ${fixture.expectedError}`, async () => {
    const app = buildApp();

    try {
      const response = await app.inject({
        method: "POST",
        url: "/review",
        payload: structuredClone(fixture.payload) as any,
      });

      assert.equal(response.statusCode, fixture.expectedStatus);
      const body = response.json() as { error: string; details?: string[] };
      assert.equal(body.error, fixture.expectedError);
      assert.ok(Array.isArray(body.details));
      assert.ok(body.details.length >= 1);
    } finally {
      await app.close();
    }
  });
}

test("POST /review accepts valid requests and returns a verdict payload", async () => {
  const app = buildApp();
  const goodFixture = reviewFixtures.find((fixture) => fixture.id === "good");
  assert.ok(goodFixture);

  try {
    const response = await app.inject({
      method: "POST",
      url: "/review",
      payload: structuredClone(goodFixture.payload),
    });

    assert.equal(response.statusCode, 200);
    const body = response.json();
    assert.equal(body.verdict, "approve");
    assert.equal(body.recommendedNextStep, "execute_action");
  } finally {
    await app.close();
  }
});
