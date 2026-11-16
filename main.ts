// Entry for the make.fun bounty ai-excited-01.
//
// Node 22, TypeScript, standard library only — no dependencies, no network.
//
// The grader runs `node main.ts` in a fresh sandbox (60s wall budget) and
// expects /output/entry.png to be a byte-for-byte copy of the repository's
// ./entry.png (at most 1 MiB, at most 1024x1024 pixels). Two runs must
// write identical bytes, so the program is a pure, deterministic copy.
//
// Strategy: resolve the source path relative to import.meta.url (not the
// cwd) so the copy is correct regardless of where node is launched from,
// then write the exact bytes through the output directory requested by the
// grader via MAKEFUN_OUTPUT_DIR (defaulting to /output).

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Source image lives next to this module: <repo>/entry.png. Resolving it
// against import.meta.url keeps the path stable when the cwd changes.
const moduleDir = dirname(fileURLToPath(import.meta.url));
const sourcePath = resolve(moduleDir, "entry.png");

if (!existsSync(sourcePath)) {
  throw new Error(`entry.png not found next to main.ts at ${sourcePath}`);
}

// The grader selects the output directory via MAKEFUN_OUTPUT_DIR; fall
// back to /output when running outside the grader sandbox.
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const outputPath = join(outputDir, "entry.png");

// Read the source bytes once, then ensure the destination directory exists
// before writing. The same bytes are written every run, which makes the
// output deterministic across invocations.
const sourceBytes = readFileSync(sourcePath);
mkdirSync(outputDir, { recursive: true });
writeFileSync(outputPath, sourceBytes);

// Log a short confirmation with a sha256 so two runs can be compared.
const sha = createHash("sha256").update(sourceBytes).digest("hex");
console.log(`copied ${sourceBytes.length} bytes to ${outputPath} (sha256=${sha})`);
