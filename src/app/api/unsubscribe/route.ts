import { NextRequest, NextResponse } from "next/server";
import { unsubscribe } from "@/lib/firebase/subscribers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email");
  
  if (!email) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  try {
    await unsubscribe(email);
    return NextResponse.redirect(new URL("/unsubscribed", request.url));
  } catch (error) {
    console.error("[Unsubscribe] Error:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }
}