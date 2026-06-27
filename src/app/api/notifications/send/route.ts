import { NextRequest, NextResponse } from "next/server";
import { 
  getSubscribersForNotification, 
  createNotificationEvent,
  markNotificationSent 
} from "@/lib/firebase/subscribers";

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

    if (recipientCount === 0) {
      return NextResponse.json({
        success: true,
        message: "No subscribers found for this notification type",
        recipientCount: 0,
      });
    }

    // Create notification event in Firestore
    const notificationId = await createNotificationEvent(
      body.type,
      body.title,
      body.message,
      body.link
    );

    // Log the sent notification
    await markNotificationSent(notificationId, recipientCount);

    // Here you would integrate with an email service like SendGrid, Mailgun, etc.
    // For now, we log what would be sent
    console.log(`[NOTIFICATION] ${body.type}: "${body.title}"`);
    console.log(`[NOTIFICATION] Sending to ${recipientCount} subscribers`);
    console.log(`[NOTIFICATION] Email recipients:`, subscribers.map(s => s.email));

    return NextResponse.json({
      success: true,
      notificationId,
      recipientCount,
      subscribersSample: subscribers.slice(0, 5).map(s => ({
        email: s.email,
        name: s.name,
        tier: s.tier,
      })),
      message: `Notification queued for ${recipientCount} subscribers`,
    });
  } catch (error) {
    console.error("[NOTIFICATION] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send notification" },
      { status: 500 }
    );
  }
}