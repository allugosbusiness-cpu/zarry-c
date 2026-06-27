import { NextRequest, NextResponse } from "next/server";
import { updatePaymentStatus, verifyPayNowHash } from "@/lib/paynow";

export const dynamic = "force-dynamic";

/**
 * PayNow sends a POST to this URL after a transaction completes.
 * This is the SERVER-TO-SERVER notification, which is the authoritative
 * source of payment status.
 *
 * Params include: reference, status, amount, paynowreference, pollurl, hash
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const params: Record<string, string> = {};
    for (const [key, value] of formData.entries()) {
      params[key] = value.toString();
    }

    const { reference, status, paynowreference, amount, error } = params;

    // Verify the hash to ensure this is a legitimate PayNow notification
    const integrationKey = process.env.PAYNOW_INTEGRATION_KEY || "2065f64e-d2a1-4f6a-87b0-dacf28f7a88c";
    const isValid = verifyPayNowHash(params, integrationKey);

    if (!isValid) {
      console.error("[PayNow] Invalid hash in result notification");
      return NextResponse.json({ error: "Invalid hash" }, { status: 403 });
    }

    const isPaid = status?.toLowerCase() === "paid";

    // Store the authoritative payment status
    updatePaymentStatus(reference, status || "failed", paynowreference, amount, error);

    console.log("[PayNow] Authoritative result received:", {
      reference,
      paynowreference,
      status,
      isPaid,
      amount,
      hashValid: true,
    });

    // TODO: In production, update your database here
    // If paid, grant access to the purchased item (download link, etc.)

    // PayNow expects "OK" to acknowledge receipt
    return new NextResponse("OK", { status: 200 });
  } catch (error: any) {
    console.error("[PayNow] Result error:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}