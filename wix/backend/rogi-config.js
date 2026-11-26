// Rogi Rush settings shared by the backend files.
// Change CURRENT_COMPETITION_ID when a new competition starts (for example "2027-01").
// Old scores stay in the collection, tagged with their own competition ID.

export const CURRENT_COMPETITION_ID = "launch-2026";

// The CMS collection ID (set when the collection is created, see wix/SETUP.md).
export const SCORES_COLLECTION = "RogiScores";

// How many rows the public leaderboard shows.
export const LEADERBOARD_SIZE = 10;

// One player (by email) can submit at most once in this many seconds.
export const MIN_SECONDS_BETWEEN_SUBMITS = 20;

// Highest points a single order can be worth in the current rules:
// (100 base + 100 speed) x3 combo x2 wave + 250 Babcia tip.
// Raise this if a new character (e.g. The Influencer, triple points) changes the maximum.
export const MAX_POINTS_PER_ORDER = 1450;
