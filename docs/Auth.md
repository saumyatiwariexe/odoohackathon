StockSense – Auth Spec
Sep 26, 2026 · @SAM
This is the authentication and authorization spec for StockSense, a modular Inventory Management System. Full product context: Document. It covers signup/login, password hashing, OTP-based password reset, and JWT session handling — written so the auth engineer can build this module without reading anything else first.
User Model & Roles
users
  id            uuid, pk
  name          text
  email         text, unique, not null
  password_hash text, not null       -- bcrypt hash, never plaintext or a custom scheme
  role          enum('inventory_manager','warehouse_staff')
  created_at    timestamptz
Role gates what the frontend shows and what the API allows: inventory_manager can access Settings (Warehouse/Location) and Product create/edit; warehouse_staff can operate Receipts/Deliveries/Transfers/Adjustments and view Products, but not edit them. Enforce this server-side (middleware checking req.user.role), not just by hiding UI — hiding a button is not access control.
Signup & Login Flow
Signup: name, email, password, role → validate email format + uniqueness, enforce a minimum password policy (≥ 8 chars, mixed case, 1 number — tune as needed) → hash password (see Password Hashing) → insert users row → issue tokens → redirect to Inventory Dashboard.
Login: email + password → look up user by email → bcrypt.compare(enteredPassword, storedHash) → on match, issue tokens and redirect to Dashboard; on mismatch, generic “invalid email or password” error (never reveal whether the email exists — that's an account-enumeration leak).
Rate limiting: throttle login attempts per IP/email (e.g. 5 attempts / 15 min) to blunt brute-force and credential-stuffing attempts.
Password Hashing (decided)
Use bcrypt (or argon2 if the team prefers) — never a hand-rolled scheme. A prior idea of hashing to a random number in a small range (e.g. 4–100) and storing a Fibonacci-derived key was rejected: the keyspace is only ~97 values, so it's brute-forceable in microseconds regardless of the transform on top, and it has no per-user salt.
// Signup
const bcrypt = require('bcrypt');
const passwordHash = await bcrypt.hash(plainPassword, 12); // cost factor 12
// store passwordHash — never the plain password

// Login
const isValid = await bcrypt.compare(enteredPassword, storedHash);
bcrypt generates and embeds a random salt per password automatically — no separate salt column needed. Cost factor 12 is a reasonable default; raise it as hardware gets faster.
OTP-Based Password Reset
password_resets
  id           uuid, pk
  user_id      uuid, fk -> users.id
  otp_hash     text        -- bcrypt hash of the OTP, same reason as passwords
  expires_at   timestamptz -- e.g. now() + 10 minutes
  used         boolean, default false
Flow:
1. User submits email on “Forgot Password” → server generates a 6-digit numeric OTP → stores bcrypt.hash(otp, 10) (lower cost factor is fine here since OTPs are short-lived) → emails the raw OTP to the user (never store the raw OTP).
2. User submits OTP + new password → server finds the latest unused, unexpired reset row for that user → bcrypt.compare(enteredOtp, otp_hash) → on match: hash the new password, update users.password_hash, mark the reset row used = true.
3. Invalidate all other outstanding reset rows for that user once one is used.
Email delivery: any transactional provider (SendGrid, SES) in prod; a local SMTP catcher (e.g. Mailhog) for dev so the team isn't blocked by real email setup.
JWT Token Lifecycle
• Access token: short-lived (15–30 min), signed (HS256 or RS256), payload = { sub: user_id, role, iat, exp }. Sent as Authorization: Bearer <token> on every API call; API middleware verifies signature + expiry + role on protected routes.
• Refresh token: longer-lived (7–30 days), stored httpOnly + secure cookie (not localStorage — avoids XSS token theft), used only to mint a new access token via POST /auth/refresh.
• Logout: clears the refresh cookie; optionally maintain a server-side revocation list for refresh tokens if immediate logout-everywhere is required.
• Secret management: JWT signing secret in environment variables, never committed to Git.

POST /auth/signup
Create account, hash password, issue tokens
POST /auth/login
Verify credentials, issue tokens
POST /auth/refresh
Exchange refresh token for a new access token
POST /auth/logout
Clear refresh cookie / revoke
POST /auth/forgot-password
Generate + email OTP
POST /auth/reset-password
Verify OTP, set new password
GET /auth/me
Return current user (from access token) for the frontend to bootstrap role-based UI

