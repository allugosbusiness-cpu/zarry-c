"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePlayerStore } from "@/lib/store";
import { HiPlay, HiPause, HiHeart, HiShare, HiShoppingCart, HiQueueList, HiSpeakerWave, HiSpeakerXMark, HiChevronUp, HiChevronDown } from "react-icons/hi2";
import { IconButton } from "@/components/ui/button";

export function MiniPlayer() {
  const { currentTrack, isPlaying, volume, queue, queueOpen, play, pause, resume, setVolume, addToQueue, removeFromQueue, next, toggleQueue, closeQueue } = usePlayerStore();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showVolume, setShowVolume] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying && currentTrack) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleTime = () => {
      setCurrentTime(audio.currentTime);
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
    };
    const handleMeta = () => setDuration(audio.duration);
    const handleEnd = () => next();
    audio.addEventListener("timeupdate", handleTime);
    audio.addEventListener("loadedmetadata", handleMeta);
    audio.addEventListener("ended", handleEnd);
    return () => {
      audio.removeEventListener("timeupdate", handleTime);
      audio.removeEventListener("loadedmetadata", handleMeta);
      audio.removeEventListener("ended", handleEnd);
    };
  }, [currentTrack]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    if (isPlaying) pause();
    else if (currentTrack) resume();
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  if (!currentTrack) return null;

  return (
    <>
      <audio ref={audioRef} src={currentTrack.audioUrl} preload="auto" />
      
      {/* Mini Player Bar */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 z-40"
      >
        <div className="bg-black/90 backdrop-blur-2xl border-t border-white/10 px-4 py-2">
          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/10 cursor-pointer group"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const pct = x / rect.width;
              if (audioRef.current) {
                audioRef.current.currentTime = pct * audioRef.current.duration;
              }
            }}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-pink-500 to-pink-400 relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-pink-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          </div>

          <div className="flex items-center justify-between gap-4 pt-1">
            {/* Track Info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-[linear-gradient(135deg,#FF4DA6,#FF1493)]/30 flex-shrink-0 flex items-center justify-center">
                <span className="text-white font-bold text-xs">JZ</span>
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-medium truncate">{currentTrack.title}</p>
                <p className="text-white/40 text-xs truncate">{currentTrack.artist}</p>
              </div>
              <div className="hidden sm:flex items-center gap-1 ml-2">
                <IconButton size="sm"><HiHeart className="w-3.5 h-3.5" /></IconButton>
                <IconButton size="sm"><HiShare className="w-3.5 h-3.5" /></IconButton>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <span className="text-white/40 text-xs tabular-nums hidden sm:block">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
              <IconButton onClick={togglePlay} size="md" variant="ghost">
                {isPlaying ? <HiPause className="w-5 h-5" /> : <HiPlay className="w-5 h-5" />}
              </IconButton>
              <IconButton onClick={() => setShowVolume(!showVolume)} size="sm" variant="ghost" className="hidden sm:flex">
                {volume === 0 ? <HiSpeakerXMark className="w-4 h-4" /> : <HiSpeakerWave className="w-4 h-4" />}
              </IconButton>
              <IconButton onClick={toggleQueue} size="sm" variant="ghost" className="relative">
                <HiQueueList className="w-4 h-4" />
                {queue.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-pink-500 rounded-full text-[8px] font-bold flex items-center justify-center">
                    {queue.length}
                  </span>
                )}
              </IconButton>
              <IconButton onClick={() => setExpanded(!expanded)} size="sm" variant="ghost" className="hidden sm:flex">
                {expanded ? <HiChevronDown className="w-4 h-4" /> : <HiChevronUp className="w-4 h-4" />}
              </IconButton>
            </div>
          </div>

          {/* Volume Slider */}
          <AnimatePresence>
            {showVolume && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full left-4 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl p-3 mb-2"
              >
                <div className="flex items-center gap-2">
                  <HiSpeakerXMark className="w-4 h-4 text-white/60" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-24 accent-pink-500"
                  />
                  <HiSpeakerWave className="w-4 h-4 text-white/60" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Queue */}
        <AnimatePresence>
          {queueOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-black/90 backdrop-blur-xl border-t border-white/5 max-h-60 overflow-y-auto"
            >
              <div className="px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white text-sm font-semibold">Queue ({queue.length})</h3>
                  <button onClick={() => removeFromQueue("all")} className="text-white/40 text-xs hover:text-white transition-colors">Clear</button>
                </div>
                {queue.length === 0 ? (
                  <p className="text-white/30 text-sm py-4 text-center">Queue is empty</p>
                ) : (
                  <div className="space-y-1">
                    {queue.map((track, i) => (
                      <div key={track.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-white/5 group">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-white/30 text-xs w-4">{i + 1}</span>
                          <div className="min-w-0">
                            <p className="text-white text-sm truncate">{track.title}</p>
                            <p className="text-white/40 text-xs truncate">{track.artist}</p>
                          </div>
                        </div>
                        <button onClick={() => removeFromQueue(track.id)} className="text-white/30 hover:text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}