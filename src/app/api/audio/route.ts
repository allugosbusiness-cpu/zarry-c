import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutes for audio streaming

/**
 * Server-side audio proxy.
 * 
 * Audio files in Firebase Storage are private (require auth token).
 * This proxy adds the Firebase Auth token on the server side so
 * audio can play in the browser without the client needing auth.
 */
export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get("url");
    if (!url) {
      return NextResponse.json({ error: "Missing 'url' parameter" }, { status: 400 });
    }

    // Get a Firebase Auth token first
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: "Firebase API key not configured" }, { status: 500 });
    }
    
    const authRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ returnSecureToken: true }),
        cache: "no-store",
      }
    );

    if (!authRes.ok) {
      console.error("[Audio Proxy] Auth failed:", await authRes.text());
      return NextResponse.json({ error: "Auth failed" }, { status: 500 });
    }

    const { idToken } = await authRes.json();

    // Fetch the audio file with auth header
    // The Firebase Storage `alt=media` URL works with Bearer token auth
    const audioRes = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${idToken}`,
      },
    });

    if (!audioRes.ok) {
      const errText = await audioRes.text();
      console.error("[Audio Proxy] Fetch failed:", audioRes.status, errText.substring(0, 200));
      return NextResponse.json({ error: "Audio fetch failed" }, { status: 500 });
    }

    // Get content type from response
    const contentType = audioRes.headers.get("Content-Type") || "audio/mpeg";

    // Read the response as text/buffer
    const audioBuffer = Buffer.from(await audioRes.arrayBuffer());

    // Return with proper audio headers
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": audioBuffer.length.toString(),
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=3600",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error: any) {
    console.error("[Audio Proxy] Error:", error);
    return NextResponse.json({ error: error.message || "Audio proxy failed" }, { status: 500 });
  }
}