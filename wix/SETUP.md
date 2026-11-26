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

Steps below match the Wix Studio editor as of November 2026. Wix autosaves the editor draft as you go; saving never publishes.

## 1. Create the page (if it doesn't exist)

Pages panel (left bar) → **+ Add New Page** → **Page** → name it `Rogi - The Game`.
Studio doesn't add new pages to the header menu automatically, so the page stays out of the menu until you add it.

## 2. Turn on code

Click the `{ }` icon in the left bar. It opens the **AI Code Assistant** first: click **Start Coding Manually** at the bottom.
The code menu then shows Page Code, Backend & Public, Databases, Packages & Apps and more.

## 3. Create the CMS collection

`{ }` → **Databases** → **+ Create collection** → **Get Started** → **Content collection** → Next → **Start from scratch** → Next.
Name it `RogiScores` (the collection ID fills in as `RogiScores`; it must be exactly that) and keep **Multiple item collection** → Create.

The collection opens with only a Title field. Click **Manage Fields** (above the table) and use the **Add Field** button at the bottom of that panel for each field.
Choose the type, then type the field key below as the **Field name**; the Field ID fills in to match.

| Field key | Type | Notes |
| --- | --- | --- |
| `nickname` | Text | Public |
| `email` | Text | **Private**, never shown. Leave "Encrypt as Personally Identifiable Information" off: the backend looks players up by email. |
| `competitionId` | Text | e.g. `launch-2026` |
| `score` | Number | Best score this competition |
| `orders` | Number | |
| `bestCombo` | Number | |
| `level` | Number | |
| `durationMs` | Number | Length of the best game |
| `attempts` | Number | How many times this email submitted |
| `marketingOptIn` | Boolean | True only if the player ticked the box |
| `lastSubmittedAt` | Date and Time | Under "Time and location" (scroll down). Used for the rate limit. |

Created date (`_createdDate`) is added by Wix automatically.

**Permissions (important):** a new collection defaults to **Show content → Everyone can view**, which would expose emails.
**More Actions** → **Permissions & privacy** → choose **Advanced** and make sure **Everyone**, **Members** and **Item's creator** have nothing ticked (Collaborators and Admin keep full access) → Save.
The collection list should then say "Permissions: Private". The backend uses elevated permissions, so visitors don't need access.

## 4. Backend files

`{ }` → **Backend & Public** → the **+** next to *Backend*:

- **Add .js file** → name it `rogi-config` → paste the contents of `wix/backend/rogi-config.js`.
- **Add web module** → name it `leaderboard` (Wix adds `.web.js`) → replace the sample code with the contents of `wix/backend/leaderboard.web.js`.

## 5. Install the Wix packages

The editor underlines the `@wix/...` imports until the packages are installed.
`{ }` → **Packages & Apps** → **+ Install packages from npm**, then search for and **Install** each of:

- `@wix/web-methods`
- `@wix/data`
- `@wix/essentials`

They appear under **Installed** when done. (A leftover "must be installed first" underline can stay until the editor reloads; Preview works.)

## 6. Add the game to the page

1. Open the **Rogi - The Game** page. Add Elements (`+`) → **Embed & Social** → **Embed Code** → click its **+**.
2. On the element's toolbar click **Enter Code** → keep **Code** selected → paste the whole of `index.html` → **Apply**.
   In the same panel, add alt text (e.g. "Rogi Rush, the pierogi stall game") and leave the cookie category as **Essential**.
3. Set the element's ID: with the element selected, open the code panel at the bottom of the editor (click the page's tab there).
   Its **Properties & Events** side shows `ID #html1`: change it to `rogiGame`.
4. Size (right-hand inspector, Design tab):
   - **Desktop:** Responsive behavior **Fixed**, W `420`, H `740`, then the "align center" button so it sits in the middle. (Studio only lets you change the height after switching away from "Scale proportionally".)
   - **Mobile** breakpoint (phone icon in the top bar): Responsive behavior **Relative width**, X `0`, Y `0`, W `390` (the full mobile canvas), H `520`. The game scales itself down to fit the frame, and 520 keeps the whole frame on screen below the site header on most phones.

## 7. Page code

In the code panel at the bottom, open the **Rogi - The Game** tab and replace the sample code with `wix/page/rogi-the-game.js`.

## 8. Test in Preview

Use the eye icon's menu at the top right → **Preview in Editor** (not "Preview as Test Site"). Preview runs the backend against the real `RogiScores` collection.

1. The start screen should say "Top score wins free dumplings…". If it still says "saved on this device only", the page code isn't talking to the game (check the element ID).
2. Play a short game and serve at least one order (the score form only appears when orders > 0). The end screen should show the score form and the leaderboard.
3. Submit with a test nickname and email. Check the row appears in the CMS, with `marketingOptIn` unticked unless you ticked the box.
4. Play again with the same email and submit within 20 seconds: you should see "Hang on a few seconds…".

Delete test rows from the CMS before the competition starts (right-click the row → Delete Item).

## Starting a new competition

Change `CURRENT_COMPETITION_ID` in `backend/rogi-config.js` (e.g. `2027-01`) and publish. Old scores stay in the collection with their own ID; the leaderboard shows only the current one.

## Exporting opted-in emails

In the CMS, filter `RogiScores` by `marketingOptIn` = true and export. Only those players agreed to marketing.
