// Rogi Rush leaderboard: web methods called from the "Rogi - The Game" page code.
// File location in the Wix site: backend/leaderboard.web.js
//
// The browser never talks to the collection directly. The collection is Admin-only
// (see wix/SETUP.md) and these methods use elevated permissions, so emails are
// never sent to visitors.

import { Permissions, webMethod } from "@wix/web-methods";
import { items } from "@wix/data";
import { auth } from "@wix/essentials";
import {
  CURRENT_COMPETITION_ID,
  SCORES_COLLECTION,
  LEADERBOARD_SIZE,
  MIN_SECONDS_BETWEEN_SUBMITS,
  MAX_POINTS_PER_ORDER,
} from "backend/rogi-config";

const elevatedQuery = auth.elevate(items.query);
const elevatedInsert = auth.elevate(items.insert);
const elevatedUpdate = auth.elevate(items.update);
const elevatedCount = auth.elevate(items.count);

// ---------- Public leaderboard ----------

export const getLeaderboard = webMethod(Permissions.Anyone, async () => {
  const res = await elevatedQuery(SCORES_COLLECTION)
    .eq("competitionId", CURRENT_COMPETITION_ID)
    .descending("score")
    .ascending("_createdDate")
    .limit(LEADERBOARD_SIZE)
    .find();
  return {
    competitionId: CURRENT_COMPETITION_ID,
    // Only public fields leave the backend. Never add email here.
    entries: res.items.map((it, i) => ({
      rank: i + 1,
      nickname: it.nickname,
      score: it.score,
      orders: it.orders,
      bestCombo: it.bestCombo,
      level: it.level,
    })),
  };
});

// ---------- Score submission ----------

export const submitScore = webMethod(Permissions.Anyone, async (entry) => {
  const v = validateEntry(entry);
  if (!v.ok) return { ok: false, error: v.error };
  const e = v.entry;

  const existing = await elevatedQuery(SCORES_COLLECTION)
    .eq("competitionId", CURRENT_COMPETITION_ID)
    .eq("email", e.email)
    .limit(1)
    .find();
  const prev = existing.items[0];
  const now = new Date();

  if (prev) {
    const last = prev.lastSubmittedAt ? new Date(prev.lastSubmittedAt).getTime() : 0;
    if (now.getTime() - last < MIN_SECONDS_BETWEEN_SUBMITS * 1000) {
      return { ok: false, error: "too_fast" };
    }
    const better = e.score > prev.score;
    const updated = {
      ...prev,
      nickname: e.nickname,
      // Opt-in can be given later but is never silently withdrawn by a re-submit.
      marketingOptIn: prev.marketingOptIn || e.marketingOptIn,
      attempts: (prev.attempts || 1) + 1,
      lastSubmittedAt: now,
    };
    if (better) Object.assign(updated, pick(e, ["score", "orders", "bestCombo", "level", "durationMs"]));
    await elevatedUpdate(SCORES_COLLECTION, updated);
    const best = better ? e.score : prev.score;
    return { ok: true, improved: better, best, rank: await rankOf(best) };
  }

  await elevatedInsert(SCORES_COLLECTION, {
    competitionId: CURRENT_COMPETITION_ID,
    nickname: e.nickname,
    email: e.email,
    marketingOptIn: e.marketingOptIn,
    score: e.score,
    orders: e.orders,
    bestCombo: e.bestCombo,
    level: e.level,
    durationMs: e.durationMs,
    attempts: 1,
    lastSubmittedAt: now,
  });
  return { ok: true, improved: true, best: e.score, rank: await rankOf(e.score) };
});

async function rankOf(score) {
  const res = await elevatedCount(SCORES_COLLECTION, {
    filter: { competitionId: { $eq: CURRENT_COMPETITION_ID }, score: { $gt: score } },
  });
  // The count call returns a number (or { totalCount } on older package versions).
  const higher = typeof res === "number" ? res : (res && res.totalCount) || 0;
  return higher + 1;
}

// ---------- Validation ----------
// Basic plausibility checks. The stronger replay-based score check is the next piece of work.

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[a-z]{2,}$/i;

export function validateEntry(entry) {
  if (!entry || typeof entry !== "object") return bad("bad_request");

  const nickname = String(entry.nickname || "").replace(/\s+/g, " ").trim();
  if (nickname.length < 2 || nickname.length > 16) return bad("nickname_length");
  if (!/^[\p{L}\p{N} _.'-]+$/u.test(nickname)) return bad("nickname_chars");
  if (EMAIL_RE.test(nickname) || /@/.test(nickname)) return bad("nickname_chars");

  const email = String(entry.email || "").trim().toLowerCase();
  if (email.length > 254 || !EMAIL_RE.test(email)) return bad("email");

  const marketingOptIn = entry.marketingOptIn === true;

  const g = entry.game || {};
  const score = int(g.score), orders = int(g.orders), bestCombo = int(g.bestCombo),
    level = int(g.level), durationMs = int(g.durationMs);
  const log = Array.isArray(g.log) ? g.log : null;
  if ([score, orders, bestCombo, level, durationMs].some((n) => n === null || n < 0)) return bad("bad_game");
  if (!log || log.length !== orders || orders > 2000) return bad("bad_game");

  // Level follows directly from orders served.
  if (level !== 1 + Math.floor(orders / 5)) return bad("implausible");
  if (bestCombo > orders) return bad("implausible");

  // The order log must add up to the score, each order within the max, times increasing.
  let sum = 0, lastT = -1;
  for (const o of log) {
    const t = int(o && o.t), pts = int(o && o.pts);
    if (t === null || pts === null || pts < 100 || pts > MAX_POINTS_PER_ORDER) return bad("implausible");
    if (t <= lastT || t > durationMs) return bad("implausible");
    sum += pts; lastT = t;
  }
  if (sum !== score) return bad("implausible");

  // A person needs at least ~0.6 s to build and hand over an order (three taps plus the customer).
  if (orders > 0 && durationMs < orders * 600) return bad("implausible");

  return { ok: true, entry: { nickname, email, marketingOptIn, score, orders, bestCombo, level, durationMs } };
}

function int(x) { return Number.isInteger(x) ? x : null; }
function bad(error) { return { ok: false, error }; }
function pick(o, keys) { const r = {}; keys.forEach((k) => (r[k] = o[k])); return r; }
