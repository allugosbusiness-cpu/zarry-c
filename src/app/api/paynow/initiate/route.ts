import { NextRequest, NextResponse } from "next/server";
import { initiatePayNowTransaction, generateReference } from "@/lib/paynow";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, itemName, description, email } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    if (!itemName) {
      return NextResponse.json({ error: "Item name is required" }, { status: 400 });
    }

    const reference = generateReference();
    const result = await initiatePayNowTransaction(
      amount,
      reference,
      description || itemName,
      email || undefined
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "PayNow initiation failed" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      redirectUrl: result.redirectUrl,
      pollUrl: result.pollUrl,
      reference: result.reference,
    });
  } catch (error: any) {
    console.error("[PayNow] Initiate error:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}