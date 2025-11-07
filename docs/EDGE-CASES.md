# Edge Case Handling

## ✅ Implemented Edge Cases

### 1. **Email Conflicts**

**Scenario:** User signs in with email that belongs to opponent profile created by someone else.

**Handling:**
- Auto-linking only happens if opponent profile is not yet linked (`user_id IS NULL`)
- If already linked to another account, shows "Already Linked" error
- Provides clear explanation and contact admin option

**Files:**
- `lib/auth.ts` - Only links if `!opponent.user_id`
- `app/auth/error/page.tsx` - EmailConflict error page
- `app/invite/[token]/complete/page.tsx` - Already linked detection

**Error Message:**
```
⚠️ Already Linked
This opponent profile is already linked to another user account.

💡 This means: Someone has already claimed this profile.
Each profile can only be linked to one account.

Need help? Contact admin at a13158y@gmail.com
```

---

### 2. **Expired Invite Tokens**

**Scenario:** User clicks on QR invite link that has expired (>7 days old).

**Handling:**
- Clear expiration message with timeframe
- Instructions on how to request new invite
- Contact admin option

**Files:**
- `app/invite/[token]/page.tsx`

**Error Message:**
```
🕐 Invite Expired
This invite link has expired (invites are valid for 7 days).

💡 To get access: Ask the person who sent you this link to
generate a new QR code from their Opponents page.

Need help? Contact admin at a13158y@gmail.com
```

---

### 3. **Invalid Invite Tokens**

**Scenario:** User accesses invite link that doesn't exist or was deleted by admin.

**Handling:**
- Explains possible reasons (wrong link, admin invalidation)
- Contact admin option

**Files:**
- `app/invite/[token]/page.tsx`

**Error Message:**
```
❌ Invalid Invite
This invite link is invalid or has been removed by the administrator.

💡 Possible reasons: The link may be incorrect, or it was
invalidated by an admin.

Need help? Contact admin at a13158y@gmail.com
```

---

### 4. **Google SSO Email Mismatch**

**Scenario:** User signs in with Google and email doesn't match opponent profile email.

**Handling:**
- Shows confirmation screen before linking
- Displays both accounts clearly
- Lists exactly what will happen
- Requires explicit confirmation

**Files:**
- `app/invite/[token]/complete/page.tsx`

**Confirmation Screen:**
```
Confirm Account Linking

You're about to link:
👤 Your account: user@gmail.com
      ↓
🎯 Opponent profile: Bob Smith (bob@example.com)

This will:
✓ Connect your account to this profile
✓ Transfer all past match history
✓ Make you appear as this opponent in others' match logs
✓ Keep your existing ELO rating

⚠️ This action cannot be undone

[Cancel] [Confirm and Link]
```

---

### 5. **Duplicate Opponents**

**Scenario:** Multiple opponent profiles exist with same email or similar names.

**Handling:**
- Admin panel has duplicate detection tool
- Shows grouped duplicates
- Provides merge functionality
- Preserves match history

**Files:**
- `app/dashboard/admin/duplicates/page.tsx`
- `app/api/admin/duplicates/route.ts`
- `app/api/admin/opponents/merge/route.ts`

**Features:**
- Detects by exact email match (case-insensitive)
- Detects by similar names (Levenshtein distance)
- Admin can merge duplicates
- All matches transferred to primary opponent

---

### 6. **Photo Upload Failures (Offline/Network Error)**

**Scenario:** User tries to upload photo but network fails or device is offline.

**Handling:**
- Match data is saved separately from photo
- Clear error message indicating data is safe
- Offers "I'll Add Photo Later" option
- User can retry from match history later

**Files:**
- `app/dashboard/match/[id]/photo/PhotoUploadForm.tsx`
- `app/dashboard/opponents/PhotoUploadModal.tsx`

**Error Message (Match Photo):**
```
🔴 Network error. Your match is saved. You can retry
uploading the photo later from your match history.

✓ Don't worry - your match data is already saved!

[📷 Upload Photo] [I'll Add Photo Later]
```

**Error Message (Opponent Photo):**
```
🔴 Network error. Please check your connection and try again.
You can also retry later - the opponent info is saved.

[Try Again] [Close]
```

---

## Contact Admin Information

All error pages include:
```
🟡 Need help?
Contact admin at a13158y@gmail.com
```

This appears on:
- Invalid invite pages
- Expired invite pages
- Already linked errors
- Auth errors

---

## Graceful Degradation

### Photo Uploads
- ✅ Match data saved independently
- ✅ Photo upload is optional
- ✅ Can be skipped entirely
- ✅ Can be retried later
- ✅ Offline-friendly (LocalStorage for match state)

### Invite Flow
- ✅ Clear state validation (invalid/expired/redeemed)
- ✅ Prevents double-linking
- ✅ Explicit confirmation required
- ✅ Cannot be undone (intentional safety)

### Rate Limiting
- ✅ User-friendly error messages
- ✅ Shows time until reset
- ✅ Explains the limit
- ✅ Data already saved (matches, opponents)

---

## Testing Edge Cases

### Test Expired Invite:
```bash
# 1. Create invite
# 2. In DB, update expires_at to past date
UPDATE invite_tokens SET expires_at = NOW() - INTERVAL '1 day' WHERE id = X;
# 3. Access invite link
# ✅ Should show "Invite Expired" message
```

### Test Already Linked:
```bash
# 1. Create opponent
# 2. Link to user via invite
# 3. Try to access same invite link again
# ✅ Should show "Already Linked" message
```

### Test Network Error:
```bash
# 1. Start match photo upload
# 2. Turn off network in DevTools
# 3. Try to upload
# ✅ Should show network error with retry option
# ✅ Match data should still be in dashboard
```

### Test Duplicate Detection:
```bash
# 1. Create 2 opponents with same email
# 2. Go to /dashboard/admin/duplicates
# ✅ Should show them grouped together
# 3. Click merge
# ✅ Should merge into one opponent
```

---

## User Experience Principles

1. **Always Save Critical Data**: Match scores, opponent info saved separately from optional features (photos)

2. **Clear Next Steps**: Every error tells user what to do next

3. **Contact Admin Easy**: Admin email visible on all error pages

4. **Prevent Data Loss**: Offline support via localStorage, separate saves for core vs optional data

5. **Explicit Confirmations**: Destructive actions (linking, merging) require confirmation with clear explanation

6. **Friendly Language**: "Oops!" not "Error 500", "Ask for new link" not "Token expired"

7. **Visual Hierarchy**: Icons + colors (🔴 red for errors, 💡 blue for tips, 🟡 yellow for help)

