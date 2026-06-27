"use client";

import React from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { MiniPlayer } from "./MiniPlayer";
import { Toaster } from "react-hot-toast";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <MiniPlayer />
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: "#1a1a1a",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "12px",
          },
          success: { iconTheme: { primary: "#FF4DA6", secondary: "#fff" } },
        }}
      />
    </>
  );
}