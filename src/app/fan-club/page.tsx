"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { fanClubTiers } from "@/data/site-data";
import { Button } from "@/components/ui/button";
import { PayNowButton } from "@/components/ui/paynow-button";
import { HiArrowLeft, HiCheck, HiSparkles, HiLockClosed, HiBell, HiMusicalNote, HiCalendarDays, HiShoppingBag, HiBeaker } from "react-icons/hi2";
import { HiMail } from "react-icons/hi";
import toast from "react-hot-toast";
import { auth } from "@/lib/firebase/config";
import { GoogleAuthProvider, signInWithPopup, OAuthProvider, onAuthStateChanged, User } from "firebase/auth";

export default function FanClubPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showSignup, setShowSignup] = useState<"free" | "supporter" | "vip">("free");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [emailConsent, setEmailConsent] = useState(false);
  const [notifyTours, setNotifyTours] = useState(true);
  const [notifyMusic, setNotifyMusic] = useState(true);
  const [notifyMerch, setNotifyMerch] = useState(true);
  const [notifyBeats, setNotifyBeats] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) { setEmail(u.email || ""); setName(u.displayName || ""); }
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await signInWithPopup(auth, provider);
      toast.success("Signed in with Google!");
    } catch (err: any) {
      if (err.code !== "auth/popup-closed-by-user") toast.error("Failed to sign in with Google");
    }
  };

  const signInWithApple = async () => {
    try {
      const provider = new OAuthProvider("apple.com");
      await signInWithPopup(auth, provider);
      toast.success("Signed in with Apple!");
    } catch (err: any) {
      if (err.code !== "auth/popup-closed-by-user") toast.error("Failed to sign in with Apple");
    }
  };

  const handleSignOut = async () => {
    await auth.signOut();
    setEmail(""); setName("");
    toast.success("Signed out");
  };

  const handleSubscribe = async () => {
    if (!email.trim()) { toast.error("Please enter your email address"); return; }
    if (!emailConsent) { toast.error("Please agree to receive email notifications"); return; }
    setSubmitting(true);
    try {
      const { subscribeToFanClub } = await import("@/lib/firebase/subscribers");
      await subscribeToFanClub(email.trim(), name.trim() || "Fan", showSignup, emailConsent, { tours: notifyTours, music: notifyMusic, merch: notifyMerch, beats: notifyBeats });
      setSubscribed(true);
      toast.success(`Welcome to the ${showSignup === "free" ? "community" : showSignup === "supporter" ? "Supporter" : "VIP"} club!`);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally { setSubmitting(false); }
  };

  if (subscribed) {
    return (
      <div className="min-h-screen bg-dark-950 pt-24 pb-20 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-lg mx-auto px-4">
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 3, repeat: Infinity }}
            className="w-20 h-20 rounded-full bg-pink-500/20 flex items-center justify-center mx-auto mb-6">
            <HiCheck className="w-10 h-10 text-pink-400" />
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-4">You're In!</h2>
          <p className="text-white/50 mb-2">Thanks for joining!</p>
          <p className="text-white/30 text-sm mb-8">You'll receive email updates on new music, tours, merch, and beats.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/"><Button variant="pink">Back to Home</Button></Link>
            <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const selectedTier = fanClubTiers.find(t => t.id === `tier-${showSignup}`);
  const tierPrice = selectedTier?.price || 0;
  const tierName = selectedTier?.name || "Fan Club";

  return (
    <div className="min-h-screen bg-dark-950 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-6 transition-colors"><HiArrowLeft className="w-4 h-4" /> Back</Link>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">Fan Club</h1>
          <p className="text-white/40 text-lg max-w-2xl mx-auto">
            Join the inner circle. Get email updates on tours, new music, merch drops, and beats — plus exclusive perks.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
          {fanClubTiers.map((tier, i) => (
            <motion.div key={tier.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              onClick={() => setShowSignup(tier.id.replace("tier-", "") as typeof showSignup)}
              className={`relative rounded-2xl p-8 border transition-all cursor-pointer ${
                showSignup === tier.id.replace("tier-", "")
                  ? "bg-gradient-to-b from-pink-500/15 to-transparent border-pink-500/50 ring-2 ring-pink-500/30 scale-[1.02]"
                  : tier.popular
                  ? "bg-gradient-to-b from-pink-500/10 to-transparent border-pink-500/30"
                  : "bg-dark-800/50 border-white/5 hover:border-white/10"
              }`}>
              {tier.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[linear-gradient(135deg,#FF4DA6,#FF1493)] text-white text-xs font-semibold">Most Popular</div>}
              <div className="mb-6">
                <h3 className="text-white font-bold text-xl mb-1">{tier.name}</h3>
                <div className="text-4xl font-bold text-white">{tier.priceLabel}</div>
              </div>
              <ul className="space-y-3 mb-8">
                {tier.features.map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm text-white/60">
                    <HiCheck className="w-5 h-5 text-pink-400 mt-0.5 flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <div className="bg-white/5 rounded-lg p-3 text-xs text-white/40 mb-4">
                <HiMail className="w-3 h-3 inline mr-1 text-pink-400" />Email notifications on tours, new music & merch
              </div>
              <Button variant={showSignup === tier.id.replace("tier-", "") ? "pink" : "outline"} fullWidth size="lg"
                onClick={(e) => { e.stopPropagation(); setShowSignup(tier.id.replace("tier-", "") as typeof showSignup); }}>
                {showSignup === tier.id.replace("tier-", "") ? "Selected" : tier.id === "tier-free" ? "Join Free" : "Select"}
              </Button>
            </motion.div>
          ))}
        </div>

        <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="max-w-xl mx-auto p-8 rounded-2xl bg-dark-800/50 border border-white/5">
          <h2 className="text-2xl font-bold text-white mb-2">Sign Up — {tierName}</h2>
          <p className="text-white/40 text-sm mb-6">Create your account or sign in to join.</p>

          <div className="space-y-4">
            <div className="space-y-3">
              <button onClick={signInWithGoogle} disabled={authLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-all disabled:opacity-50">
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>Sign up with Google
              </button>
              <button onClick={signInWithApple} disabled={authLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-all disabled:opacity-50">
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#fff" d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>Sign up with Apple
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10" /><span className="text-white/30 text-sm">or sign up with email</span><div className="flex-1 h-px bg-white/10" />
            </div>

            {user && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-2 text-sm text-white/70"><HiCheck className="w-4 h-4 text-green-400" />Signed in as <span className="text-white font-medium">{user.email}</span></div>
                <button onClick={handleSignOut} className="text-xs text-white/40 hover:text-white underline">Sign out</button>
              </div>
            )}

            <div>
              <label className="block text-white/60 text-sm font-medium mb-1">Name</label>
              <input type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-dark-900/50 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-pink-500/50 transition-all" />
            </div>

            <div>
              <label className="block text-white/60 text-sm font-medium mb-1">Email Address *</label>
              <input type="email" required placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-dark-900/50 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-pink-500/50 transition-all" />
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-pink-500/5 border border-pink-500/10">
              <input type="checkbox" id="emailConsent" checked={emailConsent} onChange={e => setEmailConsent(e.target.checked)} className="mt-1 rounded accent-pink-500" />
              <label htmlFor="emailConsent" className="text-white/70 text-sm">I agree to receive email notifications about new tours, music releases, merch drops, and beats. I can unsubscribe at any time.</label>
            </div>

            <AnimatePresence>
              {emailConsent && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-3 overflow-hidden">
                  <p className="text-white/50 text-sm font-medium flex items-center gap-2"><HiBell className="w-4 h-4 text-pink-400" />Notify me about:</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: "tours", label: "Tours & Live Shows", icon: HiCalendarDays, val: notifyTours, set: setNotifyTours },
                      { key: "music", label: "New Music", icon: HiMusicalNote, val: notifyMusic, set: setNotifyMusic },
                      { key: "merch", label: "Merch Drops", icon: HiShoppingBag, val: notifyMerch, set: setNotifyMerch },
                      { key: "beats", label: "New Beats", icon: HiBeaker, val: notifyBeats, set: setNotifyBeats },
                    ].map(item => (
                      <label key={item.key} className="flex items-center gap-3 p-3 rounded-xl bg-dark-900/50 border border-white/5 cursor-pointer hover:border-white/10 transition-all">
                        <input type="checkbox" checked={item.val} onChange={e => item.set(e.target.checked)} className="rounded accent-pink-500" />
                        <span className="flex items-center gap-2 text-sm text-white/70"><item.icon className="w-4 h-4 text-pink-400" />{item.label}</span>
                      </label>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {showSignup === "free" ? (
              <Button variant="pink" size="xl" fullWidth loading={submitting} onClick={handleSubscribe} className="mt-4">Join Free</Button>
            ) : (
              <PayNowButton
                fullWidth
                size="xl"
                variant="pink"
                amount={tierPrice}
                itemName={`Fan Club - ${tierName} (${tierPrice > 0 ? `$${tierPrice}/mo` : "Free"})`}
                description={`Monthly subscription to Zarry C ${tierName} tier`}
              >
                Subscribe — {tierPrice > 0 ? `$${tierPrice}/mo` : "Free"}
              </PayNowButton>
            )}

            <p className="text-white/20 text-xs text-center">By signing up, you agree to receive email communications. No spam, unsubscribe anytime.</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 p-8 rounded-2xl bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-3"><HiSparkles className="w-6 h-6 text-pink-400" />Bid for a Video Feature</h2>
              <p className="text-white/50 max-w-xl">VIP Inner Circle members can bid on open spots in upcoming music videos. The highest bidder gets a custom cameo.</p>
            </div>
            <Button variant="pink" size="xl" icon={<HiLockClosed className="w-5 h-5" />} disabled>Requires VIP</Button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 p-8 rounded-2xl bg-dark-800/50 border border-white/5">
          <h2 className="text-2xl font-bold text-white mb-2">Direct Messaging</h2>
          <p className="text-white/40 mb-6">Supporters get 50 messages/month. VIP members get unlimited direct access.</p>
        </motion.div>
      </div>
    </div>
  );
}