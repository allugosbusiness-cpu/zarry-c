"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { PayNowButton } from "@/components/ui/paynow-button";
import { getViews, incrementViews, formatViews } from "@/lib/view-tracker";
import { HiArrowLeft, HiPlay, HiPause, HiShoppingCart, HiArrowDownTray, HiLockClosed, HiCheck } from "react-icons/hi2";

// Fallback beats when Firestore is unavailable
import { beats as staticBeats } from "@/data/site-data";

interface Beat {
  id: string;
  title: string;
  bpm: number;
  key: string;
  genre: string[];
  mood: string[];
  tags: string[];
  duration: string;
  previewUrl: string;
  audioUrl: string;
  plays: number;
  price: number;
  sold: boolean;
  downloadUrl: string;
}

// Marketing sample beats shown in "Sold" section — social proof
const sampleSoldBeats: Beat[] = [
  {
    id: "sample-sold-1",
    title: "Midnight Dreams",
    bpm: 134,
    key: "Cm",
    genre: ["Trap"],
    mood: ["Dark"],
    tags: ["808", "synth", "dark piano"],
    duration: "3:30",
    previewUrl: "",
    audioUrl: "",
    plays: 3200,
    price: 5,
    sold: true,
    downloadUrl: "",
  },
  {
    id: "sample-sold-2",
    title: "Golden Hour",
    bpm: 96,
    key: "G",
    genre: ["R&B"],
    mood: ["Chill"],
    tags: ["keys", "warm", "vinyl"],
    duration: "3:15",
    previewUrl: "",
    audioUrl: "",
    plays: 4100,
    price: 5,
    sold: true,
    downloadUrl: "",
  },
  {
    id: "sample-sold-3",
    title: "Bass Revolution",
    bpm: 150,
    key: "D#m",
    genre: ["Electronic"],
    mood: ["Energetic"],
    tags: ["heavy bass", "synthwave", "arpeggios"],
    duration: "4:00",
    previewUrl: "",
    audioUrl: "",
    plays: 5600,
    price: 5,
    sold: true,
    downloadUrl: "",
  },
  {
    id: "sample-sold-4",
    title: "Velvet Sky",
    bpm: 88,
    key: "Fm",
    genre: ["Lo-fi", "R&B"],
    mood: ["Dreamy"],
    tags: ["lofi", "chords", "soft drums"],
    duration: "3:45",
    previewUrl: "",
    audioUrl: "",
    plays: 2800,
    price: 5,
    sold: true,
    downloadUrl: "",
  },
  {
    id: "sample-sold-5",
    title: "Thunder Clap",
    bpm: 145,
    key: "Am",
    genre: ["Trap", "Dark"],
    mood: ["Aggressive"],
    tags: ["808s", "brass", "orchestral"],
    duration: "3:20",
    previewUrl: "",
    audioUrl: "",
    plays: 4900,
    price: 5,
    sold: true,
    downloadUrl: "",
  },
  {
    id: "sample-sold-6",
    title: "Ocean Waves",
    bpm: 100,
    key: "C",
    genre: ["Afrobeat", "Dance"],
    mood: ["Uplifting"],
    tags: ["afro drums", "percussion", "melodic"],
    duration: "4:10",
    previewUrl: "",
    audioUrl: "",
    plays: 3600,
    price: 5,
    sold: true,
    downloadUrl: "",
  },
  {
    id: "sample-sold-7",
    title: "Neon Lights",
    bpm: 126,
    key: "Dm",
    genre: ["Synthwave", "Electronic"],
    mood: ["Retro"],
    tags: ["synth", "80s", "reverb"],
    duration: "3:55",
    previewUrl: "",
    audioUrl: "",
    plays: 2100,
    price: 5,
    sold: true,
    downloadUrl: "",
  },
  {
    id: "sample-sold-8",
    title: "Crown Me",
    bpm: 108,
    key: "Bb",
    genre: ["Hip-hop", "Boom Bap"],
    mood: ["Confident"],
    tags: ["boom bap", "sample", "bass"],
    duration: "3:25",
    previewUrl: "",
    audioUrl: "",
    plays: 6100,
    price: 5,
    sold: true,
    downloadUrl: "",
  },
  {
    id: "sample-sold-9",
    title: "Soul Kitchen",
    bpm: 92,
    key: "Ebm",
    genre: ["R&B", "Soul"],
    mood: ["Smooth"],
    tags: ["soul", "keys", "groove"],
    duration: "4:05",
    previewUrl: "",
    audioUrl: "",
    plays: 3300,
    price: 5,
    sold: true,
    downloadUrl: "",
  },
  {
    id: "sample-sold-10",
    title: "War Cry",
    bpm: 140,
    key: "F#m",
    genre: ["Trap", "Cinematic"],
    mood: ["Epic"],
    tags: ["cinematic", "strings", "brass"],
    duration: "3:50",
    previewUrl: "",
    audioUrl: "",
    plays: 7200,
    price: 5,
    sold: true,
    downloadUrl: "",
  },
];

export default function BeatsPage() {
  const [beats, setBeats] = useState<Beat[]>(staticBeats);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [purchasedIds, setPurchasedIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});

  // Fetch beats from Firestore (where admin uploads go)
  useEffect(() => {
    async function fetchBeats() {
      try {
        const { db } = await import("@/lib/firebase/config");
        const { collection, getDocs, query } = await import("firebase/firestore");
        const snap = await getDocs(query(collection(db, "beats")));
        const firestoreBeats = snap.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || "Untitled",
            bpm: data.bpm || 0,
            key: data.key || "Am",
            genre: data.genre || [],
            mood: data.mood || [],
            tags: data.tags || [],
            duration: data.duration || "0:00",
            previewUrl: data.previewUrl || data.audioUrl || "",
            audioUrl: data.audioUrl || "",
            plays: data.plays || 0,
            price: data.price || 5,
            sold: data.sold || false,
            downloadUrl: data.downloadUrl || data.audioUrl || "",
          } as Beat;
        });

        if (firestoreBeats.length > 0) {
          setBeats(firestoreBeats);
        }
      } catch (e) {
        console.warn("[Beats] Failed to fetch from Firestore, using static data:", e);
      }
      setLoading(false);
    }
    fetchBeats();
  }, []);

  const [durationMap, setDurationMap] = useState<Record<string, string>>({});

  // Initialize view counts for all beats on load
  useEffect(() => {
    if (!loading) {
      const counts: Record<string, number> = {};
      beats.forEach(beat => {
        counts[beat.id] = getViews(beat.id);
      });
      setViewCounts(counts);
    }
  }, [loading, beats]);

  const togglePreview = (beatId: string) => {
    const audioEl = audioRefs.current[beatId];
    if (!audioEl) return;

    if (playingId === beatId) {
      audioEl.pause();
      setPlayingId(null);
    } else {
      if (playingId) {
        const prev = audioRefs.current[playingId];
        if (prev) prev.pause();
      }
      
      // If duration is 0:00 but audio has loaded, read real duration
      const beat = beats.find(b => b.id === beatId);
      if (beat && beat.duration === "0:00" && audioEl.duration && isFinite(audioEl.duration)) {
        const mins = Math.floor(audioEl.duration / 60);
        const secs = Math.floor(audioEl.duration % 60);
        const realDuration = `${mins}:${secs.toString().padStart(2, '0')}`;
        setDurationMap(prev => ({ ...prev, [beatId]: realDuration }));
      }
      
      // Increment view count when playing
      const newViews = incrementViews(beatId);
      setViewCounts(prev => ({ ...prev, [beatId]: newViews }));
      
      // Use server-side audio proxy for Firebase Storage files
      audioEl.currentTime = 0;
      audioEl.play().catch((err) => {
        console.warn("[Beats] Audio play failed:", err);
        setError("Could not play preview. Audio may still be processing.");
        setTimeout(() => setError(null), 3000);
      });
      setPlayingId(beatId);
    }
  };

  const handlePurchaseSuccess = (beatId: string) => {
    setPurchasedIds((prev) => [...prev, beatId]);
    const beat = beats.find((b) => b.id === beatId);
    if (beat) {
      const a = document.createElement("a");
      a.href = beat.downloadUrl;
      a.download = `${beat.title.replace(/\s+/g, "-")}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // Filter out sold beats for main listing
  const availableBeats = beats.filter((b) => !b.sold);
  // Sold beats from Firestore + marketing samples
  const soldBeats = [...beats.filter((b) => b.sold), ...sampleSoldBeats];

  return (
    <div className="min-h-screen bg-dark-950 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-6 transition-colors"><HiArrowLeft className="w-4 h-4" /> Back</Link>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">Producer Beats</h1>
          <p className="text-white/40 text-lg max-w-xl">All Rights — $5 each. Preview before you buy. Instant download.</p>
        </motion.div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
          {[
            { label: "Beats Available", value: availableBeats.length },
            { label: "Total Plays", value: availableBeats.reduce((s, b) => s + (viewCounts[b.id] || getViews(b.id)), 0).toLocaleString() },
            { label: "Price", value: "$5 All Rights" },
            { label: "Sold", value: soldBeats.length },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-dark-800/50 border border-white/5 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-white/40 text-xs">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4">
              {availableBeats.map((beat, i) => {
                const isPurchased = purchasedIds.includes(beat.id);
                return (
                  <motion.div key={beat.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="bg-dark-800/50 border border-white/5 rounded-xl p-5 hover:bg-dark-800 transition-all">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <button onClick={() => togglePreview(beat.id)}
                          className="w-12 h-12 rounded-full bg-white/5 hover:bg-pink-500/20 flex items-center justify-center flex-shrink-0 transition-all">
                          {playingId === beat.id ? <HiPause className="w-5 h-5 text-pink-400" /> : <HiPlay className="w-5 h-5 text-white/60" />}
                        </button>
                        <div className="min-w-0">
                          <h3 className="text-white font-semibold text-lg">{beat.title}</h3>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-white/40 mt-0.5">
                            <span>{beat.bpm} BPM</span><span>·</span><span>{beat.key}</span><span>·</span><span>{durationMap[beat.id] || beat.duration || "0:00"}</span><span>·</span><span>{formatViews(viewCounts[beat.id] || getViews(beat.id))} plays</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {(beat.tags || []).slice(0, 4).map(tag => (
                              <span key={tag} className="px-2 py-0.5 rounded-full bg-white/5 text-white/30 text-[10px]">{tag}</span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {isPurchased ? (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 text-green-400 text-sm font-semibold">
                          <HiCheck className="w-4 h-4" /> Downloaded
                        </div>
                      ) : (
                        <PayNowButton
                          variant="green"
                          size="md"
                          amount={beat.price || 5}
                          itemName={`${beat.title} - All Rights`}
                          description={`All Rights - ${beat.title} (${beat.bpm}BPM ${beat.key})`}
                          icon={<HiShoppingCart className="w-4 h-4" />}
                          onSuccess={() => handlePurchaseSuccess(beat.id)}
                        >
                          Buy All Rights ${beat.price || 5}
                        </PayNowButton>
                      )}
                    </div>

                    {/* Audio preview player - uses server proxy for Firebase Storage files */}
                    {beat.previewUrl && (
                      <audio ref={(el) => { audioRefs.current[beat.id] = el; }}
                        src={beat.previewUrl.startsWith("https://firebasestorage.googleapis.com/") 
                          ? `/api/audio?url=${encodeURIComponent(beat.previewUrl)}`
                          : beat.previewUrl
                        } preload="none"
                        onEnded={() => setPlayingId(null)}
                        onError={() => console.warn("[Beats] Audio failed to load:", beat.previewUrl)} />
                    )}

                    {playingId === beat.id && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 40 }} className="mt-4">
                        <div className="h-10 rounded-lg bg-white/5 flex items-center justify-center overflow-hidden">
                          <div className="flex items-center gap-0.5 h-full w-full px-2">
                            {Array.from({ length: 80 }).map((_, i) => (
                              <motion.div key={i}
                                animate={{ height: [10 + Math.random() * 30, 15 + Math.random() * 35, 10 + Math.random() * 30] }}
                                transition={{ duration: 1.5 + Math.random(), repeat: Infinity, delay: i * 0.03 }}
                                className="w-1 bg-pink-400/50 rounded-full" style={{ height: 20 }} />
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}

              {availableBeats.length === 0 && (
                <div className="text-center py-20 text-white/40">
                  <HiMusicalNote className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p className="text-lg">No beats available yet</p>
                  <p className="text-sm mt-1">Check back soon for new releases!</p>
                </div>
              )}
            </div>

            {/* Sold Out / Marketing section */}
            {soldBeats.length > 0 && (
              <div className="mt-16">
                <h2 className="text-xl font-semibold text-white/40 mb-4">Sold Out (Previously Released)</h2>
                <p className="text-white/20 text-sm mb-6">These beats have been sold. New beats drop regularly — stay tuned!</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 opacity-60">
                  {soldBeats.map((beat) => (
                    <div key={beat.id} className="bg-dark-800/30 border border-white/5 rounded-xl p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-dark-700 flex items-center justify-center flex-shrink-0">
                          <HiLockClosed className="w-4 h-4 text-white/30" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-white/50 font-semibold text-sm truncate">{beat.title}</h3>
                          <p className="text-white/20 text-xs">{beat.bpm} BPM · {beat.key}</p>
                        </div>
                        <span className="ml-auto px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-[10px] font-medium">Sold</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(beat.tags || []).slice(0, 3).map(tag => (
                          <span key={tag} className="px-2 py-0.5 rounded-full bg-white/5 text-white/20 text-[10px]">{tag}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function HiMusicalNote({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
    </svg>
  );
}