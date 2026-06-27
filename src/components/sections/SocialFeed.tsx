"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { SocialPost } from "@/types/social";
import { 
  FaYoutube, FaSpotify, FaSoundcloud, 
  FaPlay, FaMusic, FaExternalLinkAlt 
} from "react-icons/fa";
import { HiRefresh } from "react-icons/hi";
import { artistInfo } from "@/data/site-data";

type PlatformFilter = "all" | "youtube" | "spotify" | "soundcloud";

const platformConfig = {
  youtube: { icon: FaYoutube, color: "text-red-500", bg: "bg-red-500/10", label: "YouTube" },
  spotify: { icon: FaSpotify, color: "text-green-500", bg: "bg-green-500/10", label: "Spotify" },
  soundcloud: { icon: FaSoundcloud, color: "text-orange-500", bg: "bg-orange-500/10", label: "SoundCloud" },
};

export function SocialFeed() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<PlatformFilter>("all");
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollPos, setScrollPos] = useState(0);

  const fetchFeed = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/social/feed");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setPosts(data.posts || []);
      if (data.error) setError(data.error);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
    const interval = setInterval(fetchFeed, 5 * 60 * 1000); // refresh every 5 min
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll carousel
  useEffect(() => {
    if (!autoScroll || !scrollRef.current || posts.length === 0) return;
    const scrollInterval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        const maxScroll = scrollWidth - clientWidth;
        if (scrollLeft >= maxScroll - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          scrollRef.current.scrollBy({ left: 320, behavior: "smooth" });
        }
      }
    }, 4000);
    return () => clearInterval(scrollInterval);
  }, [autoScroll, posts]);

  const filtered = filter === "all" 
    ? posts 
    : posts.filter(p => p.platform === filter);

  const platformButtons: { key: PlatformFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "youtube", label: "YouTube" },
    { key: "spotify", label: "Spotify" },
    { key: "soundcloud", label: "SoundCloud" },
  ];

  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-dark-900/30">
      {/* Background glow */}
      <motion.div
        animate={{ opacity: [0.03, 0.06, 0.03] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-1/3 left-0 w-[400px] h-[400px] rounded-full bg-pink-500 blur-[200px]"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10"
        >
          <div>
            <span className="text-pink-400 text-sm font-semibold uppercase tracking-widest">Live Feed</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-2">Latest Releases</h2>
            <p className="text-white/40 mt-2 max-w-xl">
              Auto-fetched from YouTube, Spotify & SoundCloud — always up to date.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setAutoScroll(!autoScroll); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                autoScroll 
                  ? "bg-pink-500/20 text-pink-400" 
                  : "bg-white/5 text-white/40"
              }`}
            >
              {autoScroll ? "Auto-Scroll ON" : "Auto-Scroll OFF"}
            </button>
            <button
              onClick={fetchFeed}
              disabled={loading}
              className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs font-medium transition-all disabled:opacity-50"
            >
              <HiRefresh className={`w-3.5 h-3.5 inline-block mr-1 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </motion.div>

        {/* Platform filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {platformButtons.map((btn) => (
            <button
              key={btn.key}
              onClick={() => setFilter(btn.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                filter === btn.key
                  ? "bg-pink-500/20 text-pink-400 border border-pink-500/30"
                  : "bg-white/5 text-white/50 hover:text-white hover:bg-white/10 border border-transparent"
              }`}
            >
              {btn.key !== "all" && (
                <span className="mr-1.5">
                  {React.createElement(platformConfig[btn.key].icon, { className: "w-3.5 h-3.5 inline-block" })}
                </span>
              )}
              {btn.label}
            </button>
          ))}
        </div>

        {/* Loading state */}
        {loading && posts.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-2 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" />
              <p className="text-white/40 text-sm">Fetching latest releases...</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {!loading && error && posts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-white/40 mb-2">Could not load social feed</p>
            <p className="text-white/20 text-xs mb-4">{error}</p>
            <button
              onClick={fetchFeed}
              className="px-4 py-2 bg-pink-500/20 hover:bg-pink-500/30 text-pink-400 rounded-full text-sm font-medium transition-all"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <FaMusic className="w-6 h-6 text-white/20" />
            </div>
            <p className="text-white/40">No releases found for this platform</p>
          </div>
        )}

        {/* Carousel */}
        {filtered.length > 0 && (
          <div className="relative">
            {/* Gradient fades */}
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-dark-900/30 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-dark-900/30 to-transparent z-10 pointer-events-none" />

            <div
              ref={scrollRef}
              onMouseEnter={() => setAutoScroll(false)}
              onMouseLeave={() => setAutoScroll(true)}
              className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory -mx-4 px-4"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <AnimatePresence mode="popLayout">
                {filtered.map((post, i) => (
                  <motion.div
                    key={post.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.03, type: "spring", stiffness: 300 }}
                    className="snap-start flex-shrink-0 w-[280px] sm:w-[300px]"
                  >
                    <Link
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block relative rounded-2xl overflow-hidden bg-dark-800/80 border border-white/5 hover:border-white/10 transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/5"
                    >
                      {/* Thumbnail */}
                      <div className="relative aspect-video overflow-hidden">
                        {post.thumbnailUrl ? (
                          <Image
                            src={post.thumbnailUrl}
                            alt={post.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            sizes="300px"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-dark-700 to-dark-800 flex items-center justify-center">
                            <FaMusic className="w-10 h-10 text-white/10" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                        {/* Platform badge */}
                        <div className="absolute top-2 left-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold ${
                            platformConfig[post.platform].bg
                          } ${platformConfig[post.platform].color}`}>
                            {React.createElement(platformConfig[post.platform].icon, { className: "w-3 h-3" })}
                            {platformConfig[post.platform].label}
                          </span>
                        </div>

                        {/* Duration badge */}
                        {post.duration && (
                          <div className="absolute top-2 right-2">
                            <span className="px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium">
                              {post.duration}
                            </span>
                          </div>
                        )}

                        {/* Play overlay */}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <motion.div
                            whileHover={{ scale: 1.15 }}
                            className="w-14 h-14 rounded-full bg-pink-500/90 flex items-center justify-center shadow-lg shadow-pink-500/30"
                          >
                            <FaPlay className="w-5 h-5 text-white ml-0.5" />
                          </motion.div>
                        </div>

                        {/* Views */}
                        {post.views && (
                          <div className="absolute bottom-2 left-2">
                            <span className="text-white/60 text-xs drop-shadow-lg">
                              {post.views} views
                            </span>
                          </div>
                        )}

                        {/* External link */}
                        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <FaExternalLinkAlt className="w-3 h-3 text-white/60" />
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-3">
                        <h3 className="text-white text-sm font-semibold truncate group-hover:text-pink-400 transition-colors">
                          {post.title}
                        </h3>
                        {post.description && (
                          <p className="text-white/40 text-xs mt-1 line-clamp-2">
                            {post.description}
                          </p>
                        )}
                        <p className="text-white/20 text-[10px] mt-2">
                          {formatDate(post.publishedAt)}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex items-center justify-center gap-6 mt-10 flex-wrap"
        >
          <Link
            href="https://youtube.com/@zarrycmusic/videos"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-white/40 hover:text-red-500 text-sm transition-colors"
          >
            <FaYoutube className="w-4 h-4" /> YouTube
          </Link>
          <Link
            href={artistInfo.socials.spotify}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-white/40 hover:text-green-500 text-sm transition-colors"
          >
            <FaSpotify className="w-4 h-4" /> Spotify
          </Link>
          <Link
            href={artistInfo.socials.soundcloud}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-white/40 hover:text-orange-500 text-sm transition-colors"
          >
            <FaSoundcloud className="w-4 h-4" /> SoundCloud
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}