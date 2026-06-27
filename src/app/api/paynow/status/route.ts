import { NextRequest, NextResponse } from "next/server";
import { getPaymentStatus } from "@/lib/paynow";

export const dynamic = "force-dynamic";

/**
 * Returns the status of a payment by reference.
 * Polled by the payment/verify page after PayNow redirects the user back.
 */
export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get("reference");

  if (!reference) {
    return NextResponse.json({ error: "Missing reference" }, { status: 400 });
  }

  const status = getPaymentStatus(reference);

  if (!status) {
    // Status not found yet - PayNow result may not have arrived
    return NextResponse.json({ status: "pending", paid: false });
  }

  return NextResponse.json(status);
}