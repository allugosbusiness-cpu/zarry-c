/**
 * Set CORS on Firebase Storage bucket using the Google Cloud Storage JSON API.
 * This doesn't require the gcloud SDK - it uses the Storage REST API.
 * 
 * Usage: node scripts/set-cors.mjs
 */
import { execSync } from "child_process";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const corsConfig = JSON.parse(readFileSync(join(__dirname, "..", "cors.json"), "utf-8"));
const bucketName = "zarry-c.firebasestorage.app";

try {
  // Try using Google Cloud Storage JSON API via curl
  // First get an access token
  console.log("Getting access token...");
  const token = execSync('npx -y google-auth-library@9 --token', {
    encoding: "utf-8",
    timeout: 30000,
  }).trim();

  // If token approach fails, try using firebase-tools directly
  console.log("Setting CORS policy on bucket:", bucketName);
  
  const result = execSync(
    `npx -p @google-cloud/storage -c "node -e \\"
      const {Storage} = require('@google-cloud/storage');
      const storage = new Storage();
      async function main() {
        await storage.bucket('${bucketName}').setCorsConfiguration(${JSON.stringify(corsConfig)});
        console.log('CORS configuration applied successfully!');
      }
      main().catch(e => { console.error(e.message); process.exit(1); });
    \\""`,
    { encoding: "utf-8", timeout: 60000 }
  );
  console.log(result);
} catch (err) {
  console.error("Failed:", err.message);
  console.log("\nAlternative: Install Google Cloud SDK manually and run:");
  console.log("  gsutil cors set cors.json gs://zarry-c.firebasestorage.app");
}