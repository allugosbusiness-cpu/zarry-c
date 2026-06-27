import { NextResponse } from "next/server";
import { fetchAllSocialFeed } from "@/lib/social/aggregator";

export const dynamic = "force-dynamic";
export const revalidate = 300; // 5 minutes

export async function GET() {
  try {
    const result = await fetchAllSocialFeed();
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        posts: [],
        loading: false,
        error: error instanceof Error ? error.message : "Failed to fetch social feed",
        timestamp: Date.now(),
      },
      { status: 200 }
    );
  }
}