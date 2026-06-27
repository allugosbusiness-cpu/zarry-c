import crypto from "crypto";

const PAYNOW_URL = "https://www.paynow.co.zw/interface/initiatetransaction";
const RESULT_URL = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/paynow/result`;
const RETURN_URL = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/payment/verify`;

export interface PayNowInitiateResponse {
  success: boolean;
  redirectUrl?: string;
  pollUrl?: string;
  reference?: string;
  error?: string;
}

/**
 * In-memory store for payment statuses.
 * In production, use a database.
 */
const paymentStore: Record<string, { status: string; paid: boolean; paynowReference?: string; amount?: string; error?: string }> = {};

export function updatePaymentStatus(
  reference: string,
  status: string,
  paynowReference?: string,
  amount?: string,
  error?: string
) {
  paymentStore[reference] = {
    status,
    paid: status.toLowerCase() === "paid",
    paynowReference,
    amount,
    error,
  };
}

export function getPaymentStatus(reference: string) {
  return paymentStore[reference];
}

/**
 * Generate the PayNow hash from RAW (un-encoded) values.
 */
function generateHash(
  values: Record<string, string>,
  integrationKey: string
): string {
  let hashString = "";
  for (const key of Object.keys(values)) {
    if (key !== "hash") {
      hashString += values[key];
    }
  }
  hashString += integrationKey.toLowerCase();
  return crypto.createHash("sha512").update(hashString).digest("hex").toUpperCase();
}

/**
 * Verify a PayNow response hash.
 */
export function verifyPayNowHash(
  params: Record<string, string>,
  integrationKey: string
): boolean {
  if (!params["hash"]) return false;
  const hash = generateHash(params, integrationKey);
  return hash === params["hash"];
}

/**
 * Initiate a PayNow transaction.
 */
export async function initiatePayNowTransaction(
  amount: number,
  reference: string,
  itemName: string,
  email?: string
): Promise<PayNowInitiateResponse> {
  const integrationId = process.env.PAYNOW_MERCHANT_ID || "";
  const integrationKey = process.env.PAYNOW_INTEGRATION_KEY || "";
  const merchantEmail = email || process.env.PAYNOW_MERCHANT_EMAIL || "";

  if (!integrationId || !integrationKey) {
    return { success: false, error: "PayNow not configured - missing merchant credentials" };
  }

  const rawValues: Record<string, string> = {
    resulturl: RESULT_URL,
    returnurl: RETURN_URL,
    reference,
    amount: amount.toFixed(2),
    id: integrationId,
    additionalinfo: itemName,
    authemail: merchantEmail,
    status: "Message",
  };

  // Generate hash from RAW values
  const hash = generateHash(rawValues, integrationKey);

  // Build POST body with URL encoding
  const body = new URLSearchParams({
    ...rawValues,
    hash,
  }).toString();

  try {
    const response = await fetch(PAYNOW_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    const text = await response.text();
    const parsed = Object.fromEntries(new URLSearchParams(text).entries());

    if (parsed.status?.toLowerCase() === "ok" && parsed.browserurl) {
      // Store initial pending status
      updatePaymentStatus(reference, "pending");

      return {
        success: true,
        redirectUrl: parsed.browserurl,
        pollUrl: parsed.pollurl,
        reference,
      };
    }

    return { success: false, error: parsed.error || "PayNow initiation failed" };
  } catch (err: any) {
    console.error("[PayNow] Error:", err.message);
    return { success: false, error: err.message || "Network error contacting PayNow" };
  }
}

/**
 * Generates a unique transaction reference.
 */
export function generateReference(): string {
  return `ZC-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}