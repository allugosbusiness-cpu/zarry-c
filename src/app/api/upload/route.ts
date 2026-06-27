import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 120; // 120 seconds for large file uploads

/**
 * Server-side upload proxy.
 * 
 * Files are uploaded server-to-server to Firebase Storage.
 * This completely avoids browser CORS issues since the upload
 * happens entirely on the server side.
 */

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const path = formData.get("path") as string || "uploads";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const ext = file.name.split(".").pop() || "bin";
    const fileName = `${path}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    // ----- Get Firebase Auth Token -----
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
      const authErr = await authRes.text();
      console.error("[Upload] Firebase auth failed:", authErr);
      
      if (authErr.includes("ADMIN_ONLY_OPERATION")) {
        return NextResponse.json({
          error: "Upload requires Anonymous Authentication",
          details: "Enable 'Anonymous' sign-in in Firebase Console > Authentication > Sign-in method, then wait 5 minutes and try again",
          hint: "https://console.firebase.google.com/project/zarry-c/authentication"
        }, { status: 400 });
      }
      
      return NextResponse.json({
        error: "Firebase authentication failed",
        details: authErr
      }, { status: 500 });
    }

    const { idToken } = await authRes.json();
    if (!idToken) {
      return NextResponse.json({ error: "No auth token received" }, { status: 500 });
    }

    // Try both bucket name formats
    const bucketNames = [
      "zarry-c.firebasestorage.app",
      "zarry-c.appspot.com"
    ];

    let lastError = "";
    
    for (const bucket of bucketNames) {
      const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o?name=${encodeURIComponent(fileName)}`;
      
      const uploadRes = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${idToken}`,
          "Content-Type": file.type || "application/octet-stream",
        },
        body: buffer,
      });

      if (uploadRes.ok) {
        const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(fileName)}?alt=media`;
        
        return NextResponse.json({
          success: true,
          url: downloadUrl,
          name: fileName,
          bucket,
        });
      }

      lastError = await uploadRes.text();
      console.log(`[Upload] Bucket ${bucket} failed:`, lastError.substring(0, 200));
    }

    return NextResponse.json({ 
      error: "Upload to Storage failed on all bucket names", 
      details: lastError 
    }, { status: 500 });
  } catch (error: any) {
    console.error("[Upload] Error:", error);
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
  }
}