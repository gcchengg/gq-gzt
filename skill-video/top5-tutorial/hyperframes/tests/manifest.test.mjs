import assert from "node:assert/strict";
import fs from "node:fs";

const data = JSON.parse(fs.readFileSync("../content/timeline.json", "utf8"));
assert.equal(data.width, 1080);
assert.equal(data.height, 1920);
assert.equal(data.fps, 30);
assert.equal(data.scenes.length, 7);
assert.equal(data.scenes[0].start, 0);
for (let i = 1; i < data.scenes.length; i += 1) {
  assert.equal(data.scenes[i - 1].end, data.scenes[i].start);
}
assert.equal(data.scenes.at(-1).end, data.durationSeconds);
console.log("manifest contract: PASS");
