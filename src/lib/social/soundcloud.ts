import { SocialPost } from "@/types/social";

export async function fetchLatestSoundCloudTracks(
  userId?: string,
  clientId?: string,
  maxResults: number = 6
): Promise<SocialPost[]> {
  const id = userId || process.env.SOUNDCLOUD_USER_ID;
  const cId = clientId || process.env.SOUNDCLOUD_CLIENT_ID;

  if (!id || !cId) {
    console.warn("[SoundCloud] Missing config. Return mock data.");
    return getMockSoundCloudTracks();
  }

  try {
    const res = await fetch(
      `https://api.soundcloud.com/users/${id}/tracks?client_id=${cId}&limit=${maxResults}&linked_partitioning=1`,
      { next: { revalidate: 300 } }
    );

    if (!res.ok) {
      console.error("[SoundCloud] Fetch failed:", await res.text());
      return getMockSoundCloudTracks();
    }

    const data = await res.json();

    if (!data.collection?.length) return [];

    return data.collection.map((track: any) => ({
      id: `sc-${track.id}`,
      platform: 'soundcloud' as const,
      title: track.title,
      description: track.description?.slice(0, 200),
      thumbnailUrl: track.artwork_url || track.user?.avatar_url,
      audioUrl: track.permalink_url,
      url: track.permalink_url,
      publishedAt: track.created_at,
      duration: formatSeconds(track.duration ? Math.floor(track.duration / 1000) : 0),
      views: track.playback_count ? formatCount(track.playback_count) : undefined,
      platformId: String(track.id),
    }));
  } catch (error) {
    console.error("[SoundCloud] Error:", error);
    return getMockSoundCloudTracks();
  }
}

function formatSeconds(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function formatCount(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function getMockSoundCloudTracks(): SocialPost[] {
  return [
    {
      id: "sc-mock-tafemerana",
      platform: "soundcloud",
      title: "Tafemerana",
      description: "Tafemerana — title track from the EP",
      thumbnailUrl: "/images/Tafemerana EP cover picture.jpg",
      audioUrl: "https://soundcloud.com/zarryc/tafemerana",
      url: "https://soundcloud.com/zarryc/tafemerana",
      publishedAt: "2026-05-15T00:00:00Z",
      duration: "3:45",
      views: "45K",
      platformId: "mock-tafemerana",
    },
    {
      id: "sc-mock-allihave",
      platform: "soundcloud",
      title: "All I Have ft. Claire",
      description: "All I Have featuring Claire",
      thumbnailUrl: "/images/zarry c pose picture.png",
      audioUrl: "https://soundcloud.com/zarryc/allihave",
      url: "https://soundcloud.com/zarryc/allihave",
      publishedAt: "2026-05-15T00:00:00Z",
      duration: "4:02",
      views: "32K",
      platformId: "mock-allihave",
    },
    {
      id: "sc-mock-nhaimwari",
      platform: "soundcloud",
      title: "NHAI MWARI",
      description: "NHAI MWARI — out now",
      thumbnailUrl: "/images/NHAI MWARI Zarry c Single.png",
      audioUrl: "https://soundcloud.com/zarryc/nhaimwari",
      url: "https://soundcloud.com/zarryc/nhaimwari",
      publishedAt: "2026-06-01T00:00:00Z",
      duration: "3:45",
      views: "18K",
      platformId: "mock-nhaimwari",
    },
  ];
}