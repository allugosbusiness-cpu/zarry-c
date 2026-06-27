"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HiArrowLeft, HiMusicalNote, HiCheck, HiPlay, HiBeaker, HiShoppingBag, HiCalendarDays, HiFilm, HiMicrophone, HiPlus, HiPencil, HiTrash, HiEye, HiPhoto } from "react-icons/hi2";
import { HiCloudUpload as HiUpload, HiCollection, HiRefresh } from "react-icons/hi";
import toast from "react-hot-toast";

type AdminTab = "beats" | "merch" | "tours" | "videos" | "singles" | "albums";
type ViewMode = "add" | "manage";

const tabs: { id: AdminTab; label: string; icon: React.ElementType }[] = [
  { id: "beats", label: "Beats", icon: HiBeaker },
  { id: "merch", label: "Merch", icon: HiShoppingBag },
  { id: "tours", label: "Tour Dates", icon: HiCalendarDays },
  { id: "videos", label: "Music Videos", icon: HiFilm },
  { id: "singles", label: "Singles", icon: HiMicrophone },
  { id: "albums", label: "Albums/EPs", icon: HiCollection },
];

// ======================== UTILITY ========================
/** Upload file via server-side proxy to avoid Firebase CORS issues */
async function uploadFile(file: File, path: string): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("path", path);
  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  if (!data.success || !data.url) {
    throw new Error(data.error || data.details || "Upload failed");
  }
  return data.url;
}

async function saveToFirestore(collectionName: string, data: any) {
  const { db } = await import("@/lib/firebase/config");
  const { collection, addDoc, serverTimestamp } = await import("firebase/firestore");
  return addDoc(collection(db, collectionName), { ...data, createdAt: serverTimestamp() });
}

async function updateFirestoreDoc(collectionName: string, docId: string, data: any) {
  const { db } = await import("@/lib/firebase/config");
  const { doc, updateDoc } = await import("firebase/firestore");
  await updateDoc(doc(db, collectionName, docId), { ...data, updatedAt: new Date().toISOString() });
}

async function deleteFirestoreDoc(collectionName: string, docId: string) {
  const { db } = await import("@/lib/firebase/config");
  const { doc, deleteDoc } = await import("firebase/firestore");
  await deleteDoc(doc(db, collectionName, docId));
}

async function fetchCollection(collectionName: string) {
  const { db } = await import("@/lib/firebase/config");
  const { collection, getDocs, query, orderBy } = await import("firebase/firestore");
  const snap = await getDocs(query(collection(db, collectionName)));
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function notifySubscribers(type: string, title: string, message: string, link: string) {
  try {
    await fetch("/api/notifications/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, title, message, link }),
    });
  } catch (e) { /* silent */ }
}

function SuccessScreen({ title, subtitle, onReset }: { title: string; subtitle: string; onReset: () => void }) {
  return (
    <div className="min-h-screen bg-dark-950 pt-24 pb-20 flex items-center justify-center">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-lg mx-auto px-4">
        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 3, repeat: Infinity }}
          className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6"
        >
          <HiCheck className="w-10 h-10 text-green-400" />
        </motion.div>
        <h2 className="text-3xl font-bold text-white mb-4">{title}</h2>
        <p className="text-white/50 mb-8">{subtitle}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button variant="pink" onClick={onReset}>Add Another</Button>
          <Link href="/"><Button variant="outline">Home</Button></Link>
        </div>
      </motion.div>
    </div>
  );
}

// ======================== MAIN PAGE ========================
export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("beats");
  const [viewMode, setViewMode] = useState<ViewMode>("add");
  const [success, setSuccess] = useState<{ title: string; subtitle: string } | null>(null);

  if (success) {
    return <SuccessScreen title={success.title} subtitle={success.subtitle} onReset={() => setSuccess(null)} />;
  }

  return (
    <div className="min-h-screen bg-dark-950 pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-6 transition-colors"><HiArrowLeft className="w-4 h-4" /> Back</Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <HiMusicalNote className="w-8 h-8 text-pink-400" />
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-white/40 text-sm">{viewMode === "add" ? "Add new content" : "Edit existing content"}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setViewMode("add")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${viewMode === "add" ? "bg-pink-500/20 text-pink-400 border border-pink-500/30" : "bg-white/5 text-white/50 hover:text-white border border-transparent"}`}
              ><HiPlus className="w-4 h-4 inline mr-1" />Add</button>
              <button onClick={() => setViewMode("manage")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${viewMode === "manage" ? "bg-pink-500/20 text-pink-400 border border-pink-500/30" : "bg-white/5 text-white/50 hover:text-white border border-transparent"}`}
              ><HiPencil className="w-4 h-4 inline mr-1" />Edit Existing</button>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-wrap gap-2 mb-10">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-pink-500/20 text-pink-400 border border-pink-500/30"
                  : "bg-white/5 text-white/50 hover:text-white hover:bg-white/10 border border-transparent"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={`${activeTab}-${viewMode}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {viewMode === "add" ? (
              <>
                {activeTab === "beats" && <BeatForm onSuccess={(t, s) => setSuccess({ title: t, subtitle: s })} />}
                {activeTab === "merch" && <MerchForm onSuccess={(t, s) => setSuccess({ title: t, subtitle: s })} />}
                {activeTab === "tours" && <TourForm onSuccess={(t, s) => setSuccess({ title: t, subtitle: s })} />}
                {activeTab === "videos" && <VideoForm onSuccess={(t, s) => setSuccess({ title: t, subtitle: s })} />}
                {activeTab === "singles" && <SingleForm onSuccess={(t, s) => setSuccess({ title: t, subtitle: s })} />}
                {activeTab === "albums" && <AlbumForm onSuccess={(t, s) => setSuccess({ title: t, subtitle: s })} />}
              </>
            ) : (
              <ManageView tab={activeTab} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ======================== MANAGE VIEW ========================
const collections: Record<AdminTab, string> = {
  beats: "beats", merch: "merch", tours: "tourDates", videos: "videos", singles: "music", albums: "music",
};

function ManageView({ tab }: { tab: AdminTab }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [newCoverFile, setNewCoverFile] = useState<File | null>(null);

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await fetchCollection(collections[tab]);
      if (tab === "albums") {
        setItems(data.filter((i: any) => i.type === "album" || i.type === "ep"));
      } else if (tab === "singles") {
        setItems(data.filter((i: any) => i.type === "single"));
      } else {
        setItems(data);
      }
    } catch (e) {
      toast.error("Failed to load items");
    }
    setLoading(false);
  };

  useEffect(() => { loadItems(); }, [tab]);

  const startEdit = (item: any) => {
    setEditingId(item.id);
    setEditData({ ...item });
    setNewCoverFile(null);
  };

  const handleSave = async () => {
    if (!editingId) return;
    try {
      let updatedData = { ...editData };

      // Upload new cover if changed
      if (newCoverFile) {
        const url = await uploadFile(newCoverFile, `${collections[tab]}/covers`);
        updatedData.cover = url;
        updatedData.thumbnail = url;
        updatedData.images = [url];
      }

      await updateFirestoreDoc(collections[tab], editingId, updatedData);
      toast.success("Updated successfully!");
      setEditingId(null);
      loadItems();
    } catch (e: any) {
      toast.error(e.message || "Update failed");
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title || id}"? This cannot be undone.`)) return;
    try {
      await deleteFirestoreDoc(collections[tab], id);
      toast.success("Deleted");
      loadItems();
    } catch (e: any) {
      toast.error(e.message || "Delete failed");
    }
  };

  const renderField = (key: string, value: any) => {
    if (key === "id" || key === "createdAt" || key === "updatedAt" || key === "licenses" || key === "tracks" || key === "streamUrls" || key === "terms" || key.startsWith("_")) return null;

    if (key === "sizes" || key === "colors" || key === "genre" || key === "category" || key === "mood" || key === "tags") {
      return (
        <div key={key} className="col-span-2">
          <label className="text-white/40 text-xs capitalize">{key}</label>
          <input value={Array.isArray(value) ? value.join(", ") : value || ""}
            onChange={e => setEditData({ ...editData, [key]: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean) })}
            className="w-full px-3 py-2 rounded-lg bg-dark-900/50 border border-white/10 text-white text-sm"
          />
        </div>
      );
    }

    if (key === "description" || key === "credits" || key === "bio") {
      return (
        <div key={key} className="col-span-2">
          <label className="text-white/40 text-xs capitalize">{key}</label>
          <textarea value={value || ""} onChange={e => setEditData({ ...editData, [key]: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-dark-900/50 border border-white/10 text-white text-sm h-16"
          />
        </div>
      );
    }

    if (key === "cover" || key === "thumbnail" || key === "images" || key === "coverUrl") {
      const imgSrc = Array.isArray(value) ? value[0] : value;
      return (
        <div key={key} className="col-span-2">
          <label className="text-white/40 text-xs capitalize">Cover / Image</label>
          <div className="flex items-center gap-3">
            {imgSrc && <img src={imgSrc} alt="" className="w-12 h-12 rounded-lg object-cover" />}
            <label className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 text-sm cursor-pointer hover:bg-white/10">
              <HiPhoto className="w-4 h-4 inline mr-1" />Change
              <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) setNewCoverFile(f); }} />
            </label>
            {newCoverFile && <span className="text-green-400 text-xs">New: {newCoverFile.name}</span>}
          </div>
        </div>
      );
    }

    return (
      <div key={key}>
        <label className="text-white/40 text-xs capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
        <input value={value ?? ""} onChange={e => setEditData({ ...editData, [key]: e.target.value })}
          className="w-full px-3 py-2 rounded-lg bg-dark-900/50 border border-white/10 text-white text-sm"
        />
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Manage {tabs.find(t => t.id === tab)?.label}</h2>
        <button onClick={loadItems} className="text-white/40 hover:text-white text-sm flex items-center gap-1">
          <HiRefresh className="w-4 h-4" /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-white/40">No {tab} found. Add some first.</div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <motion.div key={item.id} layout
              className="bg-dark-800/50 border border-white/5 rounded-xl overflow-hidden"
            >
              {/* Summary Row */}
              <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5"
                onClick={() => setEditingId(editingId === item.id ? null : item.id)}
              >
                <div className="flex items-center gap-3">
                  {(item.cover || item.thumbnail || item.images?.[0]) && (
                    <img src={item.cover || item.thumbnail || item.images?.[0]} alt="" className="w-10 h-10 rounded-lg object-cover" />
                  )}
                  <div>
                    <p className="text-white font-medium">{item.title || item.name || item.city || "Untitled"}</p>
                    <p className="text-white/30 text-xs">
                      {item.bpm && `${item.bpm} BPM · ${item.key}`}
                      {item.price && `$${item.price}`}
                      {item.venue && `${item.venue}, ${item.country || "Zimbabwe"}`}
                      {item.type && item.type}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <HiPencil className="w-4 h-4 text-white/30" />
                  <button onClick={e => { e.stopPropagation(); handleDelete(item.id, item.title || item.name); }}
                    className="text-red-400/50 hover:text-red-400 p-1"
                  ><HiTrash className="w-4 h-4" /></button>
                </div>
              </div>

              {/* Edit Panel */}
              <AnimatePresence>
                {editingId === item.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="border-t border-white/5 px-4 py-4 overflow-hidden"
                  >
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {Object.entries(editData).map(([k, v]) => renderField(k, v))}
                    </div>
                    <div className="flex items-center gap-3">
                      <Button variant="pink" size="sm" onClick={handleSave}>Save Changes</Button>
                      <Button variant="outline" size="sm" onClick={() => setEditingId(null)}>Cancel</Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ======================== ADD FORMS ========================
function BeatForm({ onSuccess }: { onSuccess: (t: string, s: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState(""); const [bpm, setBpm] = useState("");
  const [key, setKey] = useState("Am"); const [genre, setGenre] = useState("Hip-hop");
  const [tags, setTags] = useState(""); const [mood, setMood] = useState(""); const [price, setPrice] = useState("5");
  const [duration, setDuration] = useState("0:00");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);
  const genres = ["Hip-hop", "Trap", "R&B", "Afrobeat", "Lo-fi", "Electronic", "Boom Bap", "Dance", "Synthwave", "Dark", "Other"];
  const keys = ["Am","Cm","Dm","Em","Fm","Gm","Bm","C","D","E","F","G","A","B","Bb","D#m","F#m","G#m"];

  const handleAudio = (f: File) => { 
    if (f.type.startsWith("audio/")) { 
      setAudioFile(f); 
      setAudioPreview(URL.createObjectURL(f));
      // Calculate duration from the audio file
      const audio = new Audio();
      audio.preload = "metadata";
      audio.onloadedmetadata = () => {
        const mins = Math.floor(audio.duration / 60);
        const secs = Math.floor(audio.duration % 60);
        setDuration(`${mins}:${secs.toString().padStart(2, '0')}`);
        URL.revokeObjectURL(audio.src);
      };
      audio.src = URL.createObjectURL(f);
    } else toast.error("Audio file required"); 
  };
  const handleCover = (f: File) => { if (f.type.startsWith("image/")) setCoverFile(f); else toast.error("Image file required"); };

  const handleSubmit = async () => {
    if (!audioFile || !title.trim() || !bpm) { toast.error("Title, BPM, and audio are required"); return; }
    setUploading(true);
    try {
      const audioUrl = await uploadFile(audioFile, "beats");
      let coverUrl = "";
      if (coverFile) coverUrl = await uploadFile(coverFile, "beats/covers");
      const tagList = tags.split(",").map(t => t.trim()).filter(Boolean);
      const p = Number(price) || 5;
      await saveToFirestore("beats", {
        title: title.trim(), bpm: Number(bpm), key, genre: [genre], mood: mood ? [mood] : [], tags: tagList,
        duration, previewUrl: audioUrl, audioUrl, plays: 399, price: p, coverUrl, published: true,
        licenses: [
          { type: "basic", name: "Basic Lease", price: p },
          { type: "premium", name: "Premium Lease", price: p * 3 },
          { type: "exclusive", name: "Exclusive Rights", price: p * 10 },
        ],
      });
      await notifySubscribers("beat-drop", `🎵 New Beat: ${title.trim()}`, `"${title.trim()}" available!`, "/beats");
      onSuccess("Beat Uploaded! 🎉", `"${title.trim()}" has been added.`);
    } catch (e: any) { toast.error(e.message); }
    finally { setUploading(false); }
  };

  return (
    <div className="max-w-2xl space-y-5">
      <h2 className="text-xl font-bold text-white">Upload a Beat</h2>
      <motion.div onDragOver={e=>e.preventDefault()} onDrop={e=>{ e.preventDefault(); handleAudio(e.dataTransfer.files[0]); }}
        onClick={() => fileRef.current?.click()}
        className={`p-8 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all ${audioFile ? "bg-green-500/5 border-green-500/30" : "bg-dark-800/50 border-white/10 hover:border-pink-500/30"}`}>
        <input ref={fileRef} type="file" accept="audio/*" className="hidden" onChange={e => e.target.files?.[0] && handleAudio(e.target.files[0])} />
        {audioFile ? (
          <div className="flex flex-col items-center gap-2">
            <HiCheck className="w-8 h-8 text-green-400" />
            <p className="text-white font-medium">{audioFile.name}</p>
            {audioPreview && <audio src={audioPreview} controls className="h-8 mt-1" />}
            <button onClick={e=>{ e.stopPropagation(); setAudioFile(null); }} className="text-xs text-red-400 underline">Remove</button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <HiUpload className="w-8 h-8 text-white/30" />
            <p className="text-white/60">Drop beat audio or click to browse</p>
          </div>
        )}
      </motion.div>
      <div onClick={() => coverRef.current?.click()} className="p-4 rounded-xl border border-dashed border-white/10 text-center cursor-pointer hover:border-white/20 bg-dark-800/30">
        <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleCover(e.target.files[0])} />
        <p className="text-white/40 text-sm flex items-center justify-center gap-2"><HiUpload className="w-4 h-4" />{coverFile ? coverFile.name : "Add cover art (optional)"}</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <input placeholder="Title *" value={title} onChange={e=>setTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-dark-900/50 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-pink-500/50" />
        <input type="number" placeholder="BPM *" value={bpm} onChange={e=>setBpm(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-dark-900/50 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-pink-500/50" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <select value={key} onChange={e=>setKey(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-dark-900/50 border border-white/10 text-white">{keys.map(k=><option key={k}>{k}</option>)}</select>
        <select value={genre} onChange={e=>setGenre(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-dark-900/50 border border-white/10 text-white">{genres.map(g=><option key={g}>{g}</option>)}</select>
        <input type="number" min="1" placeholder="Price $" value={price} onChange={e=>setPrice(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-dark-900/50 border border-white/10 text-white" />
      </div>
      <input placeholder="Tags (comma separated)" value={tags} onChange={e=>setTags(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-dark-900/50 border border-white/10 text-white placeholder:text-white/20" />
      <Button variant="pink" fullWidth size="lg" loading={uploading} onClick={handleSubmit} icon={<HiUpload className="w-5 h-5" />}>{uploading ? "Uploading..." : "Upload Beat"}</Button>
    </div>
  );
}

function MerchForm({ onSuccess }: { onSuccess: (t: string, s: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState(""); const [price, setPrice] = useState(""); const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("clothing"); const [sizes, setSizes] = useState("");
  const [colors, setColors] = useState(""); const [limited, setLimited] = useState(false);
  const [limitedCount, setLimitedCount] = useState(""); const [imageFile, setImageFile] = useState<File | null>(null);
  const imgRef = useRef<HTMLInputElement>(null);
  const categories = ["clothing","accessories","vinyl","poster","bundle"];

  const handleSubmit = async () => {
    if (!imageFile || !name.trim() || !price) { toast.error("Image, name, and price required"); return; }
    setUploading(true);
    try {
      const imgUrl = await uploadFile(imageFile, "merch");
      await saveToFirestore("merch", {
        name: name.trim(), price: Number(price), description: desc, images: [imgUrl], category,
        sizes: sizes.split(",").map(s=>s.trim()).filter(Boolean),
        colors: colors.split(",").map(c=>c.trim()).filter(Boolean),
        limited, limitedCount: limited ? Number(limitedCount) : undefined,
        hasCountdown: false, waitlistAvailable: limited,
      });
      await notifySubscribers("merch-drop", `🧢 New Merch: ${name.trim()}`, `"${name.trim()}" is in the shop!`, "/merch");
      onSuccess("Merch Added! 🧢", `"${name.trim()}" is now live.`);
    } catch (e: any) { toast.error(e.message); }
    finally { setUploading(false); }
  };

  return (
    <div className="max-w-2xl space-y-5">
      <h2 className="text-xl font-bold text-white">Add Merch Item</h2>
      <div onClick={()=>imgRef.current?.click()} className="p-6 rounded-2xl border-2 border-dashed border-white/10 text-center cursor-pointer hover:border-pink-500/30 bg-dark-800/50">
        <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={e=>e.target.files?.[0] && setImageFile(e.target.files[0])} />
        {imageFile ? <p className="text-white">{imageFile.name}</p> : <p className="text-white/40 flex items-center justify-center gap-2"><HiUpload className="w-5 h-5" />Product Image *</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <input placeholder="Product Name *" value={name} onChange={e=>setName(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-dark-900/50 border border-white/10 text-white" />
        <input type="number" placeholder="Price *" value={price} onChange={e=>setPrice(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-dark-900/50 border border-white/10 text-white" />
      </div>
      <textarea placeholder="Description" value={desc} onChange={e=>setDesc(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-dark-900/50 border border-white/10 text-white h-20" />
      <div className="grid grid-cols-2 gap-4">
        <select value={category} onChange={e=>setCategory(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-dark-900/50 border border-white/10 text-white">{categories.map(c=><option key={c}>{c}</option>)}</select>
        <label className="flex items-center gap-3 text-white/70 text-sm bg-dark-900/50 p-3 rounded-xl"><input type="checkbox" checked={limited} onChange={e=>setLimited(e.target.checked)} className="accent-pink-500" /> Limited</label>
      </div>
      {limited && <input type="number" placeholder="Limited count" value={limitedCount} onChange={e=>setLimitedCount(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-dark-900/50 border border-white/10 text-white" />}
      <input placeholder="Sizes (comma: S,M,L,XL)" value={sizes} onChange={e=>setSizes(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-dark-900/50 border border-white/10 text-white" />
      <input placeholder="Colors (comma: Black,White)" value={colors} onChange={e=>setColors(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-dark-900/50 border border-white/10 text-white" />
      <Button variant="pink" fullWidth size="lg" loading={uploading} onClick={handleSubmit} icon={<HiPlus className="w-5 h-5" />}>Add Merch</Button>
    </div>
  );
}

function TourForm({ onSuccess }: { onSuccess: (t: string, s: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [city, setCity] = useState(""); const [venue, setVenue] = useState(""); const [country, setCountry] = useState("");
  const [date, setDate] = useState(""); const [ticketUrl, setTicketUrl] = useState("");
  const [vipPrice, setVipPrice] = useState(""); const [soldOut, setSoldOut] = useState(false);

  const handleSubmit = async () => {
    if (!city.trim() || !venue.trim() || !date || !ticketUrl.trim()) { toast.error("City, venue, date, and ticket URL required"); return; }
    setUploading(true);
    try {
      await saveToFirestore("tourDates", {
        city: city.trim(), venue: venue.trim(), country: country.trim() || "Zimbabwe",
        date: new Date(date).toISOString(), ticketUrl: ticketUrl.trim(),
        soldOut, vipAvailable: !!vipPrice, vipPrice: vipPrice ? Number(vipPrice) : undefined,
        meetAndGreet: true, status: "upcoming",
      });
      await notifySubscribers("tour", `🎫 New Show: ${city.trim()}`, `Zarry C at ${venue.trim()}!`, ticketUrl.trim());
      onSuccess("Tour Date Added! 🎫", `${city.trim()} added.`);
    } catch (e: any) { toast.error(e.message); }
    finally { setUploading(false); }
  };

  return (
    <div className="max-w-2xl space-y-5">
      <h2 className="text-xl font-bold text-white">Add Tour Date</h2>
      <div className="grid grid-cols-2 gap-4">
        <input placeholder="City *" value={city} onChange={e=>setCity(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-dark-900/50 border border-white/10 text-white" />
        <input placeholder="Country" value={country} onChange={e=>setCountry(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-dark-900/50 border border-white/10 text-white" />
      </div>
      <input placeholder="Venue *" value={venue} onChange={e=>setVenue(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-dark-900/50 border border-white/10 text-white" />
      <div className="grid grid-cols-2 gap-4">
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-dark-900/50 border border-white/10 text-white [color-scheme:dark]" />
        <input type="url" placeholder="Ticket URL *" value={ticketUrl} onChange={e=>setTicketUrl(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-dark-900/50 border border-white/10 text-white" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <input type="number" placeholder="VIP Price" value={vipPrice} onChange={e=>setVipPrice(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-dark-900/50 border border-white/10 text-white" />
        <label className="flex items-center gap-3 text-white/70 text-sm bg-dark-900/50 p-3 rounded-xl"><input type="checkbox" checked={soldOut} onChange={e=>setSoldOut(e.target.checked)} className="accent-pink-500" /> Sold out</label>
      </div>
      <Button variant="pink" fullWidth size="lg" loading={uploading} onClick={handleSubmit} icon={<HiCalendarDays className="w-5 h-5" />}>Add Tour Date</Button>
    </div>
  );
}

function VideoForm({ onSuccess }: { onSuccess: (t: string, s: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState(""); const [desc, setDesc] = useState("");
  const [duration, setDuration] = useState(""); const [location, setLocation] = useState("");
  const [type, setType] = useState("music-video"); const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const vidRef = useRef<HTMLInputElement>(null); const thumbRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    if (!videoFile || !title.trim()) { toast.error("Video file and title required"); return; }
    setUploading(true);
    try {
      const videoUrl = await uploadFile(videoFile, "videos");
      let thumbUrl = "";
      if (thumbFile) thumbUrl = await uploadFile(thumbFile, "videos/thumbnails");
      await saveToFirestore("videos", {
        title: title.trim(), type, videoUrl, thumbnail: thumbUrl || videoUrl,
        duration, date: new Date().toISOString(), description: desc, location, buyPrice: 1,
        category: [type === "music-video" ? "Official Video" : "Video"],
      });
      await notifySubscribers("music-release", `🎬 New Video: ${title.trim()}`, desc || "Check it out!", "/video");
      onSuccess("Video Added! 🎬", `"${title.trim()}" uploaded.`);
    } catch (e: any) { toast.error(e.message); }
    finally { setUploading(false); }
  };

  return (
    <div className="max-w-2xl space-y-5">
      <h2 className="text-xl font-bold text-white">Add Music Video</h2>
      <div onClick={()=>vidRef.current?.click()} className="p-6 rounded-2xl border-2 border-dashed border-white/10 text-center cursor-pointer hover:border-pink-500/30">
        <input ref={vidRef} type="file" accept="video/*" className="hidden" onChange={e=>e.target.files?.[0] && setVideoFile(e.target.files[0])} />
        {videoFile ? <p className="text-white">{videoFile.name}</p> : <p className="text-white/40 flex items-center justify-center gap-2"><HiUpload className="w-5 h-5" />Video File *</p>}
      </div>
      <div onClick={()=>thumbRef.current?.click()} className="p-4 rounded-xl border border-dashed border-white/10 text-center cursor-pointer hover:border-white/20">
        <input ref={thumbRef} type="file" accept="image/*" className="hidden" onChange={e=>e.target.files?.[0] && setThumbFile(e.target.files[0])} />
        <p className="text-white/40 text-sm">{thumbFile ? thumbFile.name : "Thumbnail (optional)"}</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <input placeholder="Title *" value={title} onChange={e=>setTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-dark-900/50 border border-white/10 text-white" />
        <select value={type} onChange={e=>setType(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-dark-900/50 border border-white/10 text-white">
          <option value="music-video">Music Video</option>
          <option value="behind-scenes">Behind the Scenes</option>
          <option value="live">Live</option>
          <option value="videography">Videography</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <input placeholder="Duration (3:45)" value={duration} onChange={e=>setDuration(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-dark-900/50 border border-white/10 text-white" />
        <input placeholder="Location" value={location} onChange={e=>setLocation(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-dark-900/50 border border-white/10 text-white" />
      </div>
      <textarea placeholder="Description" value={desc} onChange={e=>setDesc(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-dark-900/50 border border-white/10 text-white h-20" />
      <Button variant="pink" fullWidth size="lg" loading={uploading} onClick={handleSubmit} icon={<HiFilm className="w-5 h-5" />}>Upload Video</Button>
    </div>
  );
}

function SingleForm({ onSuccess }: { onSuccess: (t: string, s: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState(""); const [genre, setGenre] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const audioRef = useRef<HTMLInputElement>(null); const coverRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    if (!audioFile || !title.trim()) { toast.error("Audio and title required"); return; }
    setUploading(true);
    try {
      const audioUrl = await uploadFile(audioFile, "music/singles");
      let coverUrl = "";
      if (coverFile) coverUrl = await uploadFile(coverFile, "music/covers");
      await saveToFirestore("music", {
        title: title.trim(), type: "single", genre: genre ? [genre] : ["Afrobeat"],
        tracks: [{ id: `s-${Date.now()}`, title: title.trim(), duration: "0:00", plays: "0", audioUrl, price: 1 }],
        streams: "0", price: 1, buyUrl: "#", streamUrls: {}, credits: "Produced by Zarry C.",
        stemsAvailable: false, cover: coverUrl || "/images/default-cover.png", color: "#FF4DA6",
      });
      await notifySubscribers("music-release", `🎵 New Single: ${title.trim()}`, `"${title.trim()}" out now!`, "/music");
      onSuccess("Single Added! 🎵", `"${title.trim()}" is live.`);
    } catch (e: any) { toast.error(e.message); }
    finally { setUploading(false); }
  };

  return (
    <div className="max-w-2xl space-y-5">
      <h2 className="text-xl font-bold text-white">Add Single</h2>
      <div onClick={()=>audioRef.current?.click()} className="p-6 rounded-2xl border-2 border-dashed border-white/10 text-center cursor-pointer hover:border-pink-500/30">
        <input ref={audioRef} type="file" accept="audio/*" className="hidden" onChange={e=>e.target.files?.[0] && setAudioFile(e.target.files[0])} />
        {audioFile ? <p className="text-white">{audioFile.name}</p> : <p className="text-white/40 flex items-center justify-center gap-2"><HiUpload className="w-5 h-5" />Audio *</p>}
      </div>
      <div onClick={()=>coverRef.current?.click()} className="p-4 rounded-xl border border-dashed border-white/10 text-center cursor-pointer">
        <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={e=>e.target.files?.[0] && setCoverFile(e.target.files[0])} />
        <p className="text-white/40 text-sm">{coverFile ? coverFile.name : "Cover (optional)"}</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <input placeholder="Title *" value={title} onChange={e=>setTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-dark-900/50 border border-white/10 text-white" />
        <input placeholder="Genre" value={genre} onChange={e=>setGenre(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-dark-900/50 border border-white/10 text-white" />
      </div>
      <Button variant="pink" fullWidth size="lg" loading={uploading} onClick={handleSubmit} icon={<HiMicrophone className="w-5 h-5" />}>Upload Single</Button>
    </div>
  );
}

function AlbumForm({ onSuccess }: { onSuccess: (t: string, s: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState(""); const [type, setType] = useState("album");
  const [genre, setGenre] = useState(""); const [trackCount, setTrackCount] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    if (!coverFile || !title.trim()) { toast.error("Cover image and title required"); return; }
    setUploading(true);
    try {
      const coverUrl = await uploadFile(coverFile, "music/albums");
      const tracks = Array.from({ length: Number(trackCount) || 5 }).map((_, i) => ({
        id: `t-${Date.now()}-${i}`, title: `Track ${i + 1}`, duration: "0:00", plays: "0", audioUrl: "", price: 1,
      }));
      await saveToFirestore("music", {
        title: title.trim(), type, genre: genre ? [genre] : ["Various"],
        cover: coverUrl, tracks, streams: "0", price: type === "ep" ? 20 : 15,
        buyUrl: "#", streamUrls: {}, credits: "Produced by Zarry C.", stemsAvailable: false, color: "#FF4DA6",
      });
      await notifySubscribers("music-release", `💿 New ${type.toUpperCase()}: ${title.trim()}`, `"${title.trim()}" out now!`, "/music");
      onSuccess(`${type.toUpperCase()} Added! 💿`, `"${title.trim()}" is live.`);
    } catch (e: any) { toast.error(e.message); }
    finally { setUploading(false); }
  };

  return (
    <div className="max-w-2xl space-y-5">
      <h2 className="text-xl font-bold text-white">Add Album / EP</h2>
      <div onClick={()=>coverRef.current?.click()} className="p-6 rounded-2xl border-2 border-dashed border-white/10 text-center cursor-pointer hover:border-pink-500/30">
        <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={e=>e.target.files?.[0] && setCoverFile(e.target.files[0])} />
        {coverFile ? <div><HiCheck className="w-8 h-8 text-green-400 mx-auto" /><p className="text-white mt-1">{coverFile.name}</p></div> : <p className="text-white/40 flex items-center justify-center gap-2"><HiUpload className="w-5 h-5" />Cover Art *</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <input placeholder="Title *" value={title} onChange={e=>setTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-dark-900/50 border border-white/10 text-white" />
        <select value={type} onChange={e=>setType(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-dark-900/50 border border-white/10 text-white">
          <option value="album">Album</option>
          <option value="ep">EP</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <input placeholder="Genre" value={genre} onChange={e=>setGenre(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-dark-900/50 border border-white/10 text-white" />
        <input type="number" placeholder="Track count" value={trackCount} onChange={e=>setTrackCount(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-dark-900/50 border border-white/10 text-white" />
      </div>
      <Button variant="pink" fullWidth size="lg" loading={uploading} onClick={handleSubmit} icon={<HiCollection className="w-5 h-5" />}>Upload {type === "ep" ? "EP" : "Album"}</Button>
    </div>
  );
}