import { NextResponse } from "next/server";
import { getSubscribersForNotification, createNotificationEvent, markNotificationSent } from "@/lib/firebase/subscribers";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const type = "live-show";
    const title = "🔴 Live Show Alert — Zarry C at The Jam Tree";
    const message = "Zarry C is performing live at The Jam Tree (Harare) on July 20th! Get your tickets now before they sell out.";
    const link = "https://tickets.zarryc.com/harare";

    // Get subscribers who opted in for live-show/tour notifications
    const subscribers = await getSubscribersForNotification("live-show");
    
    // Also get tour subscribers (same preference toggle)
    const tourSubscribers = await getSubscribersForNotification("tour");
    
    // Merge and deduplicate by email
    const allSubscribers = [...subscribers, ...tourSubscribers].filter(
      (sub, i, arr) => arr.findIndex(s => s.email === sub.email) === i
    );

    if (allSubscribers.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No subscribers found for live show notifications",
        recipientCount: 0,
        note: "Sign up at /fan-club to receive notifications",
      });
    }

    // Create notification event in Firestore
    const notificationId = await createNotificationEvent(type, title, message, link);
    await markNotificationSent(notificationId, allSubscribers.length);

    // Log the sample email content
    console.log("═══════════════════════════════════════");
    console.log("📧 SAMPLE EMAIL NOTIFICATION");
    console.log("═══════════════════════════════════════");
    console.log(`To: ${allSubscribers.length} subscribers`);
    console.log(`Subject: ${title}`);
    console.log(`Body: ${message}`);
    console.log(`Link: ${link}`);
    console.log("───────────────────────────────────────");
    allSubscribers.forEach((s, i) => {
      console.log(`  ${i + 1}. ${s.name} <${s.email}> [${s.tier}]`);
    });
    console.log("═══════════════════════════════════════");

    return NextResponse.json({
      success: true,
      notificationId,
      recipientCount: allSubscribers.length,
      title,
      message,
      link,
      subscribers: allSubscribers.map(s => ({
        name: s.name,
        email: s.email,
        tier: s.tier,
      })),
      emailPreview: {
        subject: title,
        body: `Hi {name},\n\n${message}\n\nGet tickets: ${link}\n\n— Zarry C`,
        recipients: allSubscribers.length,
      },
    });
  } catch (error) {
    console.error("[NOTIFICATION ERROR]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send notification" },
      { status: 500 }
    );
  }
}