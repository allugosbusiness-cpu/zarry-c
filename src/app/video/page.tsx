"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { videos as staticVideos } from "@/data/site-data";
import { getVideos } from "@/lib/firebase/data/content";
import { PayNowButton } from "@/components/ui/paynow-button";
import { getViews, incrementViews, formatViews } from "@/lib/view-tracker";
import { HiPlay, HiPause, HiArrowLeft, HiClock, HiMapPin } from "react-icons/hi2";

export default function VideoPage({
  params,
  searchParams,
}: {
  params?: Promise<{}>;
  searchParams?: Promise<{}>;
}) {
  const unwrappedParams = params ? React.use(params) : {};
  const unwrappedSearchParams = searchParams ? React.use(searchParams) : {};

  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [posters, setPosters] = useState<Record<string, string>>({});
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const hoverTimeoutRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    async function loadContent() {
      try {
        const fetchedVideos = await getVideos();
        setVideos(fetchedVideos);
      } catch {
        setVideos([...staticVideos].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        ));
      } finally {
        setLoading(false);
      }
    }
    loadContent();
  }, []);

  // Auto-capture first frame for videos without a thumbnail
  useEffect(() => {
    if (loading) return;
    const items = loading ? staticVideos : videos;
    items.forEach((video) => {
      if (video.thumbnail || posters[video.id]) return;

      const vid = document.createElement("video");
      vid.src = video.videoUrl;
      vid.muted = true;
      vid.playsInline = true;
      vid.preload = "auto";
      vid.crossOrigin = "anonymous";

      let captured = false;

      const onCanPlay = () => {
        if (captured) return;
        captured = true;
        vid.currentTime = 0.2;
      };

      const onSeeked = () => {
        try {
          const canvas = document.createElement("canvas");
          const w = vid.videoWidth || 640;
          const h = vid.videoHeight || 360;
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(vid, 0, 0, w, h);
            const dataUrl = canvas.toDataURL("image/jpeg", 0.5);
            setPosters((prev) => ({ ...prev, [video.id]: dataUrl }));
          }
        } catch (e) {
          console.log("[Video] poster capture error:", e);
        }
        cleanup();
      };

      const onError = () => {
        captured = true;
        cleanup();
      };

      function cleanup() {
        vid.removeEventListener("canplay", onCanPlay);
        vid.removeEventListener("seeked", onSeeked);
        vid.removeEventListener("error", onError);
        vid.src = "";
        vid.load();
      }

      vid.addEventListener("canplay", onCanPlay);
      vid.addEventListener("seeked", onSeeked);
      vid.addEventListener("error", onError);
      vid.load();
    });
  }, [loading, videos, posters]);

  const togglePlay = useCallback((videoId: string) => {
    const videoEl = videoRefs.current[videoId];
    if (!videoEl) return;

    if (playingId === videoId) {
      videoEl.pause();
      setPlayingId(null);
    } else {
      if (playingId) {
        const prev = videoRefs.current[playingId];
        if (prev) prev.pause();
      }
      videoEl.muted = false;
      videoEl.currentTime = 0;
      videoEl.play().catch(() => {});
      setPlayingId(videoId);
    }
  }, [playingId]);

  const handleMouseEnter = useCallback((videoId: string) => {
    if (hoverTimeoutRef.current[videoId]) {
      clearTimeout(hoverTimeoutRef.current[videoId]);
    }
    if (playingId === videoId) return;

    hoverTimeoutRef.current[videoId] = setTimeout(() => {
      setHoveredId(videoId);
      const videoEl = videoRefs.current[videoId];
      if (videoEl && playingId !== videoId) {
        videoEl.muted = true;
        videoEl.currentTime = 0;
        videoEl.play().catch(() => {});
      }
    }, 300);
  }, [playingId]);

  const handleMouseLeave = useCallback((videoId: string) => {
    if (hoverTimeoutRef.current[videoId]) {
      clearTimeout(hoverTimeoutRef.current[videoId]);
    }
    setHoveredId(null);
    const videoEl = videoRefs.current[videoId];
    if (videoEl && playingId !== videoId) {
      videoEl.pause();
      videoEl.currentTime = 0;
      videoEl.muted = false;
    }
  }, [playingId]);

  const [videoViewCounts, setVideoViewCounts] = useState<Record<string, number>>({});

  // Initialize view counts for videos
  useEffect(() => {
    if (!loading) {
      const counts: Record<string, number> = {};
      videos.forEach((video: any) => {
        counts[video.id] = getViews(video.id);
      });
      setVideoViewCounts(counts);
    }
  }, [loading, videos]);

  // Override togglePlay to increment views
  const handleVideoPlay = useCallback((videoId: string) => {
    // Increment view count
    const newViews = incrementViews(videoId);
    setVideoViewCounts(prev => ({ ...prev, [videoId]: newViews }));
    // Call original togglePlay
    togglePlay(videoId);
  }, [togglePlay]);

  const displayVideos = loading ? staticVideos : videos;

  return (
    <div className="min-h-screen bg-dark-950 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-6 transition-colors"><HiArrowLeft className="w-4 h-4" /> Back</Link>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">Video</h1>
          <p className="text-white/40 text-lg max-w-xl">Music videos, visualizers, behind-the-scenes, and videography portfolio.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayVideos.map((video, i) => {
            const posterSrc = video.thumbnail || posters[video.id];

            return (
            <motion.div key={video.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <div className="group"
                onMouseEnter={() => {
                  Object.keys(videoRefs.current).forEach((id) => {
                    if (id !== video.id && hoveredId === id) {
                      const el = videoRefs.current[id];
                      if (el && playingId !== id) {
                        el.pause();
                        el.currentTime = 0;
                      }
                    }
                  });
                  handleMouseEnter(video.id);
                }}
                onMouseLeave={() => handleMouseLeave(video.id)}
              >
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-dark-800">
                  {/* Video element for playback and hover preview */}
                  <video
                    ref={(el) => { videoRefs.current[video.id] = el; }}
                    src={video.videoUrl}
                    className={`absolute inset-0 w-full h-full object-cover z-10 transition-opacity duration-300 ${
                      playingId === video.id || hoveredId === video.id ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                    playsInline
                    preload="auto"
                    muted={hoveredId === video.id}
                    onEnded={() => setPlayingId(null)}
                    onError={(e) => console.log("[Video] Error loading:", video.videoUrl, e)}
                  />

                  {/* Poster/thumbnail layer - visible when not playing or hovering */}
                  <div className={`absolute inset-0 z-20 transition-opacity duration-300 ${
                    playingId === video.id || hoveredId === video.id ? "opacity-0 pointer-events-none" : "opacity-100"
                  }`}>
                    {posterSrc ? (
                      <img
                        src={posterSrc}
                        alt={video.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-dark-700 to-dark-900 flex items-center justify-center">
                        <svg className="w-16 h-16 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                      </div>
                    )}

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                    {/* Play button */}
                    <button
                      onClick={() => handleVideoPlay(video.id)}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <div className="w-16 h-16 rounded-full bg-pink-500/90 flex items-center justify-center transform group-hover:scale-110 transition-transform">
                        <HiPlay className="w-7 h-7 text-white ml-0.5" />
                      </div>
                    </button>
                  </div>

                  {/* Top badges */}
                  <div className="absolute top-3 left-3 flex gap-2 flex-wrap z-50">
                    <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs font-medium">
                      <HiClock className="w-3 h-3 inline mr-1" />{video.duration}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-black/40 text-white/80 text-xs border border-white/10">
                      {formatViews(videoViewCounts[video.id] || getViews(video.id))} views
                    </span>
                    {video.category?.map((c: string) => (
                      <span key={c} className="px-2.5 py-1 rounded-full bg-black/40 text-white/80 text-xs border border-white/10">{c}</span>
                    ))}
                    {hoveredId === video.id && (
                      <span className="px-2.5 py-1 rounded-full bg-pink-500/60 text-white text-xs font-medium animate-pulse">
                        Preview
                      </span>
                    )}
                  </div>

                  {/* Pause overlay when actively playing */}
                  {playingId === video.id && (
                    <button
                      onClick={() => handleVideoPlay(video.id)}
                      className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <HiPause className="w-6 h-6 text-white" />
                      </div>
                    </button>
                  )}

                  {/* Bottom info bar */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent z-40">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold truncate">{video.title}</p>
                        <p className="text-white/60 text-sm flex items-center gap-1"><HiMapPin className="w-3 h-3 flex-shrink-0" /><span className="truncate">{video.location}</span></p>
                      </div>
                      {video.buyPrice && (
                        <PayNowButton
                          variant="green"
                          size="sm"
                          amount={video.buyPrice}
                          itemName={video.title}
                          description={video.description}
                        >
                          Buy ${video.buyPrice}
                        </PayNowButton>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}