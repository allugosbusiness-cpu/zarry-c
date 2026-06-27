/**
 * Apply CORS configuration to Firebase Storage bucket using the Google Cloud Storage JSON API.
 * Uses Firebase anonymous auth to get a token, then applies CORS via the GCS JSON API.
 * 
 * Usage: node scripts/apply-cors.mjs
 */
import https from "https";

const corsConfig = [
  {
    origin: ["*"],
    method: ["GET", "HEAD", "PUT", "POST", "DELETE"],
    responseHeader: ["Content-Type", "x-goog-*", "Content-Disposition"],
    maxAgeSeconds: 3600,
  },
];

function httpsRequest(hostname, path, method, headers, body) {
  return new Promise((resolve, reject) => {
    const options = { hostname, path, method, headers, rejectUnauthorized: false };
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve({ status: res.statusCode, data }));
    });
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

async function main() {
  // Get an anonymous Firebase auth token
  console.log("1. Getting Firebase auth token...");
  const tokenRes = await httpsRequest(
    "identitytoolkit.googleapis.com",
    "/v1/accounts:signUp?key=AIzaSyAJ9QCNrEZCWxRscgNVfCCnfdOtiTHKlBg",
    "POST",
    { "Content-Type": "application/json" },
    JSON.stringify({ returnSecureToken: true })
  );

  if (tokenRes.status !== 200) {
    console.error("Auth failed:", tokenRes.status, tokenRes.data.substring(0, 200));
    console.log("\nManual step: Go to https://console.cloud.google.com");
    console.log("1. Search for 'zarry-c.firebasestorage.app' in Cloud Storage");
    console.log("2. Click on the bucket");
    console.log("3. Go to Configuration tab");
    console.log("4. Click 'Edit CORS' under CORS section");
    console.log("5. Paste:");
    console.log(JSON.stringify(corsConfig, null, 2));
    process.exit(1);
  }

  const token = JSON.parse(tokenRes.data).idToken;
  console.log("Got token:", token.substring(0, 30) + "...");

  // Try both bucket name formats
  const bucketNames = [
    "zarry-c.firebasestorage.app", // New format
    "zarry-c.appspot.com"          // Legacy format
  ];

  for (const bucketName of bucketNames) {
    console.log(`\n2. Trying bucket: ${bucketName}`);
    
    // First check if bucket exists
    const checkRes = await httpsRequest(
      "storage.googleapis.com",
      `/storage/v1/b/${bucketName}?fields=name%2Ccors`,
      "GET",
      { "Authorization": `Bearer ${token}` },
      null
    );
    
    if (checkRes.status !== 200) {
      console.log(`   Bucket ${bucketName} not accessible: ${checkRes.status}`);
      continue;
    }
    
    console.log(`   Current config: ${checkRes.data.substring(0, 200)}`);
    
    // Apply CORS
    const corsBody = JSON.stringify({ cors: corsConfig });
    
    const result = await httpsRequest(
      "storage.googleapis.com",
      `/storage/v1/b/${bucketName}`,
      "PATCH",
      {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      corsBody
    );
    
    if (result.status === 200) {
      const data = JSON.parse(result.data);
      console.log(`   ✅ CORS applied successfully to ${bucketName}!`);
      console.log(`   CORS config now:`, JSON.stringify(data.cors, null, 2));
      process.exit(0);
    } else {
      console.log(`   ❌ Failed: ${result.status} - ${result.data.substring(0, 200)}`);
    }
  }
  
  console.log("\n❌ Could not apply CORS automatically.");
  console.log("Please apply CORS manually:");
  console.log("1. Go to https://console.cloud.google.com/storage/browser/zarry-c.firebasestorage.app");
  console.log("2. Click Configuration tab");
  console.log("3. Edit CORS and paste:", JSON.stringify(corsConfig, null, 2));
}

main().catch(console.error);