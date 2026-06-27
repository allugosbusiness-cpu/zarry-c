import { loadStripe } from "@stripe/stripe-js";

const STRIPE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";

let stripePromise: Promise<any> | null = null;

export function getStripe() {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_KEY);
  }
  return stripePromise;
}

export interface CheckoutItem {
  name: string;
  price: number; // in dollars
  quantity: number;
  image?: string;
  description?: string;
}

export async function createCheckoutSession(
  items: CheckoutItem[],
  successUrl: string,
  cancelUrl: string,
  metadata?: Record<string, string>
): Promise<string | null> {
  try {
    const res = await fetch("/api/checkout/create-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items, successUrl, cancelUrl, metadata }),
    });

    if (!res.ok) throw new Error("Failed to create checkout session");

    const { sessionId } = await res.json();
    return sessionId;
  } catch (error) {
    console.error("Checkout error:", error);
    return null;
  }
}

export async function redirectToCheckout(items: CheckoutItem[], metadata?: Record<string, string>): Promise<void> {
  const stripe = await getStripe();
  if (!stripe) {
    console.error("Stripe failed to load");
    return;
  }

  const sessionId = await createCheckoutSession(
    items,
    `${window.location.origin}/payment/success`,
    `${window.location.origin}/payment/cancelled`,
    metadata
  );

  if (sessionId) {
    const { error } = await stripe.redirectToCheckout({ sessionId });
    if (error) console.error("Stripe redirect error:", error);
  }
}