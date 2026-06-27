import { NextRequest, NextResponse } from "next/server";
import { 
  getSubscribersForNotification, 
  createNotificationEvent,
  markNotificationSent 
} from "@/lib/firebase/subscribers";
import { sendBulkNotifications } from "@/lib/email-service";

export const dynamic = "force-dynamic";

type NotificationType = "tour" | "music-release" | "merch-drop" | "beat-drop" | "live-show";

interface SendRequest {
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SendRequest = await request.json();
    
    if (!body.type || !body.title || !body.message) {
      return NextResponse.json(
        { error: "Missing required fields: type, title, message" },
        { status: 400 }
      );
    }

    const validTypes: NotificationType[] = ["tour", "music-release", "merch-drop", "beat-drop", "live-show"];
    if (!validTypes.includes(body.type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    // Get subscribers who opted in for this notification type
    const subscribers = await getSubscribersForNotification(body.type);
    const recipientCount = subscribers.length;

    // Create notification event in Firestore
    const notificationId = await createNotificationEvent(
      body.type,
      body.title,
      body.message,
      body.link
    );

    if (recipientCount === 0) {
      await markNotificationSent(notificationId, 0);
      return NextResponse.json({
        success: true,
        message: "No subscribers found for this notification type",
        recipientCount: 0,
      });
    }

    // Actually send emails to subscribers
    console.log(`[NOTIFICATION] ${body.type}: "${body.title}"`);
    console.log(`[NOTIFICATION] Sending to ${recipientCount} subscribers`);
    console.log(`[NOTIFICATION] Email recipients:`, subscribers.map(s => s.email));

    const { sent, failed } = await sendBulkNotifications(
      subscribers.map(s => ({ email: s.email, name: s.name })),
      body.type,
      body.title,
      body.message,
      body.link
    );

    // Mark notification as sent
    await markNotificationSent(notificationId, recipientCount);

    return NextResponse.json({
      success: true,
      notificationId,
      recipientCount,
      sentCount: sent,
      failedCount: failed,
      subscribersSample: subscribers.slice(0, 5).map(s => ({
        email: s.email,
        name: s.name,
        tier: s.tier,
      })),
      message: `Notification sent to ${sent}/${recipientCount} subscribers${failed > 0 ? ` (${failed} failed)` : ""}`,
    });
  } catch (error) {
    console.error("[NOTIFICATION] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send notification" },
      { status: 500 }
    );
  }
}
