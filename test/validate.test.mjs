// Unit tests for the backend score validation. Run: node test/validate.test.mjs
// The Wix imports are stubbed so the file can load outside Wix.
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import assert from "node:assert/strict";

const dir = mkdtempSync(join(tmpdir(), "rogi-"));
const cfg = readFileSync(new URL("../wix/backend/rogi-config.js", import.meta.url), "utf8");
let src = readFileSync(new URL("../wix/backend/leaderboard.web.js", import.meta.url), "utf8");
src = src
  .replace(/import \{ Permissions, webMethod \} from "@wix\/web-methods";/, "const Permissions={Anyone:'Anyone'}; const webMethod=(p,f)=>f;")
  .replace(/import \{ items \} from "@wix\/data";/, "const items={};")
  .replace(/import \{ auth \} from "@wix\/essentials";/, "const auth={elevate:(f)=>f};")
  .replace('"backend/rogi-config"', '"./rogi-config.mjs"');
writeFileSync(join(dir, "rogi-config.mjs"), cfg);
writeFileSync(join(dir, "lb.mjs"), src);
const { validateEntry } = await import(join(dir, "lb.mjs"));

function game(n, pts = 150) {
  const log = Array.from({ length: n }, (_, i) => ({ t: 2000 + i * 1500, pts }));
  return { score: n * pts, orders: n, bestCombo: n, level: 1 + Math.floor(n / 5), durationMs: 2000 + n * 1500, log };
}
const base = { nickname: "Pierogi Pete", email: "Pete@Example.com", marketingOptIn: false };

let r = validateEntry({ ...base, game: game(12) });
assert.equal(r.ok, true, JSON.stringify(r));
assert.equal(r.entry.email, "pete@example.com");
assert.equal(r.entry.marketingOptIn, false);

assert.equal(validateEntry({ ...base, marketingOptIn: "yes", game: game(3) }).entry.marketingOptIn, false, "opt-in must be literally true");
assert.equal(validateEntry({ ...base, nickname: "x", game: game(3) }).error, "nickname_length");
assert.equal(validateEntry({ ...base, nickname: "<script>", game: game(3) }).error, "nickname_chars");
assert.equal(validateEntry({ ...base, nickname: "a@b.com", game: game(3) }).error, "nickname_chars");
assert.equal(validateEntry({ ...base, nickname: "Zażółć", game: game(3) }).ok, true, "Polish letters allowed");
assert.equal(validateEntry({ ...base, email: "nope", game: game(3) }).error, "email");

let g = game(10); g.score += 1;
assert.equal(validateEntry({ ...base, game: g }).error, "implausible", "score must equal log sum");
g = game(10); g.level = 9;
assert.equal(validateEntry({ ...base, game: g }).error, "implausible", "level must follow orders");
g = game(4, 5000);
assert.equal(validateEntry({ ...base, game: g }).error, "implausible", "per-order cap");
g = game(50); g.durationMs = 5000; g.log.forEach((o, i) => (o.t = i + 1));
assert.equal(validateEntry({ ...base, game: g }).error, "implausible", "too fast");
g = game(5); g.log.pop();
assert.equal(validateEntry({ ...base, game: g }).error, "bad_game", "log length");
assert.equal(validateEntry({ ...base, game: { ...game(2), score: 1.5 } }).error, "bad_game");
assert.equal(validateEntry(null).error, "bad_request");

console.log("validate tests passed");
