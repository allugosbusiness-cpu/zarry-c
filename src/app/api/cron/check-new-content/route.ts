import { NextResponse } from "next/server";
import { fetchLatestYouTubeVideos } from "@/lib/social/youtube";
import { fetchLatestSpotifyReleases } from "@/lib/social/spotify";
import { fetchLatestSoundCloudTracks } from "@/lib/social/soundcloud";
import { getSubscribersForNotification, createNotificationEvent, markNotificationSent } from "@/lib/firebase/subscribers";
import { getContentSnapshot, updateContentSnapshot, findNewContent } from "@/lib/firebase/content-tracker";
import { sendBulkNotifications } from "@/lib/email-service";

export const dynamic = "force-dynamic";
export const maxDuration = 60;
export const preferredRegion = "auto";

export async function GET() {
  return handleCheck();
}

export async function POST() {
  return handleCheck();
}

async function handleCheck() {
  const start = Date.now();
  const results: string[] = [];

  try {
    const [youtubePosts, spotifyPosts, soundcloudPosts] = await Promise.allSettled([
      fetchLatestYouTubeVideos(),
      fetchLatestSpotifyReleases(),
      fetchLatestSoundCloudTracks(),
    ]);

    const youtubeVideos = youtubePosts.status === "fulfilled" ? youtubePosts.value : [];
    const spotifyReleases = spotifyPosts.status === "fulfilled" ? spotifyPosts.value : [];
    const soundcloudTracks = soundcloudPosts.status === "fulfilled" ? soundcloudPosts.value : [];

    const currentYoutubeIds = youtubeVideos.map(v => v.platformId);
    const currentSpotifyIds = spotifyReleases.map(r => r.platformId);
    const currentSoundcloudIds = soundcloudTracks.map(t => t.platformId);

    const snapshot = await getContentSnapshot();

    if (!snapshot) {
      await updateContentSnapshot({
        youtubeVideoIds: currentYoutubeIds,
        spotifyReleaseIds: currentSpotifyIds,
        soundcloudTrackIds: currentSoundcloudIds,
        lastNotifiedYoutubeIds: currentYoutubeIds,
        lastNotifiedSpotifyIds: currentSpotifyIds,
        lastNotifiedSoundcloudIds: currentSoundcloudIds,
      });
      results.push("First run — content tracker initialised");
    } else {
      const newContent = findNewContent(snapshot, currentYoutubeIds, currentSpotifyIds, currentSoundcloudIds);

      // YouTube
      if (newContent.newYouTube.length > 0) {
        const newVideos = youtubeVideos.filter(v => newContent.newYouTube.includes(v.platformId));
        results.push(`New YouTube: ${newVideos.map(v => v.title).join(", ")}`);
        for (const video of newVideos) {
          const subs = await getSubscribersForNotification("music-release");
          const title = `🎬 New Video: ${video.title}`;
          const msg = video.description?.slice(0, 150) || `Latest from Zarry C — ${video.title}`;
          if (subs.length > 0) {
            const nid = await createNotificationEvent("music-release", title, msg, video.url);
            const { sent, failed } = await sendBulkNotifications(
              subs.map(s => ({ email: s.email, name: s.name })),
              "music-release", title, msg, video.url
            );
            await markNotificationSent(nid, subs.length);
            results.push(`  → Emailed ${sent}/${subs.length} subs (${failed} failed) about "${video.title}"`);
          }
        }
      } else {
        results.push("No new YouTube videos");
      }

      // Spotify
      if (newContent.newSpotify.length > 0) {
        const releases = spotifyReleases.filter(r => newContent.newSpotify.includes(r.platformId));
        results.push(`New Spotify: ${releases.map(r => r.title).join(", ")}`);
        for (const release of releases) {
          const subs = await getSubscribersForNotification("music-release");
          const title = `🎵 New Release: ${release.title}`;
          const msg = `"${release.title}" is out now on Spotify!`;
          if (subs.length > 0) {
            const nid = await createNotificationEvent("music-release", title, msg, release.url);
            const { sent, failed } = await sendBulkNotifications(
              subs.map(s => ({ email: s.email, name: s.name })),
              "music-release", title, msg, release.url
            );
            await markNotificationSent(nid, subs.length);
            results.push(`  → Emailed ${sent}/${subs.length} subs (${failed} failed) about "${release.title}"`);
          }
        }
      } else {
        results.push("No new Spotify releases");
      }

      // SoundCloud
      if (newContent.newSoundcloud.length > 0) {
        const tracks = soundcloudTracks.filter(t => newContent.newSoundcloud.includes(t.platformId));
        results.push(`New SoundCloud: ${tracks.map(t => t.title).join(", ")}`);
        for (const track of tracks) {
          const subs = await getSubscribersForNotification("music-release");
          const title = `🎧 New Track: ${track.title}`;
          const msg = `"${track.title}" is live on SoundCloud!`;
          if (subs.length > 0) {
            const nid = await createNotificationEvent("music-release", title, msg, track.url);
            const { sent, failed } = await sendBulkNotifications(
              subs.map(s => ({ email: s.email, name: s.name })),
              "music-release", title, msg, track.url
            );
            await markNotificationSent(nid, subs.length);
            results.push(`  → Emailed ${sent}/${subs.length} subs (${failed} failed) about "${track.title}"`);
          }
        }
      } else {
        results.push("No new SoundCloud tracks");
      }

      await updateContentSnapshot({
        youtubeVideoIds: currentYoutubeIds,
        spotifyReleaseIds: currentSpotifyIds,
        soundcloudTrackIds: currentSoundcloudIds,
        lastNotifiedYoutubeIds: currentYoutubeIds,
        lastNotifiedSpotifyIds: currentSpotifyIds,
        lastNotifiedSoundcloudIds: currentSoundcloudIds,
      });
    }

    return NextResponse.json({
      success: true,
      duration: `${Date.now() - start}ms`,
      timestamp: new Date().toISOString(),
      platformStatus: {
        youtube: youtubePosts.status,
        spotify: spotifyPosts.status,
        soundcloud: soundcloudPosts.status,
      },
      results,
    });
  } catch (error) {
    console.error("[Cron] Error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}