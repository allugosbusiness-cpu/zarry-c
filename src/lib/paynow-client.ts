"use client";

export interface PayNowResult {
  success: boolean;
  redirectUrl?: string;
  reference?: string;
  error?: string;
}

export async function payWithPayNow(
  amount: number,
  itemName: string,
  description?: string
): Promise<PayNowResult> {
  const res = await fetch("/api/paynow/initiate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount,
      itemName,
      description: description || itemName,
    }),
  });

  const data = await res.json();

  if (!data.success || !data.redirectUrl) {
    return { success: false, error: data.error || "Could not initiate payment" };
  }

  return {
    success: true,
    redirectUrl: data.redirectUrl,
    reference: data.reference,
  };
}