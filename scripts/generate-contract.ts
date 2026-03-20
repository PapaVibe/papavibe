import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { reviewContract } from "../packages/schemas/src/contract";

async function main() {
  const targetPath = resolve(process.cwd(), "docs", "review-api-contract.json");

  await mkdir(resolve(process.cwd(), "docs"), { recursive: true });
  await writeFile(targetPath, `${JSON.stringify(reviewContract.openapi, null, 2)}\n`, "utf8");

  console.log(`Wrote ${targetPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
