import { SocialPost } from "@/types/social";

export async function fetchLatestSpotifyReleases(
  artistId?: string,
  clientId?: string,
  clientSecret?: string,
  maxResults: number = 6
): Promise<SocialPost[]> {
  const id = artistId || process.env.SPOTIFY_ARTIST_ID;
  const cId = clientId || process.env.SPOTIFY_CLIENT_ID;
  const cSecret = clientSecret || process.env.SPOTIFY_CLIENT_SECRET;

  if (!id || !cId || !cSecret) {
    console.warn("[Spotify] Missing config. Return mock data.");
    return getMockSpotifyReleases();
  }

  try {
    // Get access token
    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${cId}:${cSecret}`).toString("base64")}`,
      },
      body: "grant_type=client_credentials",
    });

    if (!tokenRes.ok) {
      console.error("[Spotify] Auth failed:", await tokenRes.text());
      return getMockSpotifyReleases();
    }

    const { access_token } = await tokenRes.json();

    // Get artist's albums & singles
    const albumsRes = await fetch(
      `https://api.spotify.com/v1/artists/${id}/albums?include_groups=album,single,ep&limit=${maxResults}&sort=release_date_desc`,
      {
        headers: { Authorization: `Bearer ${access_token}` },
        next: { revalidate: 300 },
      }
    );

    if (!albumsRes.ok) {
      console.error("[Spotify] Albums fetch failed:", await albumsRes.text());
      return getMockSpotifyReleases();
    }

    const albumsData = await albumsRes.json();

    if (!albumsData.items?.length) return [];

    return albumsData.items.map((item: any) => {
      const albumId = item.id;
      const cover = item.images?.[0]?.url;
      const totalTracks = item.total_tracks;
      const releaseType = item.album_type;

      return {
        id: `sp-${albumId}`,
        platform: 'spotify' as const,
        title: item.name,
        description: `${releaseType === "single" ? "Single" : releaseType === "ep" ? "EP" : "Album"} · ${totalTracks} track${totalTracks > 1 ? "s" : ""}`,
        thumbnailUrl: cover,
        audioUrl: `https://open.spotify.com/${albumTypePath(releaseType)}/${albumId}`,
        url: `https://open.spotify.com/${albumTypePath(releaseType)}/${albumId}`,
        publishedAt: item.release_date,
        views: undefined,
        platformId: albumId,
      };
    });
  } catch (error) {
    console.error("[Spotify] Error:", error);
    return getMockSpotifyReleases();
  }
}

function albumTypePath(type: string): string {
  if (type === "single") return "track";
  return "album";
}

function getMockSpotifyReleases(): SocialPost[] {
  return [
    {
      id: "sp-mock-tafemerana",
      platform: "spotify",
      title: "Tafemerana EP",
      description: "EP · 5 tracks",
      thumbnailUrl: "/images/Tafemerana EP cover picture.jpg",
      audioUrl: "https://open.spotify.com/album/tafemerana",
      url: "https://open.spotify.com/album/tafemerana",
      publishedAt: "2026-05-15",
      platformId: "tafemerana-ep",
    },
    {
      id: "sp-mock-nhaimwari",
      platform: "spotify",
      title: "NHAI MWARI",
      description: "Single · 1 track",
      thumbnailUrl: "/images/NHAI MWARI Zarry c Single.png",
      audioUrl: "https://open.spotify.com/track/nhaimwari",
      url: "https://open.spotify.com/track/nhaimwari",
      publishedAt: "2026-06-01",
      platformId: "nhaimwari-single",
    },
    {
      id: "sp-mock-gyalkylie",
      platform: "spotify",
      title: "Gyal Kylie",
      description: "Single · 1 track",
      thumbnailUrl: "/images/Gyal Kylie ft Zarry C (single).PNG",
      audioUrl: "https://open.spotify.com/track/gyalkylie",
      url: "https://open.spotify.com/track/gyalkylie",
      publishedAt: "2026-03-01",
      platformId: "gyalkylie-single",
    },
  ];
}