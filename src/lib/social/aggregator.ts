import { SocialPost } from "@/types/social";
import { fetchLatestYouTubeVideos } from "./youtube";
import { fetchLatestSpotifyReleases } from "./spotify";
import { fetchLatestSoundCloudTracks } from "./soundcloud";

export interface SocialFeedResult {
  posts: SocialPost[];
  loading: boolean;
  error: string | null;
  timestamp: number;
}

export async function fetchAllSocialFeed(): Promise<SocialFeedResult> {
  const start = Date.now();

  try {
    const [youtube, spotify, soundcloud] = await Promise.allSettled([
      fetchLatestYouTubeVideos(),
      fetchLatestSpotifyReleases(),
      fetchLatestSoundCloudTracks(),
    ]);

    const errors: string[] = [];

    if (youtube.status === "rejected") errors.push(`YouTube: ${youtube.reason}`);
    if (spotify.status === "rejected") errors.push(`Spotify: ${spotify.reason}`);
    if (soundcloud.status === "rejected") errors.push(`SoundCloud: ${soundcloud.reason}`);

    const posts: SocialPost[] = [
      ...(youtube.status === "fulfilled" ? youtube.value : []),
      ...(spotify.status === "fulfilled" ? spotify.value : []),
      ...(soundcloud.status === "fulfilled" ? soundcloud.value : []),
    ];

    // Sort by published date descending
    posts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    return {
      posts,
      loading: false,
      error: errors.length > 0 ? errors.join("; ") : null,
      timestamp: Date.now(),
    };
  } catch (error) {
    return {
      posts: [],
      loading: false,
      error: error instanceof Error ? error.message : "Unknown error fetching social feeds",
      timestamp: Date.now(),
    };
  }
}