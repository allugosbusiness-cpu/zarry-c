/**
 * View/Play tracker for beats, videos, and music tracks.
 *
 * Each content item gets a seeded initial view count between 1200 and 100000,
 * stored in localStorage so it persists across sessions. When a user views
 * or interacts with content, the count increments (once per session per item).
 */

const VIEW_STORAGE_KEY = "zarryc_view_counts";
const VIEWED_SESSION_KEY = "zarryc_viewed_session";

interface ViewData {
  [itemId: string]: number;
}

function getViewData(): ViewData {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(VIEW_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveViewData(data: ViewData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(VIEW_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage full or unavailable
  }
}

/**
 * Generate a deterministic initial view count between 1200 and 100000
 * based on the item ID so the same item always gets the same starting count.
 */
function generateInitialViews(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // convert to 32bit int
  }
  // Normalize to range 1200-100000 (100000 - 1200 + 1 = 98801)
  const normalized = Math.abs(hash) % 98801;
  return 1200 + normalized;
}

/**
 * Get the current view/play count for a content item.
 * Returns the initial seeded count (1200–100000) if never viewed,
 * or the incremented count if already tracked.
 */
export function getViews(itemId: string): number {
  const data = getViewData();
  if (data[itemId] === undefined) {
    data[itemId] = generateInitialViews(itemId);
    saveViewData(data);
  }
  return data[itemId];
}

/**
 * Increment the view/play count for a content item.
 * Called when a user actually views/plays the content.
 * Rate-limited: only increments once per session per item.
 */
export function incrementViews(itemId: string): number {
  const data = getViewData();

  // Set initial views if not set
  if (data[itemId] === undefined) {
    data[itemId] = generateInitialViews(itemId);
  }

  // Check if already viewed this session
  let sessionViewed: Record<string, boolean> = {};
  if (typeof window !== "undefined") {
    try {
      const raw = sessionStorage.getItem(VIEWED_SESSION_KEY);
      sessionViewed = raw ? JSON.parse(raw) : {};
    } catch {
      // ignore
    }
  }

  // Only increment if not already viewed in this session
  if (!sessionViewed[itemId]) {
    data[itemId] += 1;
    saveViewData(data);

    // Mark as viewed in this session
    sessionViewed[itemId] = true;
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(VIEWED_SESSION_KEY, JSON.stringify(sessionViewed));
      } catch {
        // ignore
      }
    }
  }

  return data[itemId];
}

/**
 * Format a view count for display (e.g., 1500 -> "1.5K")
 */
export function formatViews(views: number): string {
  if (views >= 1_000_000) {
    return (views / 1_000_000).toFixed(1) + "M";
  }
  if (views >= 1_000) {
    return (views / 1_000).toFixed(1) + "K";
  }
  return views.toString();
}