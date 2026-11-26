# Putting Rogi Rush on the Wix Studio site

This puts the game on the **Rogi - The Game** page with an online leaderboard.
Do it on a test page (or the unpublished page) first. Nothing here goes live until you publish the site.

How it fits together:

```
Game (index.html in an Embed code element, id "rogiGame")
   ⇅  postMessage (JSON strings)
Page code (wix/page/rogi-the-game.js)
   ⇅  web methods
Backend (wix/backend/leaderboard.web.js)  →  CMS collection "RogiScores" (Admin-only)
```

The browser never reads the collection directly. Only nickname and score details leave the backend; emails stay private.

## 1. Turn on code

In the Studio Editor, turn on coding (Dev Mode / **Start Coding**) if it isn't already on.

## 2. Create the CMS collection

CMS → **Create collection** → name it `RogiScores` (the collection ID must be exactly `RogiScores`).

Add these fields (field key → type):

| Field key | Type | Notes |
| --- | --- | --- |
| `nickname` | Text | Public |
| `email` | Text | **Private**, never shown |
| `marketingOptIn` | Boolean | True only if the player ticked the box |
| `competitionId` | Text | e.g. `launch-2026` |
| `score` | Number | Best score this competition |
| `orders` | Number | |
| `bestCombo` | Number | |
| `level` | Number | |
| `durationMs` | Number | Length of the best game |
| `attempts` | Number | How many times this email submitted |
| `lastSubmittedAt` | Date and time | Used for the rate limit |

Created date (`_createdDate`) is added by Wix automatically.

**Permissions:** set the collection to **Private** / custom with *Who can view / add / update / delete* all set to **Admin**.
The backend uses elevated permissions, so visitors don't need access.

## 3. Backend files

In the code panel, under **Backend**, create:

- `rogi-config.js` with the contents of `wix/backend/rogi-config.js`
- `leaderboard.web.js` with the contents of `wix/backend/leaderboard.web.js`

`@wix/data`, `@wix/essentials` and `@wix/web-methods` are built in on Wix sites. If the editor says a package is missing, install it from the package manager.

## 4. Add the game to the page

1. Add Elements → **Embed & Social** → **Embed Code**.
2. Enter Code → paste the whole of `index.html` → Apply.
3. In the Properties & Events panel set the element's ID to `rogiGame`.
4. Size it for phones first, for example 100% width and 667–740px high. In the cookie category choose **Essential**.

## 5. Page code

Open the page code for **Rogi - The Game** and paste `wix/page/rogi-the-game.js`.

## 6. Test in Preview

1. Preview the page. The start screen should say "Top score wins free dumplings…". If it still says "saved on this device only", the page code isn't talking to the game (check the element ID).
2. Play a short game. The end screen should show the score form and the leaderboard.
3. Submit with a test nickname and email. Check the row appears in the CMS, with the opt-in false unless you ticked it.
4. Submit again within 20 seconds: you should see "Hang on a few seconds…".

Delete test rows from the CMS before the competition starts.

## Starting a new competition

Change `CURRENT_COMPETITION_ID` in `backend/rogi-config.js` (e.g. `2027-01`) and publish. Old scores stay in the collection with their own ID; the leaderboard shows only the current one.

## Exporting opted-in emails

In the CMS, filter `RogiScores` by `marketingOptIn` = true and export. Only those players agreed to marketing.
