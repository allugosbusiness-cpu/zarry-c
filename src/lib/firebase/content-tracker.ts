import { db } from "./config";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

interface ContentSnapshot {
  lastChecked: Date;
  youtubeVideoIds: string[];
  spotifyReleaseIds: string[];
  soundcloudTrackIds: string[];
  lastNotifiedYoutubeIds: string[];
  lastNotifiedSpotifyIds: string[];
  lastNotifiedSoundcloudIds: string[];
}

const TRACKER_DOC_ID = "platform-content";
const TRACKER_COLLECTION = "content_tracker";

// Get the current content snapshot from Firestore
export async function getContentSnapshot(): Promise<ContentSnapshot | null> {
  try {
    const docRef = doc(db, TRACKER_COLLECTION, TRACKER_DOC_ID);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      lastChecked: data.lastChecked?.toDate() || new Date(0),
      youtubeVideoIds: data.youtubeVideoIds || [],
      spotifyReleaseIds: data.spotifyReleaseIds || [],
      soundcloudTrackIds: data.soundcloudTrackIds || [],
      lastNotifiedYoutubeIds: data.lastNotifiedYoutubeIds || [],
      lastNotifiedSpotifyIds: data.lastNotifiedSpotifyIds || [],
      lastNotifiedSoundcloudIds: data.lastNotifiedSoundcloudIds || [],
    };
  } catch (e) {
    console.warn("[ContentTracker] Failed to get snapshot:", e);
    return null;
  }
}

// Update the stored content snapshot
export async function updateContentSnapshot(data: {
  youtubeVideoIds: string[];
  spotifyReleaseIds: string[];
  soundcloudTrackIds: string[];
  lastNotifiedYoutubeIds: string[];
  lastNotifiedSpotifyIds: string[];
  lastNotifiedSoundcloudIds: string[];
}): Promise<void> {
  try {
    const docRef = doc(db, TRACKER_COLLECTION, TRACKER_DOC_ID);
    await setDoc(docRef, {
      ...data,
      lastChecked: serverTimestamp(),
    }, { merge: true });
  } catch (e) {
    console.warn("[ContentTracker] Failed to update snapshot:", e);
  }
}

// Find new content that hasn't been notified yet
export function findNewContent(
  current: ContentSnapshot,
  youtubeIds: string[],
  spotifyIds: string[],
  soundcloudIds: string[]
): {
  newYouTube: string[];
  newSpotify: string[];
  newSoundcloud: string[];
} {
  return {
    newYouTube: youtubeIds.filter(id => !current.lastNotifiedYoutubeIds.includes(id)),
    newSpotify: spotifyIds.filter(id => !current.lastNotifiedSpotifyIds.includes(id)),
    newSoundcloud: soundcloudIds.filter(id => !current.lastNotifiedSoundcloudIds.includes(id)),
  };
}