/**
 * Auth Configuration
 * Centralized security settings for the admin authentication system.
 */
export const AUTH_CONFIG = {
  /** Session expiry in milliseconds (24 hours) */
  SESSION_EXPIRY_MS: 24 * 60 * 60 * 1000,
  
  /** Token refresh threshold (1 hour before expiry) */
  TOKEN_REFRESH_THRESHOLD_MS: 60 * 60 * 1000,
  
  /** Rate limiting: max login attempts per IP per window */
  MAX_LOGIN_ATTEMPTS: 5,
  
  /** Rate limiting window in milliseconds (15 minutes) */
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000,
  
  /** Rate limiting: lockout duration (30 minutes) */
  LOCKOUT_DURATION_MS: 30 * 60 * 1000,
  
  /** Firebase Admin SDK role check field */
  ADMIN_ROLE_FIELD: "role",
  
  /** Admin role value */
  ADMIN_ROLE_VALUE: "admin",
  
  /** Allowed admin email domains */
  ALLOWED_ADMIN_EMAILS: ["allugosbusiness@gmail.com"],
  
  /** Whether to require email verification before admin access */
  REQUIRE_EMAIL_VERIFICATION: true,
  
  /** Cookie name for session token */
  SESSION_COOKIE_NAME: "zarryc_admin_session",
  
  /** How often to clean up expired rate limit entries (ms) */
  RATE_LIMIT_CLEANUP_INTERVAL_MS: 60 * 60 * 1000,
};