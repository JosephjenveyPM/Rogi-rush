# Rogi Rush — project brief for Claude Code

Rogi Rush is a short, phone-first browser game for the Rogi Dumplings website (Polish street food, Croydon). It will live on the **Rogi - The Game** page of rogidumplings.com, which is built in **Wix Studio**. Players run a market stall and serve pierogi orders before customers lose patience. The top score in a competition wins free dumplings.

The gameplay prototype is finished and play-tested. The job now is to turn it into a production release on the Wix site.

## Files in this folder

| File | What it is |
| --- | --- |
| `index.html` | The complete, working prototype: one self-contained HTML file (HTML, CSS and JS, logos embedded as data URIs). This is the source of truth for gameplay and look. |
| `rogi-logo-red.png` | Joe's Rogi script logo, red on transparent (used on the start screen). |
| `rogi-logo-white.png` | Same logo, white on transparent (used in the red footer). |
| `wix/` | Wix backend code, page code and `SETUP.md` for the leaderboard and embed. |
| `test/` | Score-validation tests and a local host harness (`host-harness.html`). |

Concept doc (background reading): https://claude.ai/artifact/SwgVoHhgp52a7zexbBPBR4

## Gameplay as built (keep this behaviour unless Joe asks otherwise)

- **Loop:** up to 3 customers at the counter, each with an order bubble and a patience bar. Tap a filling, then a sauce, then a topping (tapping again deselects), then tap the customer to serve. "Bin it" clears the plate.
- **Lives:** 3. A wrong order or a customer walking off costs a life and resets the combo.
- **Scoring:** (100 + speed bonus up to 100, scaled by patience left) × combo multiplier (x1, rising by 0.5 every 3 perfect orders, capped at x3) × 2 during waves, plus tips.
- **Levels:** level = 1 + floor(orders served / 5). A new filling unlocks at each of levels 1–5 (Cheese & Potato and American at 1, then Spaniard, Apple, Sauerkraut & Mushroom, Oreo Cheesecake). The new filling's button glows once.
- **Speed:** ramps with every order served, not just per level. Patience = max(8, 22 − 0.35 × served) seconds. Spawn interval = max(1.3, 4.2 − 0.09 × served) seconds.
- **Waves:** from level 3, every ~35 s a 12 s "Rush hour!" (or, from level 5, sometimes "Dessert rush!" with only Apple and Oreo orders), with double points and faster arrivals.
- **Babcia** (from level 2): always Cheese & Potato with sour cream and fried onions. 1.5× patience, +250 tip. She is always drawn as an older white woman: grey curls, red polka-dot headscarf, glasses, pearl earrings, purple cardigan.
- **The Regular** (from level 3): one per game, wearing a flat cap. On his first visit his full order is shown. On later visits he only names the pierogi ("The usual way, please!"), so the player must remember it. +150 tip when right. No hints.
- **Notifications** (new flavour, Meet The Regular, level up, waves) appear in a white pill with red text above the order bubbles. They must never cover orders.
- **Pause** button in the score bar opens a menu with Resume and Sound on/off. The game also auto-pauses when the tab is hidden.
- **End screen:** score, rank title (Dough Rookie, Stall Helper, Pierogi Pro, Babcia-Approved, Big Dumpling Energy), orders, best combo, level, and a personal best saved in localStorage.

## Menu (must match the real Rogi menu and names)

| Pierogi | Sauce | Topping |
| --- | --- | --- |
| Cheese & Potato | Sour cream | Fried onions (optional — orders say "with" or "no onions") |
| Sauerkraut & Mushroom (vegan) | Sour cream | Fried onions (optional) |
| American | Burger sauce | Crispy onions |
| Spaniard | Chilli sauce | Crispy onions |
| Apple | Cinnamon cream | Crumb |
| Oreo Cheesecake | Sweet cream | Crushed Oreo |

## Design (agreed with Joe — follow the prototype)

- Premium, playful look from Joe's mockup: rounded red score bar with a yellow combo multiplier and pause button, smiling pierogi icons, cartoon customers, wooden counter, cream panel with red outline and red section tabs, sauce bowls and topping piles as icons, red-rimmed plate, red "Bin it" button, red wave footer with the white Rogi logo.
- Colours: red #C21F2E (dark #9E1523, light #D93441), ink #3A1A14, cream #FBF5EC, line #E9DCCB, yellow #FFD43B, green #4E9A3F.
- Font: Nunito (rounded sans, as in the mockup). The main Rogi website uses Laila.
- Illustrated art only (no photos). English only for the first release.
- Layout must fit without scrolling on an iPhone SE (375 × 667) as well as typical phones. A compact media query (max-height 740px) already handles this.

## Decisions already made

- The prize, competition dates, terms and winner announcement are managed on the Rogi website, **not** inside the game.
- One-off competition first. If it works, run monthly with a leaderboard reset, so tag every score with a competition ID (e.g. `launch-2026`).
- Polish translations and an EN/PL toggle come later, not in this release.
- The Spaniard's sauce is called "Chilli sauce".

## What's left to build for release

1. **Online leaderboard on Wix** *(first version built: `wix/`)*: a CMS collection for scores (nickname, score, orders, best combo, level, competition ID, created date). Show the top scores for the current competition.
2. **Server-side score checks** *(basic checks and 20 s rate limit built; replay-based check still to do)* so scores can't be faked from the browser. For example, send the game's event log or per-order timings to a Wix backend function that rejects impossible scores. Rate-limit submissions.
3. **Sign-up to submit a score** *(form and one-entry-per-email built; check wording with Joe)*: nickname plus email, with an **unticked** marketing opt-in tickbox (UK GDPR). Email must not be shown publicly. One entry per email per competition, but players keep their best score.
4. **Share card:** an image at the end of each game ("I served 32 orders at Rogi — beat me?") linking back to the Rogi - The Game page.
5. **Embed on the Wix Studio page** *(built: Embed code element + page code via `postMessage`, see `wix/SETUP.md`)*: the game in an HTML embed or custom element, talking to Wix (leaderboard, submission) through `postMessage`, or another approach Wix supports. Check the current Wix docs before choosing.
6. **Add extra characters:** The Vegan (Sauerkraut & Mushroom, served with crispy onions and without sauce; this differs from the menu on purpose because fried onions aren't vegan) and The Influencer (any pierogi, very little patience, triple points).

## Before release

- ~~Remove the test hook `window.__rogi`~~ (done 2026-11-26).
- Test on a real iPhone and Android phone: tap accuracy, sound only starting after the first tap, pause on tab switch.
- Ask Joe before publishing anything to the live Wix site.
