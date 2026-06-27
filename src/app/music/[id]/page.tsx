"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { albums } from "@/data/site-data";
import { PayNowButton } from "@/components/ui/paynow-button";
import { getViews, incrementViews, formatViews } from "@/lib/view-tracker";
import { HiArrowLeft, HiPlay, HiPause, HiMusicalNote, HiShoppingCart, HiArrowDownTray } from "react-icons/hi2";

export default function AlbumDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const album = albums.find((a) => a.id === id);
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);
  const [trackViews, setTrackViews] = useState<Record<string, number>>({});
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});

  // Initialize track view counts
  React.useEffect(() => {
    if (album) {
      const counts: Record<string, number> = {};
      album.tracks.forEach(track => {
        counts[track.id] = getViews(track.id);
      });
      setTrackViews(counts);
    }
  }, [album]);

  const togglePlay = (trackId: string) => {
    const audioEl = audioRefs.current[trackId];
    if (!audioEl) return;

    if (playingTrack === trackId) {
      audioEl.pause();
      setPlayingTrack(null);
    } else {
      if (playingTrack) {
        const prev = audioRefs.current[playingTrack];
        if (prev) prev.pause();
      }
      // Increment track plays
      const newViews = incrementViews(trackId);
      setTrackViews(prev => ({ ...prev, [trackId]: newViews }));
      audioEl.currentTime = 0;
      audioEl.play().catch(() => {});
      setPlayingTrack(trackId);
    }
  };

  if (!album) {
    return (
      <div className="min-h-screen bg-dark-950 pt-24 pb-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Album not found</h1>
          <Link href="/music" className="text-pink-400 hover:underline">Back to Music</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/music" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-6 transition-colors">
          <HiArrowLeft className="w-4 h-4" /> Back to Music
        </Link>

        <div className="flex flex-col md:flex-row gap-8 mb-12">
          <div className="relative w-64 h-64 flex-shrink-0 mx-auto md:mx-0">
            <Image src={album.cover} alt={album.title} fill className="object-cover rounded-2xl shadow-2xl"
              sizes="256px" priority />
          </div>
          <div className="flex-1 text-center md:text-left">
            <span className="inline-block px-3 py-1 rounded-full bg-pink-500/20 text-pink-400 text-xs font-medium uppercase tracking-wider mb-3">
              {album.type}
            </span>
            <h1 className="text-4xl font-bold text-white mb-2">{album.title}</h1>
            <p className="text-white/50 text-sm mb-2">{album.genre.join(" / ")}</p>
            <p className="text-white/30 text-sm mb-4">{album.tracks.length} tracks · {album.streams} streams</p>
            <p className="text-white/40 text-sm mb-4">{album.credits}</p>
            <PayNowButton
              variant="pink"
              size="xl"
              amount={album.price || 1}
              itemName={album.title}
              description={`${album.type.toUpperCase()} by Zarry C`}
            >
              Buy Full Album ${album.price} — <HiArrowDownTray className="w-4 h-4 inline" /> Download All Tracks
            </PayNowButton>
          </div>
        </div>

        <div className="space-y-2">
          {album.tracks.map((track, i) => (
            <motion.div key={track.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group">
              <button onClick={() => togglePlay(track.id)}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-pink-500/20 flex items-center justify-center flex-shrink-0 transition-all">
                {playingTrack === track.id ? <HiPause className="w-4 h-4 text-pink-400" /> : <HiPlay className="w-4 h-4 text-white/60" />}
              </button>
              <audio ref={(el) => { audioRefs.current[track.id] = el; }}
                src={track.audioUrl} preload="none"
                onEnded={() => setPlayingTrack(null)} />
              <div className="flex-1 min-w-0">
                <span className="text-white/80 text-sm">{i + 1}.</span>
                <span className="text-white font-medium ml-2">{track.title}</span>
                {track.featured && <span className="text-pink-400 text-sm ml-1">ft. {track.featured}</span>}
              </div>
              <span className="text-white/30 text-xs">{track.duration}</span>
              <span className="text-white/20 text-xs">{formatViews(trackViews[track.id] || getViews(track.id))} plays</span>
              {track.price && (
                <PayNowButton variant="green" size="sm" amount={track.price} itemName={track.title}
                  description={`${album.title} - ${track.title}`}>
                  ${track.price}
                </PayNowButton>
              )}
            </motion.div>
          ))}
        </div>

        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h3 className="text-white font-bold text-lg">Stream on your platform</h3>
              <p className="text-white/40 text-sm">Listen on Spotify, Apple Music, SoundCloud & more</p>
            </div>
            <div className="flex gap-3">
              {album.streamUrls.spotify && (
                <a href={album.streamUrls.spotify} target="_blank" rel="noopener noreferrer"
                  className="px-4 py-2 rounded-full bg-green-500/20 text-green-400 text-sm hover:bg-green-500/30 transition-colors">
                  Spotify
                </a>
              )}
              {album.streamUrls.appleMusic && (
                <a href={album.streamUrls.appleMusic} target="_blank" rel="noopener noreferrer"
                  className="px-4 py-2 rounded-full bg-white/10 text-white/70 text-sm hover:bg-white/20 transition-colors">
                  Apple Music
                </a>
              )}
              {album.streamUrls.soundcloud && (
                <a href={album.streamUrls.soundcloud} target="_blank" rel="noopener noreferrer"
                  className="px-4 py-2 rounded-full bg-orange-500/20 text-orange-400 text-sm hover:bg-orange-500/30 transition-colors">
                  SoundCloud
                </a>
              )}
              {album.streamUrls.youtube && (
                <a href={album.streamUrls.youtube} target="_blank" rel="noopener noreferrer"
                  className="px-4 py-2 rounded-full bg-red-500/20 text-red-400 text-sm hover:bg-red-500/30 transition-colors">
                  YouTube
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}