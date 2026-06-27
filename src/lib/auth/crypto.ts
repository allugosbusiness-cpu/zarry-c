/**
 * Cryptographic utilities for session management.
 * Uses AES-256-GCM for encrypting session cookies.
 */

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32; // 256 bits

/**
 * Derive an encryption key from the server secret.
 * In production, set AUTH_ENCRYPTION_KEY as an environment variable (32 hex-encoded bytes = 64 chars).
 */
function getEncryptionKey(): Buffer {
  const keyFromEnv = process.env.AUTH_ENCRYPTION_KEY;
  
  if (keyFromEnv && keyFromEnv.length >= 32) {
    // Use provided key (should be a 64-char hex string = 32 bytes)
    if (keyFromEnv.length === 64 && /^[0-9a-fA-F]+$/.test(keyFromEnv)) {
      return Buffer.from(keyFromEnv, "hex");
    }
    // If it's a raw string, hash it to get a proper 32-byte key
    const crypto = require("crypto");
    return crypto.createHash("sha256").update(keyFromEnv).digest();
  }
  
  // Fallback for development: use a derived key from a known secret
  // WARNING: This is NOT production-safe. Set AUTH_ENCRYPTION_KEY in env.
  const crypto = require("crypto");
  return crypto.createHash("sha256").update("zarryc-dev-encryption-key-fallback").digest();
}

/**
 * Encrypt a plaintext string.
 * Returns: base64(iv + ciphertext + authTag)
 */
export function encrypt(plaintext: string): string {
  const crypto = require("crypto");
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  
  // Combine iv + encrypted + authTag, base64 encode
  const combined = Buffer.concat([
    iv,
    Buffer.from(encrypted, "hex"),
    Buffer.from(authTag, "hex"),
  ]);
  
  return combined.toString("base64");
}

/**
 * Decrypt an encrypted string.
 * Returns: original plaintext or null if decryption fails.
 */
export function decrypt(encryptedData: string): string | null {
  try {
    const crypto = require("crypto");
    const key = getEncryptionKey();
    const combined = Buffer.from(encryptedData, "base64");
    
    const iv = combined.subarray(0, IV_LENGTH);
    const authTag = combined.subarray(combined.length - TAG_LENGTH);
    const encryptedText = combined.subarray(IV_LENGTH, combined.length - TAG_LENGTH);
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    
    return decrypted;
  } catch (error) {
    console.error("[Crypto] Decryption failed:", error);
    return null;
  }
}

/**
 * Generate a secure random token for CSRF protection.
 */
export function generateCSRFToken(): string {
  const crypto = require("crypto");
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Constant-time string comparison to prevent timing attacks.
 */
export function safeCompare(a: string, b: string): boolean {
  const crypto = require("crypto");
  try {
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}