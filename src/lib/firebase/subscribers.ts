import { db } from "./config";
import { 
  collection, addDoc, getDocs, query, where, orderBy, 
  Timestamp, serverTimestamp, doc, updateDoc, deleteDoc 
} from "firebase/firestore";

export interface Subscriber {
  id?: string;
  email: string;
  name: string;
  tier: "free" | "supporter" | "vip";
  emailConsent: boolean;
  notifyTours: boolean;
  notifyMusic: boolean;
  notifyMerch: boolean;
  notifyBeats: boolean;
  subscribedAt: Date;
  active: boolean;
}

export interface NotificationEvent {
  id?: string;
  type: "tour" | "music-release" | "merch-drop" | "beat-drop" | "live-show";
  title: string;
  message: string;
  link?: string;
  sentAt?: Date;
  sentToCount?: number;
}

const SUBSCRIBERS_COLLECTION = "subscribers";
const NOTIFICATIONS_COLLECTION = "notifications";

// Subscribe to fan club
export async function subscribeToFanClub(
  email: string, 
  name: string, 
  tier: "free" | "supporter" | "vip",
  emailConsent: boolean,
  notifyPreferences?: {
    tours?: boolean;
    music?: boolean;
    merch?: boolean;
    beats?: boolean;
  }
): Promise<string> {
  // Check if already subscribed
  const existing = await getDocs(
    query(collection(db, SUBSCRIBERS_COLLECTION), where("email", "==", email))
  );
  
  if (!existing.empty) {
    // Update existing subscriber
    const subscriberDoc = existing.docs[0];
    await updateDoc(doc(db, SUBSCRIBERS_COLLECTION, subscriberDoc.id), {
      name,
      tier,
      emailConsent,
      notifyTours: notifyPreferences?.tours ?? true,
      notifyMusic: notifyPreferences?.music ?? true,
      notifyMerch: notifyPreferences?.merch ?? true,
      notifyBeats: notifyPreferences?.beats ?? false,
      updatedAt: serverTimestamp(),
      active: true,
    });
    return subscriberDoc.id;
  }

  // Create new subscriber
  const docRef = await addDoc(collection(db, SUBSCRIBERS_COLLECTION), {
    email,
    name,
    tier,
    emailConsent,
    notifyTours: notifyPreferences?.tours ?? true,
    notifyMusic: notifyPreferences?.music ?? true,
    notifyMerch: notifyPreferences?.merch ?? true,
    notifyBeats: notifyPreferences?.beats ?? false,
    subscribedAt: serverTimestamp(),
    active: true,
  });

  return docRef.id;
}

// Unsubscribe
export async function unsubscribe(email: string): Promise<void> {
  const existing = await getDocs(
    query(collection(db, SUBSCRIBERS_COLLECTION), where("email", "==", email))
  );
  
  if (!existing.empty) {
    await updateDoc(doc(db, SUBSCRIBERS_COLLECTION, existing.docs[0].id), {
      active: false,
      emailConsent: false,
      updatedAt: serverTimestamp(),
    });
  }
}

// Get all active subscribers who consented to email
export async function getActiveSubscribers(): Promise<Subscriber[]> {
  const q = query(
    collection(db, SUBSCRIBERS_COLLECTION),
    where("active", "==", true),
    where("emailConsent", "==", true)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    subscribedAt: doc.data().subscribedAt?.toDate() || new Date(),
  } as Subscriber));
}

// Get subscribers for a specific notification type
export async function getSubscribersForNotification(
  type: NotificationEvent["type"]
): Promise<Subscriber[]> {
  const notifyField = getNotifyField(type);
  const q = query(
    collection(db, SUBSCRIBERS_COLLECTION),
    where("active", "==", true),
    where("emailConsent", "==", true),
    where(notifyField, "==", true)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    subscribedAt: doc.data().subscribedAt?.toDate() || new Date(),
  } as Subscriber));
}

// Create a notification event
export async function createNotificationEvent(
  type: NotificationEvent["type"],
  title: string,
  message: string,
  link?: string
): Promise<string> {
  const docRef = await addDoc(collection(db, NOTIFICATIONS_COLLECTION), {
    type,
    title,
    message,
    link,
    sentAt: serverTimestamp(),
    sentToCount: 0,
  });
  return docRef.id;
}

// Log that a notification was sent
export async function markNotificationSent(
  notificationId: string, 
  sentToCount: number
): Promise<void> {
  await updateDoc(doc(db, NOTIFICATIONS_COLLECTION, notificationId), {
    sentAt: serverTimestamp(),
    sentToCount,
  });
}

// Get recent notifications
export async function getRecentNotifications(limitCount: number = 10): Promise<NotificationEvent[]> {
  const q = query(
    collection(db, NOTIFICATIONS_COLLECTION),
    orderBy("sentAt", "desc"),
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.slice(0, limitCount).map(doc => ({
    id: doc.id,
    ...doc.data(),
    sentAt: doc.data().sentAt?.toDate() || new Date(),
  } as NotificationEvent));
}

function getNotifyField(type: NotificationEvent["type"]): string {
  switch (type) {
    case "tour":
    case "live-show":
      return "notifyTours";
    case "music-release":
      return "notifyMusic";
    case "merch-drop":
      return "notifyMerch";
    case "beat-drop":
      return "notifyBeats";
    default:
      return "notifyMusic";
  }
}