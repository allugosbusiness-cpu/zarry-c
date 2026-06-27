"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconButton } from "@/components/ui/button";
import { useUIStore, useCartStore } from "@/lib/store";
import { artistInfo } from "@/data/site-data";
import { HiMenu, HiX, HiSearch, HiShoppingCart, HiUser } from "react-icons/hi";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/music", label: "Music" },
  { href: "/video", label: "Video" },
  { href: "/merch", label: "Merch" },
  { href: "/beats", label: "Beats" },
  { href: "/fan-club", label: "Fan Club" },
  { href: "/tour", label: "Tour" },
  { href: "/services", label: "Services" },
  { href: "/donate", label: "Donate" },
  { href: "/blog", label: "Blog" },
];

export function Header() {
  const pathname = usePathname();
  const { mobileMenuOpen, toggleMobileMenu, closeMobileMenu, toggleSearch, toggleCart } = useUIStore();
  const cartItems = useCartStore((s) => s.items.length);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    closeMobileMenu();
  }, [pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-black/80 backdrop-blur-xl border-b border-white/5"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-pink-500/20 group-hover:ring-pink-500/50 transition-all duration-300">
              <Image src={artistInfo.logo} alt="ZARRY C" width={48} height={48} className="object-contain w-full h-full" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white hidden sm:block group-hover:text-pink-400 transition-colors">
              ZARRY C
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                  pathname === link.href
                    ? "text-white bg-white/10"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
                {pathname === link.href && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 rounded-full bg-white/10 border border-white/10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <IconButton onClick={toggleSearch} size="sm" variant="ghost">
              <HiSearch className="w-5 h-5" />
            </IconButton>
            <IconButton onClick={toggleCart} size="sm" variant="ghost" className="relative">
              <HiShoppingCart className="w-5 h-5" />
              {cartItems > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 rounded-full text-[10px] font-bold flex items-center justify-center text-white">
                  {cartItems}
                </span>
              )}
            </IconButton>
            <Link href="/fan-club">
              <IconButton size="sm" variant="ghost">
                <HiUser className="w-5 h-5" />
              </IconButton>
            </Link>
            <button
              className="lg:hidden ml-2 relative w-9 h-9 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-black/95 backdrop-blur-xl border-t border-white/5 overflow-hidden"
          >
            <nav className="px-4 py-4 space-y-1 max-h-[70vh] overflow-y-auto">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={link.href}
                    className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      pathname === link.href
                        ? "text-pink-400 bg-pink-500/10"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}