/**
 * Dynamic content fetching from Firestore with static fallback.
 * Fetches beats, videos, singles/music sorted by createdAt (newest first).
 * Falls back to static data from site-data if Firestore is unavailable.
 */
import { beats as staticBeats, videos as staticVideos, albums as staticAlbums } from "@/data/site-data";

export interface ContentItem {
  id: string;
  createdAt?: any;
  title?: string;
  name?: string;
  [key: string]: any;
}

export type CollectionName = "beats" | "videos" | "music";

async function fetchCollection(collectionName: CollectionName): Promise<ContentItem[]> {
  try {
    const { db } = await import("@/lib/firebase/config");
    const { collection, getDocs } = await import("firebase/firestore");
    const snap = await getDocs(collection(db, collectionName));
    const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ContentItem));
    // Sort by createdAt desc in memory to avoid requiring a composite index
    return items.sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() || a.createdAt?.seconds * 1000 || 0;
      const bTime = b.createdAt?.toMillis?.() || b.createdAt?.seconds * 1000 || 0;
      return bTime - aTime;
    });
  } catch {
    // Firestore not available - return empty to trigger fallback
    return [];
  }
}

export async function getVideos(): Promise<any[]> {
  try {
    const firestoreVideos = await fetchCollection("videos");
    if (firestoreVideos.length > 0) {
      return firestoreVideos.map(v => ({
        ...v,
        buyPrice: v.buyPrice ?? 1,
        category: v.category ?? [],
        location: v.location ?? "",
      }));
    }
  } catch {}
  // Fallback to static data, sorted by date descending
  return [...staticVideos].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function getBeats(): Promise<any[]> {
  try {
    const firestoreBeats = await fetchCollection("beats");
    if (firestoreBeats.length > 0) {
      return firestoreBeats.map(b => ({
        ...b,
        sold: b.sold ?? false,
        plays: b.plays ?? 0,
        bpm: b.bpm ?? 0,
        key: b.key ?? "Am",
        tags: b.tags ?? [],
        price: b.price ?? 5,
      }));
    }
  } catch {}
  // Fallback to static data (keep original order - already sorted)
  return [...staticBeats];
}

export async function getMusicSingles(): Promise<any[]> {
  try {
    const firestoreMusic = await fetchCollection("music");
    if (firestoreMusic.length > 0) {
      return firestoreMusic.filter(m => m.type === "single");
    }
  } catch {}
  // Fallback - filter singles from static albums
  return staticAlbums.filter(a => a.type === "single").sort(
    (a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
  );
}

export async function getMusicAlbums(): Promise<any[]> {
  try {
    const firestoreMusic = await fetchCollection("music");
    if (firestoreMusic.length > 0) {
      return firestoreMusic.filter(m => m.type === "album" || m.type === "ep");
    }
  } catch {}
  return staticAlbums.filter(a => a.type === "album" || a.type === "ep").sort(
    (a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
  );
}

/**
 * Generic content fetcher that returns items sorted by createdAt descending.
 * Falls back to static data if Firestore fails.
 */
export async function getContent(
  collectionName: CollectionName,
  limit = 10,
  staticFallback: any[] = []
): Promise<any[]> {
  try {
    const items = await fetchCollection(collectionName);
    if (items.length > 0) {
      return items.slice(0, limit);
    }
  } catch {}
  return staticFallback.slice(0, limit);
}