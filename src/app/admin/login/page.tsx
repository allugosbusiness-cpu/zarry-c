"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { artistInfo } from "@/data/site-data";
import { HiEye, HiEyeSlash, HiLockClosed, HiExclamationTriangle } from "react-icons/hi2";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          // Rate limited
          setError(data.error || "Too many attempts. Try again later.");
          return;
        }
        
        if (data.needsVerification) {
          setError("Please verify your email first. A verification link has been sent.");
          return;
        }

        setError(data.error || "Login failed");
        return;
      }

      // Success - redirect to admin dashboard
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[400px] h-[400px] rounded-full bg-pink-500/10 blur-[150px]" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-pink-500/5 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <div className="bg-dark-800/80 border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-4 ring-2 ring-pink-500/20">
              <Image src={artistInfo.logo} alt="ZARRY C" width={64} height={64} className="object-contain w-full h-full" />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Login</h1>
            <p className="text-white/40 text-sm mt-1">Authorized personnel only</p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 p-3 mb-6 rounded-lg bg-red-500/10 border border-red-500/20"
            >
              <HiExclamationTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/60 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl bg-dark-900/50 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-pink-500/50 transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white/60 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-dark-900/50 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-pink-500/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <HiEyeSlash className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="pink"
              fullWidth
              size="lg"
              loading={loading}
              icon={<HiLockClosed className="w-5 h-5" />}
            >
              {loading ? "Authenticating..." : "Sign In"}
            </Button>

            {/* Security notice */}
            <p className="text-center text-white/20 text-xs mt-4">
              Secured with AES-256 encryption • Rate-limited
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
}