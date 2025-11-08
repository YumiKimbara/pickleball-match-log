# Magic Link Authentication Design

**Date:** 2025-11-04
**Status:** Approved
**Implementation:** Pending

## Overview

Implement magic link email authentication using NextAuth's Postgres adapter and Resend email provider. This will enable passwordless login alongside the existing Google OAuth.

## Context

The application currently has Google OAuth authentication working, but the magic link feature shown in the sign-in UI is non-functional. The Resend provider is commented out in `lib/auth.ts` with a TODO about needing a database adapter. Users are unable to sign in via email because:

1. No database adapter configured (NextAuth needs to store verification tokens)
2. Resend provider is disabled
3. No Resend API key configured
4. Required database tables missing

## Requirements

- Users must be able to sign in with email (passwordless magic link)
- Magic links should be delivered via email within seconds
- Token expiration and security handled automatically
- Coexist with existing Google OAuth
- Use existing Postgres database (no new infrastructure)
- Follow NextAuth best practices

## Design Decision

### Chosen Approach: NextAuth Postgres Adapter + Resend

We will use NextAuth's official Postgres adapter to store verification tokens and Resend for email delivery. This approach was selected because:

1. **Integration:** Sign-in page already expects this pattern (`signIn("resend", ...)`)
2. **Maintenance:** Official NextAuth pattern, well-documented and maintained
3. **Security:** Token generation, expiry, and cleanup handled by NextAuth
4. **Simplicity:** Resend has simple API, generous free tier (3,000 emails/month)
5. **Consistency:** Works seamlessly with existing Google OAuth

### Alternatives Considered

**Custom Token System:** Rejected because it requires building and maintaining custom token generation, storage, verification, and cleanup logic. Higher security risk and more code to maintain.

**Nodemailer Provider:** Rejected because SMTP configuration is more complex than Resend's API-based approach. Gmail requires app passwords, SendGrid requires account setup. Resend is more developer-friendly.

## Implementation Details

### Dependencies

**New packages required:**
- `@auth/pg-adapter` - Official NextAuth Postgres adapter
- `@neondatabase/serverless` - Neon Postgres client (for adapter pool)

### Database Changes

**New tables (created by migration):**

1. **verification_token**
   - `identifier` (VARCHAR) - User's email address
   - `token` (TEXT) - Unique verification token
   - `expires` (TIMESTAMP) - Token expiration time
   - Primary key: `(identifier, token)`

2. **accounts**
   - Links OAuth providers (Google) to users
   - Stores provider account details
   - Required for multi-provider support

3. **sessions**
   - Optional session storage (can use JWT-only mode)
   - Stores active user sessions

**Migration file:** `lib/db/migrations/001-nextauth-tables.sql`

### Architecture Components

**1. Database Adapter Configuration**
```typescript
import { PostgresAdapter } from "@auth/pg-adapter"
import { Pool } from "@neondatabase/serverless"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = PostgresAdapter(pool)
```

**2. Resend Provider Configuration**
```typescript
Resend({
  apiKey: process.env.RESEND_API_KEY!,
  from: "onboarding@resend.dev" // Resend's test domain
})
```

**3. Environment Variables**
- `RESEND_API_KEY` - API key from Resend dashboard (to be obtained)

### Data Flow

**Sign-in Flow:**
1. User enters email in sign-in form
2. Form submits to NextAuth: `signIn("resend", { email })`
3. NextAuth generates cryptographically secure token
4. Token stored in `verification_token` table with expiration (default: 24 hours)
5. Resend API called to send email with magic link
6. Email contains link: `http://localhost:3000/api/auth/callback/resend?token=xxx&email=yyy`

**Verification Flow:**
1. User clicks link in email
2. NextAuth receives callback at `/api/auth/callback/resend`
3. Token validated against database (checks expiration, match)
4. If valid:
   - Existing user: Load user from database
   - New user: Create user via `signIn` callback (existing logic handles this)
5. Session established (JWT or database session)
6. Token consumed (deleted from database)
7. Redirect to `/dashboard`

### Email Template

Resend sends a default NextAuth email template containing:
- Subject: "Sign in to Pickleball Tracker"
- Body: "Click here to sign in: [Magic Link Button]"
- Link expires in 24 hours

Custom email template can be added later if desired.

### Error Handling

| Error Scenario | Behavior |
|---------------|----------|
| Token expired | NextAuth shows error page, user must request new link |
| Email delivery fails | Resend API error shown, user can retry submission |
| Invalid token | NextAuth rejects, redirects to sign-in with error |
| Email already registered | Works correctly - finds existing user and signs them in |
| Missing Resend API key | Runtime error (caught during development) |

### Security Considerations

- Tokens are cryptographically random (NextAuth uses `crypto.randomBytes`)
- 24-hour expiration prevents stale token usage
- Tokens are single-use (deleted after verification)
- HTTPS required in production (enforced by NextAuth)
- Rate limiting handled by Resend (100 emails/day on free tier)

### Resend Setup Steps

1. Sign up at https://resend.com
2. Verify email address
3. Navigate to API Keys section
4. Create new API key (name: "Pickleball PWA Dev")
5. Copy key to `.env.local` as `RESEND_API_KEY`

**Note:** Free tier includes onboarding domain (`onboarding@resend.dev`) for immediate testing. Custom domain verification optional.

## Testing Plan

1. **Happy Path - New User:**
   - Enter new email → Receive magic link → Click link → User created → Redirected to dashboard

2. **Happy Path - Existing User:**
   - Enter existing email → Receive magic link → Click link → Session created → Redirected to dashboard

3. **Token Expiration:**
   - Request magic link → Wait 24+ hours → Click expired link → Error shown

4. **Multiple Providers:**
   - Sign in with Google → Sign out → Sign in with email → Verify same user account

5. **Invalid Token:**
   - Manually modify token in URL → Attempt access → Error shown

6. **Email Delivery:**
   - Check spam folder if not received
   - Verify Resend dashboard shows delivery status

## Success Criteria

- Users can sign in using email (magic link sent within 5 seconds)
- Magic links work correctly (token validation, user creation/lookup)
- Email and Google OAuth coexist without conflicts
- Tokens expire after 24 hours
- No console errors or warnings
- Resend free tier usage stays within limits

## Future Enhancements

- Custom email template with branding
- Custom domain for from address (e.g., `noreply@pickleballtracker.app`)
- Email verification for Google OAuth users
- Rate limiting for magic link requests (prevent abuse)
