/**
 * Applies CORS config to Firebase Storage bucket.
 * Uses @google-cloud/storage with Application Default Credentials.
 * Firebase CLI is already logged in, so ADC should work.
 * 
 * Run: node scripts/apply-cors.js
 */
const { Storage } = require("@google-cloud/storage");

const corsConfig = [
  {
    origin: ["*"],
    method: ["GET", "HEAD", "PUT", "POST", "DELETE"],
    responseHeader: ["Content-Type", "x-goog-*", "Content-Disposition"],
    maxAgeSeconds: 3600,
  },
];

async function main() {
  try {
    const storage = new Storage({ projectId: "zarry-c" });
    const bucket = storage.bucket("zarry-c.firebasestorage.app");
    
    console.log("Applying CORS to bucket:", "zarry-c.firebasestorage.app");
    await bucket.setCorsConfiguration(corsConfig);
    console.log("✅ CORS configuration applied successfully!");
    
    // Verify
    const [metadata] = await bucket.getMetadata();
    console.log("Bucket CORS:", JSON.stringify(metadata.cors, null, 2));
  } catch (err) {
    console.error("❌ Error:", err.message);
    console.error("");
    console.error("To fix CORS manually:");
    console.error("1. Go to https://console.cloud.google.com/storage/browser/zarry-c.firebasestorage.app");
    console.error("2. Click on the bucket");
    console.error("3. Go to 'Configuration' tab (NOT Permissions)");
    console.error("4. Find CORS section and click 'Edit'");
    console.error("5. Paste this JSON:");
    console.error(JSON.stringify(corsConfig, null, 2));
    console.error("");
    console.error("Or use Firebase Console:");
    console.error("1. Go to https://console.firebase.google.com/project/zarry-c/storage");
    console.error("2. Click 'Rules' tab and ensure rules allow reads/writes for your auth setup");
    console.error("3. Storage CORS is set via GCP Console (link above)");
  }
}

main();