import test from "node:test";
import assert from "node:assert/strict";
import { getContract } from "./contract";

test("contract endpoint source exposes the shared OpenAPI bundle", () => {
  const contract = getContract();

  assert.equal(contract.sourceOfTruth, "packages/schemas/src/contract.ts");
  assert.equal(contract.openapi.openapi, "3.1.0");
  assert.ok(contract.openapi.paths["/review"]);
  assert.ok(contract.openapi.components.schemas.ReviewRequest);
  assert.ok(contract.reviewRequestSchema.properties.task);
});
