// Page code for the "Rogi - The Game" page.
// Paste into the page's code panel in Wix Studio. The Embed code element holding the
// game must have the ID "rogiGame" (Properties & Events panel).
//
// Messages are JSON strings tagged with "source" so stray messages are ignored.

import { getLeaderboard, submitScore } from "backend/leaderboard.web";

const GAME = "#rogiGame";

$w.onReady(function () {
  const game = $w(GAME);

  function send(type, data) {
    game.postMessage(JSON.stringify({ source: "rogi-host", type, ...data }));
  }

  async function sendLeaderboard() {
    try {
      const lb = await getLeaderboard();
      send("leaderboard", lb);
    } catch (err) {
      console.error("Rogi leaderboard failed", err);
      send("leaderboard", { error: "unavailable", entries: [] });
    }
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

  // In case the game loaded before the page code was ready.
  send("hello", {});
});
