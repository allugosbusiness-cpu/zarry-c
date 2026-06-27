import { NextRequest, NextResponse } from "next/server";
import { AUTH_CONFIG } from "@/lib/auth/config";
import { decrypt } from "@/lib/auth/crypto";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

interface SessionData {
  uid: string;
  email: string;
  idToken: string;
  createdAt: number;
  expiresAt: number;
}

/**
 * Verify current session validity.
 * Used by the admin dashboard to check if the user is still authenticated.
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(AUTH_CONFIG.SESSION_COOKIE_NAME);

    if (!sessionCookie?.value) {
      return NextResponse.json(
        { authenticated: false, error: "No session" },
        { status: 401 }
      );
    }

    // Decrypt session
    const decrypted = decrypt(sessionCookie.value);
    if (!decrypted) {
      // Invalid session - clear it
      cookieStore.delete(AUTH_CONFIG.SESSION_COOKIE_NAME);
      return NextResponse.json(
        { authenticated: false, error: "Invalid session" },
        { status: 401 }
      );
    }

    const session: SessionData = JSON.parse(decrypted);
    const now = Date.now();

    // Check expiry
    if (now > session.expiresAt) {
      cookieStore.delete(AUTH_CONFIG.SESSION_COOKIE_NAME);
      return NextResponse.json(
        { authenticated: false, error: "Session expired" },
        { status: 401 }
      );
    }

    // Verify Firebase ID token is still valid
    try {
      const { getAuth } = await import("firebase/auth");
      const { auth } = await import("@/lib/firebase/config");
      
      // Try to refresh the token if it's close to expiry
      const currentUser = auth.currentUser;
      if (currentUser) {
        const freshToken = await currentUser.getIdToken(true);
        return NextResponse.json({
          authenticated: true,
          user: {
            uid: session.uid,
            email: session.email,
          },
          expiresAt: session.expiresAt,
          refreshed: true,
        });
      }
    } catch {
      // If Firebase auth check fails, still consider cookie valid if not expired
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        uid: session.uid,
        email: session.email,
      },
      expiresAt: session.expiresAt,
    });
  } catch (error) {
    console.error("[Auth] Verify error:", error);
    return NextResponse.json(
      { authenticated: false, error: "Verification failed" },
      { status: 500 }
    );
  }
}

/**
 * Refresh the session expiry.
 */
export async function POST() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(AUTH_CONFIG.SESSION_COOKIE_NAME);

    if (!sessionCookie?.value) {
      return NextResponse.json(
        { authenticated: false, error: "No session" },
        { status: 401 }
      );
    }

    const decrypted = decrypt(sessionCookie.value);
    if (!decrypted) {
      cookieStore.delete(AUTH_CONFIG.SESSION_COOKIE_NAME);
      return NextResponse.json(
        { authenticated: false, error: "Invalid session" },
        { status: 401 }
      );
    }

    const session: SessionData = JSON.parse(decrypted);
    const now = Date.now();

    // Don't refresh expired sessions
    if (now > session.expiresAt) {
      cookieStore.delete(AUTH_CONFIG.SESSION_COOKIE_NAME);
      return NextResponse.json(
        { authenticated: false, error: "Session expired" },
        { status: 401 }
      );
    }

    // Extend session
    const { encrypt } = await import("@/lib/auth/crypto");
    const newExpiry = now + AUTH_CONFIG.SESSION_EXPIRY_MS;
    const updatedSession: SessionData = {
      ...session,
      expiresAt: newExpiry,
    };
    const encrypted = encrypt(JSON.stringify(updatedSession));

    cookieStore.set(AUTH_CONFIG.SESSION_COOKIE_NAME, encrypted, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: AUTH_CONFIG.SESSION_EXPIRY_MS / 1000,
    });

    return NextResponse.json({
      success: true,
      expiresAt: newExpiry,
    });
  } catch (error) {
    console.error("[Auth] Refresh error:", error);
    return NextResponse.json(
      { error: "Failed to refresh session" },
      { status: 500 }
    );
  }
}