import assert from "node:assert/strict";
import fs from "node:fs";

const base = fs.readFileSync("src/base.css", "utf8");

assert.doesNotMatch(base, /Inter|JetBrains Mono/);
assert.match(
  base,
  /code,\s*pre,\s*\.monospace\s*\{[^}]*font-family:\s*"SFMono-Regular"/s,
);
assert.match(
  base,
  /\.process-flow li::before\s*\{[^}]*font-family:\s*"SFMono-Regular"/s,
);
assert.match(base, /\.prompt code\s*\{[^}]*max-inline-size:\s*32em/s);
assert.match(base, /\.process-flow li\s*\{[^}]*max-inline-size:\s*32em/s);

console.log("base style contract: PASS");
