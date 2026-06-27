import { NextRequest, NextResponse } from "next/server";
import { AUTH_CONFIG } from "@/lib/auth/config";
import { 
  checkRateLimit, 
  recordFailedAttempt, 
  resetRateLimit 
} from "@/lib/auth/rate-limiter";
import { cookies } from "next/headers";
import crypto from "crypto";

export const dynamic = "force-dynamic";

interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Admin Login API
 * 
 * Uses Firebase Authentication for verification.
 * Creates a session cookie on successful authentication.
 * Rate limited: 5 attempts per 15 min per IP.
 */
export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    // ── Input Validation ──
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { error: "Invalid input format" },
        { status: 400 }
      );
    }

    if (email.length > 320 || password.length > 128) {
      return NextResponse.json(
        { error: "Input too long" },
        { status: 400 }
      );
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // ── Rate Limiting (by IP + email combination) ──
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() 
      || request.headers.get("x-real-ip") 
      || "unknown";
    const rateLimitKey = `login:${ip}:${normalizedEmail}`;

    const rateCheck = checkRateLimit(
      rateLimitKey,
      AUTH_CONFIG.MAX_LOGIN_ATTEMPTS,
      AUTH_CONFIG.RATE_LIMIT_WINDOW_MS,
      AUTH_CONFIG.LOCKOUT_DURATION_MS
    );

    if (!rateCheck.allowed) {
      const retryMinutes = rateCheck.retryAfterMs 
        ? Math.ceil(rateCheck.retryAfterMs / 60000) 
        : 30;
      return NextResponse.json(
        {
          error: `Too many login attempts. Try again in ${retryMinutes} minutes.`,
          retryAfterMs: rateCheck.retryAfterMs,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((rateCheck.retryAfterMs || 1800000) / 1000)),
          },
        }
      );
    }

    // ── Domain/Email Check (only authorized admins) ──
    const isAllowed = AUTH_CONFIG.ALLOWED_ADMIN_EMAILS.some(
      allowed => normalizedEmail === allowed.toLowerCase()
    );

    if (!isAllowed) {
      recordFailedAttempt(rateLimitKey);
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // ── Verify with Firebase Authentication ──
    try {
      const { getAuth, signInWithEmailAndPassword } = await import("firebase/auth");
      const { auth } = await import("@/lib/firebase/config");

      const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
      const user = userCredential.user;

      // ── Email Verification Check ──
      if (AUTH_CONFIG.REQUIRE_EMAIL_VERIFICATION && !user.emailVerified) {
        // Send verification email
        const { sendEmailVerification } = await import("firebase/auth");
        await sendEmailVerification(user).catch(() => {}); // silent fail on resend
        
        recordFailedAttempt(rateLimitKey);
        return NextResponse.json(
          {
            error: "Email not verified. A verification link has been sent to your email.",
            needsVerification: true,
          },
          { status: 403 }
        );
      }

      // ── Get Firebase ID Token ──
      const idToken = await user.getIdToken();

      // ── Create Session (token stored in HTTP-only cookie) ──
      const sessionToken = crypto.randomBytes(32).toString("hex");
      const sessionData = {
        uid: user.uid,
        email: normalizedEmail,
        idToken,
        createdAt: Date.now(),
        expiresAt: Date.now() + AUTH_CONFIG.SESSION_EXPIRY_MS,
      };

      // Store session data (encode as base64 to avoid cookie parsing issues)
      const { encrypt } = await import("@/lib/auth/crypto");
      const encryptedSession = encrypt(JSON.stringify(sessionData));

      const cookieStore = await cookies();
      cookieStore.set(AUTH_CONFIG.SESSION_COOKIE_NAME, encryptedSession, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: AUTH_CONFIG.SESSION_EXPIRY_MS / 1000, // in seconds
      });

      // ── Reset Rate Limit on Success ──
      resetRateLimit(rateLimitKey);

      return NextResponse.json({
        success: true,
        user: {
          uid: user.uid,
          email: normalizedEmail,
          emailVerified: user.emailVerified,
        },
        expiresAt: sessionData.expiresAt,
      });
    } catch (firebaseError: any) {
      // Handle Firebase auth errors gracefully (don't leak details)
      recordFailedAttempt(rateLimitKey);

      const errorCode = firebaseError.code || "";
      let message = "Invalid credentials";

      if (errorCode === "auth/user-not-found" || errorCode === "auth/wrong-password" || errorCode === "auth/invalid-credential") {
        message = "Invalid email or password";
      } else if (errorCode === "auth/user-disabled") {
        message = "This account has been disabled";
      } else if (errorCode === "auth/too-many-requests") {
        message = "Account temporarily locked. Try again later.";
      } else if (errorCode === "auth/invalid-email") {
        message = "Invalid email format";
      }

      return NextResponse.json(
        { error: message },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("[Auth] Login error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}