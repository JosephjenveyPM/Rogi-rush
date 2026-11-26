# Rogi Rush

A phone-first pierogi stall game for the **Rogi - The Game** page on rogidumplings.com (Wix Studio).
The project brief, gameplay rules and design decisions are in [CLAUDE.md](CLAUDE.md).

| Path | What it is |
| --- | --- |
| `index.html` | The whole game in one file. Works standalone, or inside a Wix Embed code element where it talks to the leaderboard. |
| `rogi-logo-red.png`, `rogi-logo-white.png` | Logo source files (also embedded in `index.html`). |
| `wix/backend/` | Wix backend code: leaderboard and score submission web methods, plus settings. |
| `wix/page/rogi-the-game.js` | Page code for the Wix page: passes messages between the game and the backend. |
| `wix/SETUP.md` | Step-by-step setup on the Wix site. |
| `test/` | Score-validation tests and a local stand-in for the Wix page. |

## Testing locally

```sh
node test/validate.test.mjs          # backend score checks
python3 -m http.server 8002          # serve the game from the repo root
python3 -m http.server 8001 -d test  # serve the harness, then open http://localhost:8001/host-harness.html
```

The harness embeds the game cross-origin and answers like the Wix page, with an in-memory leaderboard.
