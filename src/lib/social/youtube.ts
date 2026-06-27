import { SocialPost } from "@/types/social";

export async function fetchLatestYouTubeVideos(
  channelId?: string,
  apiKey?: string,
  maxResults: number = 6
): Promise<SocialPost[]> {
  const key = apiKey || process.env.YOUTUBE_API_KEY;
  const channel = channelId || process.env.YOUTUBE_CHANNEL_ID;

  if (!key || !channel) {
    console.warn("[YouTube] Missing API key or channel ID. Return mock data.");
    return getMockYouTubeVideos();
  }

  try {
    // Step 1: Get channel uploads playlist ID
    const channelRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channel}&key=${key}`,
      { next: { revalidate: 300 } } // cache for 5 min
    );

    if (!channelRes.ok) {
      console.error("[YouTube] Failed to fetch channel:", await channelRes.text());
      return getMockYouTubeVideos();
    }

    const channelData = await channelRes.json();
    const uploadsPlaylistId = channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

    if (!uploadsPlaylistId) {
      console.error("[YouTube] No uploads playlist found");
      return getMockYouTubeVideos();
    }

    // Step 2: Get latest videos from playlist
    const videosRes = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=${maxResults}&playlistId=${uploadsPlaylistId}&key=${key}`,
      { next: { revalidate: 300 } }
    );

    if (!videosRes.ok) {
      console.error("[YouTube] Failed to fetch videos:", await videosRes.text());
      return getMockYouTubeVideos();
    }

    const videosData = await videosRes.json();

    if (!videosData.items?.length) return [];

    // Step 3: Get video durations
    const videoIds = videosData.items.map((item: any) => item.snippet.resourceId.videoId).join(",");
    const detailsRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoIds}&key=${key}`,
      { next: { revalidate: 300 } }
    );

    const detailsData = await detailsRes.json();
    const detailsMap: Record<string, any> = {};
    detailsData.items?.forEach((item: any) => {
      detailsMap[item.id] = item;
    });

    return videosData.items.map((item: any, index: number) => {
      const videoId = item.snippet.resourceId.videoId;
      const details = detailsMap[videoId];
      const duration = details?.contentDetails?.duration
        ? parseYouTubeDuration(details.contentDetails.duration)
        : undefined;
      const views = details?.statistics?.viewCount
        ? formatCount(parseInt(details.statistics.viewCount))
        : undefined;

      return {
        id: `yt-${videoId}`,
        platform: 'youtube' as const,
        title: item.snippet.title,
        description: item.snippet.description?.slice(0, 200),
        thumbnailUrl: item.snippet.thumbnails?.maxres?.url || item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url,
        videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        publishedAt: item.snippet.publishedAt,
        duration,
        views,
        platformId: videoId,
      };
    });
  } catch (error) {
    console.error("[YouTube] Error:", error);
    return getMockYouTubeVideos();
  }
}

function parseYouTubeDuration(duration: string): string {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return "0:00";
  const hours = parseInt(match[1]?.replace("H", "") || "0");
  const minutes = parseInt(match[2]?.replace("M", "") || "0");
  const seconds = parseInt(match[3]?.replace("S", "") || "0");
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function formatCount(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function getMockYouTubeVideos(): SocialPost[] {
  return [
    {
      id: "yt-mock-tafemerana",
      platform: "youtube",
      title: "Tafemerana (Official Music Video)",
      description: "Official music video for Tafemerana — the title track from the EP. Directed by Zarry C.",
      thumbnailUrl: "/images/Tafemerana EP cover picture.jpg",
      videoUrl: "https://www.youtube.com/watch?v=tafemerana",
      url: "https://www.youtube.com/watch?v=tafemerana",
      publishedAt: "2026-05-20T00:00:00Z",
      duration: "3:45",
      views: "2.1M",
      platformId: "tafemerana",
    },
    {
      id: "yt-mock-allihave",
      platform: "youtube",
      title: "All I Have ft. Claire (Visualizer)",
      description: "Visual accompaniment to All I Have featuring Claire. A love story through cinematic lens.",
      thumbnailUrl: "/images/zarry c pose picture.png",
      videoUrl: "https://www.youtube.com/watch?v=allihave",
      url: "https://www.youtube.com/watch?v=allihave",
      publishedAt: "2026-06-01T00:00:00Z",
      duration: "4:02",
      views: "1.8M",
      platformId: "allihave",
    },
    {
      id: "yt-mock-nhaimwari",
      platform: "youtube",
      title: "NHAI MWARI (Official Audio)",
      description: "Official audio for NHAI MWARI — out now on all streaming platforms.",
      thumbnailUrl: "/images/NHAI MWARI Zarry c Single.png",
      videoUrl: "https://www.youtube.com/watch?v=nhaimwari",
      url: "https://www.youtube.com/watch?v=nhaimwari",
      publishedAt: "2026-06-01T00:00:00Z",
      duration: "3:45",
      views: "350K",
      platformId: "nhaimwari",
    },
    {
      id: "yt-mock-gyalkylie",
      platform: "youtube",
      title: "Gyal Kylie (Lyric Video)",
      description: "Lyric video for Gyal Kylie — the dancehall-infused anthem.",
      thumbnailUrl: "/images/Gyal Kylie ft Zarry C (single).PNG",
      videoUrl: "https://www.youtube.com/watch?v=gyalkylie",
      url: "https://www.youtube.com/watch?v=gyalkylie",
      publishedAt: "2026-03-05T00:00:00Z",
      duration: "3:30",
      views: "500K",
      platformId: "gyalkylie",
    },
    {
      id: "yt-mock-bts",
      platform: "youtube",
      title: "Behind The Scenes — Tafemerana Shoot",
      description: "Go behind the scenes of the Tafemerana music video shoot.",
      thumbnailUrl: "/images/ZARRY another pose image.png",
      videoUrl: "https://www.youtube.com/watch?v=bts-tafemerana",
      url: "https://www.youtube.com/watch?v=bts-tafemerana",
      publishedAt: "2026-05-25T00:00:00Z",
      duration: "8:20",
      views: "120K",
      platformId: "bts-tafemerana",
    },
    {
      id: "yt-mock-studio",
      platform: "youtube",
      title: "Studio Diary: Finding the Right 808",
      description: "A look into the production process and searching for the perfect low-end.",
      thumbnailUrl: "/images/Zarry c image (hero).png",
      videoUrl: "https://www.youtube.com/watch?v=studio-diary",
      url: "https://www.youtube.com/watch?v=studio-diary",
      publishedAt: "2026-04-12T00:00:00Z",
      duration: "5:00",
      views: "80K",
      platformId: "studio-diary",
    },
  ];
}