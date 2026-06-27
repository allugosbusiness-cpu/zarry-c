import { NextResponse } from "next/server";
import { getSubscribersForNotification, createNotificationEvent, markNotificationSent } from "@/lib/firebase/subscribers";
import { sendBulkNotifications } from "@/lib/email-service";

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
    
    // Actually send the emails via SendGrid
    const { sent, failed } = await sendBulkNotifications(
      allSubscribers.map(s => ({ email: s.email, name: s.name })),
      type,
      title,
      message,
      link
    );

    await markNotificationSent(notificationId, allSubscribers.length);

    return NextResponse.json({
      success: true,
      notificationId,
      recipientCount: allSubscribers.length,
      sentCount: sent,
      failedCount: failed,
      title,
      message,
      link,
      subscribers: allSubscribers.map(s => ({
        name: s.name,
        email: s.email,
        tier: s.tier,
      })),
      emailStatus: {
        apiKeyConfigured: !!process.env.SENDGRID_API_KEY,
        fromEmail: process.env.SENDGRID_FROM_EMAIL || "justicezari1@gmail.com (fallback)",
        sentTo: sent,
        failed: failed,
        note: failed > 0 ? `${failed} emails failed to send - check SendGrid sender verification at https://app.sendgrid.com/settings/sender_auth` : "All emails sent successfully",
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
