// Entry for the make.fun bounty ai-excited-01.
//
// Node 22, TypeScript, standard library only — no dependencies, no network.
//
// The grader runs `node main.ts` in a fresh sandbox (60s wall budget) and
// expects /output/entry.png to be a binary PNG/JPEG of at most 1 MiB and at
// most 1024x1024 pixels. The image is stored beside this file as base64 text
// (entry.png.b64) so it survives any transport that only carries text, and
// this program decodes it back to the exact original bytes.
//
// Determinism: base64 decoding is pure, so two runs always write identical
// bytes. Nothing here touches the clock, the network or the environment
// except the output directory.
//
// Strategy: resolve both paths relative to import.meta.url (not the cwd) so
// the program works however it is launched, then write through the directory
// the grader selects via MAKEFUN_OUTPUT_DIR (defaulting to /output).

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Source files live next to this module. Resolving against import.meta.url
// keeps the paths stable when the cwd changes.
const moduleDir = dirname(fileURLToPath(import.meta.url));
const sourcePath = resolve(moduleDir, "entry.png.b64");

if (!existsSync(sourcePath)) {
  throw new Error(`entry.png.b64 not found next to main.ts at ${sourcePath}`);
}

// The base64 text may be wrapped across lines; whitespace is not significant.
const base64 = readFileSync(sourcePath, "utf8").replace(/\s+/g, "");
const imageBytes = Buffer.from(base64, "base64");

if (imageBytes.length === 0) {
  throw new Error("entry.png.b64 decoded to zero bytes");
}
if (imageBytes.length > 1024 * 1024) {
  throw new Error(`image is ${imageBytes.length} bytes, over the 1 MiB cap`);
}

// The grader selects the output directory via MAKEFUN_OUTPUT_DIR; fall back
// to /output when running outside the grader sandbox.
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const outputPath = join(outputDir, "entry.png");

mkdirSync(outputDir, { recursive: true });
writeFileSync(outputPath, imageBytes);

console.log(`wrote ${imageBytes.length} bytes to ${outputPath}`);
