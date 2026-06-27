/**
 * Email Service - Sends transactional emails via SendGrid API.
 * Uses native fetch - no additional dependencies required.
 * 
 * To enable: Set SENDGRID_API_KEY in your .env.local
 * To use a different provider, swap the sendEmail function.
 */

const FROM_EMAIL = "noreply@zarryc.com";
const FROM_NAME = "Zarry C";

interface EmailPayload {
  to: string;
  subject: string;
  text: string;
  html: string;
}

/**
 * Send an email using the configured provider.
 * Currently supports SendGrid API via HTTP.
 * Falls back to console.log if no API key is configured.
 */
export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  const apiKey = process.env.SENDGRID_API_KEY;

  if (!apiKey) {
    console.log(`[Email Service] No SENDGRID_API_KEY configured. Would send email to: ${payload.to}`);
    console.log(`[Email Service] Subject: ${payload.subject}`);
    console.log(`[Email Service] Body: ${payload.text}`);
    return false;
  }

  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: payload.to }],
            subject: payload.subject,
          },
        ],
        from: { email: FROM_EMAIL, name: FROM_NAME },
        content: [
          {
            type: "text/plain",
            value: payload.text,
          },
          {
            type: "text/html",
            value: payload.html,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Email Service] SendGrid error (${response.status}): ${errorText}`);
      return false;
    }

    console.log(`[Email Service] Email sent to ${payload.to}: "${payload.subject}"`);
    return true;
  } catch (error) {
    console.error("[Email Service] Failed to send email:", error);
    return false;
  }
}

/**
 * Send a notification email to a subscriber about new content.
 */
export async function sendNewContentNotification(
  subscriberEmail: string,
  subscriberName: string,
  contentType: "music-release" | "tour" | "merch-drop" | "beat-drop" | "live-show",
  title: string,
  description: string,
  link?: string
): Promise<boolean> {
  const typeLabel: Record<string, string> = {
    "music-release": "🎵 New Music Release",
    "tour": "🎫 Tour / Live Show",
    "merch-drop": "🛍️ New Merch Drop",
    "beat-drop": "🎧 New Beat Available",
    "live-show": "🎤 Live Show Announcement",
  };

  const emoji = typeLabel[contentType] || "📢";
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://zarryc.vercel.app";

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { margin: 0; padding: 0; background-color: #0a0a0a; font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 24px; }
        .header { text-align: center; padding: 32px 0; }
        .logo { width: 80px; height: 80px; border-radius: 50%; margin-bottom: 16px; }
        .emoji { font-size: 48px; margin-bottom: 8px; }
        .content { background: #1a1a1a; border-radius: 16px; padding: 32px; color: #ffffff; }
        h1 { font-size: 24px; margin: 0 0 8px 0; color: #ffffff; }
        h2 { font-size: 20px; margin: 16px 0; color: #FF4DA6; }
        p { font-size: 16px; line-height: 1.6; color: #cccccc; margin: 8px 0; }
        .button { display: inline-block; padding: 14px 32px; background: #FF4DA6; color: #ffffff; 
                   text-decoration: none; border-radius: 8px; font-weight: bold; margin: 16px 0; }
        .footer { text-align: center; padding: 24px; color: #666; font-size: 12px; }
        .footer a { color: #FF4DA6; }
        .divider { border: none; border-top: 1px solid #333; margin: 24px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${baseUrl}/images/zarry c logo.png" alt="Zarry C" class="logo" />
          <div class="emoji">${emoji.split(" ")[0]}</div>
          <h1>Zarry C</h1>
        </div>
        <div class="content">
          <h2>${title}</h2>
          <p>Hi ${subscriberName || "there"},</p>
          <p>${description}</p>
          ${link ? `<p style="text-align: center;"><a href="${link}" class="button">Check It Out</a></p>` : ""}
          <hr class="divider" />
          <p style="font-size: 12px; color: #666;">
            You received this because you're subscribed to ${contentType.replace("-", " ")} notifications.
            <br /><a href="${baseUrl}/unsubscribe?email=${encodeURIComponent(subscriberEmail)}">Unsubscribe</a>
          </p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Zarry C. All rights reserved.</p>
          <p>Harare, Zimbabwe</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const emailText = `${title}\n\nHi ${subscriberName || "there"},\n\n${description}\n\n${link ? `Check it out: ${link}\n\n` : ""}You received this because you're subscribed to ${contentType.replace("-", " ")} notifications.\nUnsubscribe: ${baseUrl}/unsubscribe?email=${encodeURIComponent(subscriberEmail)}`;

  return sendEmail({
    to: subscriberEmail,
    subject: `${title}`,
    text: emailText,
    html: emailHtml,
  });
}

/**
 * Send a batch of notification emails to multiple subscribers.
 */
export async function sendBulkNotifications(
  subscribers: { email: string; name: string }[],
  contentType: "music-release" | "tour" | "merch-drop" | "beat-drop" | "live-show",
  title: string,
  description: string,
  link?: string
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  for (const sub of subscribers) {
    const success = await sendNewContentNotification(
      sub.email,
      sub.name,
      contentType,
      title,
      description,
      link
    );
    if (success) sent++;
    else failed++;
  }

  return { sent, failed };
}