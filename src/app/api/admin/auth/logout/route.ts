import { NextResponse } from "next/server";
import { AUTH_CONFIG } from "@/lib/auth/config";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

/**
 * Admin Logout API
 * Clears the session cookie and optionally signs out from Firebase.
 */
export async function POST() {
  try {
    const cookieStore = await cookies();
    
    // Clear the session cookie
    cookieStore.delete(AUTH_CONFIG.SESSION_COOKIE_NAME);

    // Optionally sign out from Firebase
    try {
      const { getAuth, signOut } = await import("firebase/auth");
      const { auth } = await import("@/lib/firebase/config");
      await signOut(auth).catch(() => {});
    } catch {
      // Firebase signOut is best-effort
    }

    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("[Auth] Logout error:", error);
    return NextResponse.json(
      { error: "Logout failed" },
      { status: 500 }
    );
  }
}