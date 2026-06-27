"use client";

import React, { useEffect, useState } from "react";
import { HiMusicalNote } from "react-icons/hi2";

interface VideoThumbnailProps {
  videoUrl: string;
  thumbnailUrl?: string;
  title: string;
  className?: string;
}

/**
 * VideoThumbnail - Extracts and displays the first frame of a video as a poster image.
 * Falls back to the provided thumbnailUrl if available, or auto-captures from the video.
 * Works like YouTube's auto-generated thumbnail.
 */
export function VideoThumbnail({ videoUrl, thumbnailUrl, title, className = "" }: VideoThumbnailProps) {
  const [posterSrc, setPosterSrc] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "failed">("loading");

  useEffect(() => {
    // If a thumbnail URL is provided, use it directly
    if (thumbnailUrl) {
      setPosterSrc(thumbnailUrl);
      setStatus("ready");
      return;
    }

    // Auto-capture first frame from video using a DOM video element
    setStatus("loading");
    setPosterSrc(null);

    const video = document.createElement("video");
    video.src = videoUrl;
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.crossOrigin = "anonymous";

    let clean = false;

    const tryCapture = () => {
      if (clean) return;
      try {
        const canvas = document.createElement("canvas");
        const w = video.videoWidth || 640;
        const h = video.videoHeight || 360;
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, w, h);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.5);
          if (!clean) {
            setPosterSrc(dataUrl);
            setStatus("ready");
          }
        }
      } catch (e) {
        console.log("[VideoThumbnail] capture failed:", e);
        if (!clean) setStatus("failed");
      }
      cleanup();
    };

    const onCanPlay = () => {
      if (clean) return;
      // Seek to 0.23s to avoid potential black first frame
      video.currentTime = 0.23;
    };

    const onSeeked = () => {
      if (clean) return;
      tryCapture();
    };

    const onError = () => {
      if (!clean) setStatus("failed");
      cleanup();
    };

    function cleanup() {
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onError);
      video.removeEventListener("loadedmetadata", onCanPlay);
    }

    video.addEventListener("loadedmetadata", onCanPlay);
    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("seeked", onSeeked);
    video.addEventListener("error", onError);
    video.load();

    return () => {
      clean = true;
      cleanup();
      video.src = "";
      video.load();
    };
  }, [videoUrl, thumbnailUrl]);

  if (posterSrc) {
    return (
      <img
        src={posterSrc}
        alt={title}
        className={`absolute inset-0 w-full h-full object-cover ${className}`}
      />
    );
  }

  // Show gradient placeholder while loading or if capture failed
  return (
    <div className={`absolute inset-0 bg-gradient-to-br from-dark-700 to-dark-900 flex items-center justify-center ${className}`}>
      <HiMusicalNote className="w-16 h-16 text-white/10" />
    </div>
  );
}