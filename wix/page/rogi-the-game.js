// Page code for the "Rogi - The Game" page.
// Paste into the page's code panel in Wix Studio. The Embed code element holding the
// game must have the ID "rogiGame" (Properties & Events panel).
//
// Messages are JSON strings tagged with "source" so stray messages are ignored.

import { getLeaderboard, submitScore } from "backend/leaderboard.web";

const GAME = "#rogiGame";
const BOARD = "#rogiBoard";
const REFRESH_MS = 60 * 1000; // so other players' new scores show up too

$w.onReady(function () {
  const game = $w(GAME);
  // The top 10 panel is optional: the page still works if it has been removed.
  const board = $w(BOARD);
  const hasBoard = board && typeof board.postMessage === "function";

  function send(type, data) {
    game.postMessage(JSON.stringify({ source: "rogi-host", type, ...data }));
  }

  function sendBoard(lb) {
    if (!hasBoard) return;
    // Nicknames and scores only.
    const entries = (lb.entries || []).map((e) => ({ rank: e.rank, nickname: e.nickname, score: e.score }));
    board.postMessage(JSON.stringify({ source: "rogi-host", type: "leaderboard", error: lb.error, entries }));
  }

  async function sendLeaderboard() {
    let lb;
    try {
      lb = await getLeaderboard();
    } catch (err) {
      console.error("Rogi leaderboard failed", err);
      lb = { error: "unavailable", entries: [] };
    }
    send("leaderboard", lb);
    sendBoard(lb);
  }

  if (hasBoard) {
    board.onMessage((event) => {
      let msg;
      try { msg = typeof event.data === "string" ? JSON.parse(event.data) : event.data; } catch (e) { return; }
      if (msg && msg.source === "rogi-board" && msg.type === "ready") sendLeaderboard();
    });
    setInterval(sendLeaderboard, REFRESH_MS);
  }

  game.onMessage(async (event) => {
    let msg;
    try { msg = typeof event.data === "string" ? JSON.parse(event.data) : event.data; } catch (e) { return; }
    if (!msg || msg.source !== "rogi-game") return;

    if (msg.type === "ready") {
      send("hello", {});
      sendLeaderboard();
    } else if (msg.type === "getLeaderboard") {
      sendLeaderboard();
    } else if (msg.type === "submitScore") {
      let result;
      try {
        result = await submitScore(msg.entry);
      } catch (err) {
        console.error("Rogi submit failed", err);
        result = { ok: false, error: "unavailable" };
      }
      send("submitResult", { requestId: msg.requestId, result });
      if (result.ok) sendLeaderboard();
    }
  });

  // In case the game or the panel loaded before the page code was ready.
  send("hello", {});
  sendLeaderboard();
});
