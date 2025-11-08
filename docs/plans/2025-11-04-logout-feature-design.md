# Logout Feature Design

**Date:** 2025-11-04
**Status:** Approved
**Implementation:** Pending

## Overview

Add a logout button to the dashboard that allows users to sign out of their session and return to the sign-in page.

## Context

The application currently uses NextAuth for authentication with Google OAuth. The `signOut` function is exported from `lib/auth.ts` but is not integrated into any UI component. Users have no way to log out without clearing their browser cookies manually.

## Requirements

- Users must be able to log out from the dashboard
- Logout should clear the session and redirect to the sign-in page
- UI should match the existing mobile-first design system
- Implementation should follow Next.js 15 App Router best practices

## Design Decision

### Chosen Approach: Server Action with Form

We will use a server action pattern with a form-based logout button. This approach was selected because:

1. **Consistency:** Matches the existing server-first architecture (dashboard already uses server components)
2. **Simplicity:** Single file change, no new API routes or client components needed
3. **Progressive Enhancement:** Works without JavaScript (form submission is standard HTML)
4. **Best Practices:** Follows Next.js 15 App Router recommended patterns

### Alternatives Considered

**Client Component with API Route:** Rejected because it adds unnecessary complexity (3 files vs 1) and requires client-side JavaScript. Offers better loading states but overkill for a simple logout action.

**Direct NextAuth Link:** Rejected because it shows NextAuth's generic confirmation page, adding an extra click and breaking the branded experience.

## Implementation Details

### File Changes

**Single file modification:** `app/dashboard/page.tsx`

### Architecture

1. **Server Action Function**
   - Add async server action at top of file
   - Calls NextAuth's `signOut()` with redirect parameter
   - Marked with `'use server'` directive

2. **UI Integration**
   - Modify header section (lines 19-26) to use flexbox layout
   - Add form with server action on the right side
   - Button styled to match existing design (subtle, non-intrusive)

3. **Visual Placement**
   ```
   ┌─────────────────────────────────────┐
   │ Dashboard              [Sign Out]   │
   │ Welcome, User!                      │
   │ ELO: 1500                           │
   │ Role: user                          │
   └─────────────────────────────────────┘
   ```

### Data Flow

1. User clicks "Sign Out" button
2. Form submission triggers server action
3. Server action calls `signOut({ redirectTo: '/auth/signin' })`
4. NextAuth invalidates session and cookies
5. User redirected to sign-in page

### Error Handling

NextAuth handles signout errors internally. If signout fails (rare), user remains on current page with session intact. No custom error UI needed for this operation.

### Security Considerations

- Server action prevents CSRF attacks (Next.js handles tokens automatically)
- No sensitive data exposed in client code
- Session invalidation handled by NextAuth security best practices

## Testing Plan

1. **Happy Path:** Click logout → redirect to sign-in → verify session cleared
2. **Re-auth:** After logout, verify user can sign back in successfully
3. **Mobile:** Test button tap target size (should meet 56px+ guideline)
4. **Progressive Enhancement:** Test with JavaScript disabled (should still work)

## Success Criteria

- Users can log out with a single click from the dashboard
- After logout, attempting to access `/dashboard` redirects to sign-in
- UI is consistent with existing design system
- No console errors or warnings
