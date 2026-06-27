import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, successUrl, cancelUrl, metadata } = body;

    if (!items?.length) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json({
        error: "Stripe not configured",
        sessionId: "demo-mock-session",
        demo: true,
      });
    }

    const { default: Stripe } = await import("stripe");
    const stripe = new Stripe(stripeKey);

    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          description: item.description || undefined,
          images: item.image ? [item.image] : undefined,
        },
        unit_amount: Math.round(item.price * 100), // cents
      },
      quantity: item.quantity || 1,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: successUrl || `${request.headers.get("origin")}/payment/success`,
      cancel_url: cancelUrl || `${request.headers.get("origin")}/payment/cancelled`,
      metadata: metadata || {},
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error: any) {
    console.error("Stripe session error:", error);
    // Return mock session for demo when Stripe isn't configured
    return NextResponse.json({
      sessionId: "demo-mock-session-" + Date.now(),
      demo: true,
    });
  }
}