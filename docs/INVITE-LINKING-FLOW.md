# QR Invite & Account Linking Flow

Complete documentation for the QR code invite and account linking feature.

## ✅ Complete Feature List

| 機能 | Status | Implementation |
|------|--------|----------------|
| QRコード表示 | ✅ DONE | `/dashboard/opponents/[id]/qr` |
| メール or Google SSO | ✅ DONE | Both options available |
| 既存メール → リンク | ✅ DONE | Auto-detect existing accounts |
| 新規メール → 作成 & リンク | ✅ DONE | Create new user + link |
| **明示的な確認** | ✅ **NEW!** | Confirmation screen before linking |

## 🔄 Complete User Flow

### Step 1: Generate QR Code
**User Action:** Click "QR" button on opponent card

**URL:** `/dashboard/opponents/123/qr`

**What Happens:**
- System creates invite token (7-day expiration)
- Generates QR code with invite URL
- Displays shareable link

```typescript
// Auto-creates invite token
const invite = await db.createInviteToken(opponentId, session.user.id);
const inviteUrl = `${process.env.NEXTAUTH_URL}/invite/${invite.token}`;
```

---

### Step 2: Scan QR / Click Link
**User Action:** Opponent scans QR code or clicks shared link

**URL:** `/invite/{token}`

**What Happens:**
- Validates invite token (not expired, not redeemed)
- Shows opponent name if available
- Displays authentication options:
  - Google OAuth
  - Email Magic Link
- Pre-fills email if opponent has one

**Edge Cases:**
- ❌ Invalid token → "Invalid Invite" message
- ❌ Already redeemed → "Already Redeemed" message  
- ❌ Expired → "Invite Expired" message

---

### Step 3: Authenticate
**User Action:** Sign in with Google or Email

**What Happens:**
- Google: Standard OAuth flow
- Email: Send magic link → Click link → Verify

**Redirects to:** `/invite/{token}/complete`

---

### Step 4: **NEW! Confirmation Screen** 🆕
**URL:** `/invite/{token}/complete`

**What User Sees:**

```
┌─────────────────────────────────────────┐
│   Confirm Account Linking                │
│                                           │
│   You're about to link:                  │
│                                           │
│   👤 Your account                        │
│      user@example.com                    │
│         ↓                                 │
│   🎯 Opponent profile                    │
│      Bob Smith                            │
│      bob@example.com                      │
│      ELO: 1520                           │
│                                           │
│   This will:                             │
│   ✓ Connect your account to this profile │
│   ✓ Transfer all past match history     │
│   ✓ Make you appear as this opponent    │
│   ✓ Keep your existing ELO rating       │
│                                           │
│   [Cancel]  [Confirm and Link]          │
│                                           │
│   This action cannot be undone           │
└─────────────────────────────────────────┘
```

**User Choices:**
- **Cancel** → Go to dashboard (no linking)
- **Confirm and Link** → Proceed with linking

**Edge Case:**
- ⚠️ Already linked → Shows "Already Linked" message (can't link twice)

---

### Step 5: Link & Success
**User Action:** Click "Confirm and Link"

**What Happens:**
```typescript
// Link opponent to user
if (opponent && !opponent.user_id) {
  await db.linkOpponentToUser(opponent.id, session.user.id);
}

// Mark invite as redeemed
await db.redeemInviteToken(invite.id, session.user.id);
```

**Redirects to:** `/invite/success?name={opponent_name}`

**Success Screen:**
```
┌─────────────────────────────────────────┐
│   🎉 Account Linked!                    │
│                                           │
│   Your account is now linked to          │
│   Bob Smith                              │
│                                           │
│   All your match history and stats are   │
│   now connected to your account.         │
│                                           │
│   What's next?                           │
│   ✓ View your match history             │
│   ✓ Track your ELO progress             │
│   ✓ Log new matches                     │
│   ✓ Create your own opponents           │
│                                           │
│   [Go to Dashboard]                     │
└─────────────────────────────────────────┘
```

---

## 📊 Database Changes

### Before Linking
```sql
-- Opponent is a "guest"
opponents (
  id: 123,
  name: "Bob Smith",
  email: "bob@example.com",
  user_id: NULL,  -- Not linked
  elo: 1520
)

-- No user account yet
users (
  -- Empty, Bob doesn't exist
)
```

### After Linking
```sql
-- User account created
users (
  id: 456,
  email: "bob@example.com",
  role: "user",
  elo: 1500  -- Gets default, but opponent ELO preserved
)

-- Opponent now linked
opponents (
  id: 123,
  name: "Bob Smith",
  email: "bob@example.com",
  user_id: 456,  -- Linked!
  elo: 1520  -- Preserved
)

-- Invite marked as used
invite_tokens (
  id: 789,
  token: "abc-123...",
  opponent_id: 123,
  redeemed_at: NOW(),
  redeemed_by_user_id: 456
)
```

---

## 🔐 Security & Validation

### Token Validation
- ✅ Token must exist in database
- ✅ Not expired (7-day default)
- ✅ Not already redeemed
- ✅ User must be authenticated

### Linking Validation
- ✅ Opponent must exist
- ✅ Opponent not already linked (`user_id IS NULL`)
- ✅ User owns the session
- ✅ Confirmation required before linking

### One-Time Use
- ✅ Token marked as redeemed after use
- ✅ Cannot reuse same token
- ✅ Cannot link same opponent twice

---

## 🎨 UI Components

### Files Involved

```
app/
├── dashboard/opponents/
│   ├── [id]/qr/
│   │   ├── page.tsx              # QR code generation
│   │   └── QRCodeComponent.tsx   # QR display
│   └── OpponentCard.tsx          # QR button
├── invite/
│   ├── [token]/
│   │   ├── page.tsx              # Auth options
│   │   └── complete/
│   │       └── page.tsx          # ✨ Confirmation screen
│   └── success/
│       └── page.tsx              # Success message
└── auth/signin/page.tsx          # Standard sign-in

lib/
├── db/index.ts                    # Database functions
│   ├── createInviteToken()
│   ├── getInviteToken()
│   ├── linkOpponentToUser()
│   └── redeemInviteToken()
└── auth.ts                        # NextAuth config
```

---

## 🧪 Testing the Flow

### Test Scenario 1: New User Linking

1. **As admin (`a13158y@gmail.com`):**
   ```
   1. Go to /dashboard/opponents
   2. Create opponent "Test User" with email test@example.com
   3. Click QR button
   4. Copy invite link
   ```

2. **In incognito window (as new user):**
   ```
   1. Paste invite link
   2. Click "Continue with Google" or enter email
   3. Sign in
   4. Review confirmation screen
   5. Click "Confirm and Link"
   6. See success screen
   7. Go to dashboard → See linked profile
   ```

### Test Scenario 2: Existing User Linking

1. **User already has account:**
   ```
   1. User signs in normally first
   2. Then clicks invite link
   3. Already authenticated → Skip auth screen
   4. Goes straight to confirmation screen
   5. Reviews details
   6. Confirms → Linked
   ```

### Test Scenario 3: Edge Cases

**Expired Token:**
```
1. Generate invite
2. Wait 7 days (or manually expire in DB)
3. Try to use → "Invite Expired"
```

**Already Redeemed:**
```
1. Generate invite
2. User A claims it
3. User B tries same link → "Already Redeemed"
```

**Already Linked:**
```
1. Opponent already has user_id
2. Try to link again → "Already Linked"
```

---

## 📱 Mobile Experience

- ✅ QR code scannable with phone camera
- ✅ Responsive design for all screens
- ✅ Touch-friendly buttons
- ✅ Clear visual hierarchy

---

## 🌐 Internationalization Ready

Current: English
Can add: Japanese translations

Example confirmation screen in Japanese:
```
アカウント連携の確認

リンクするアカウント:
👤 あなたのアカウント: user@example.com
↓
🎯 対戦相手プロフィール: Bob Smith

実行内容:
✓ アカウントをこのプロフィールに接続
✓ 過去の試合履歴を引き継ぎ
✓ 他の人の試合ログに表示
✓ 現在のELOレーティングを維持

[キャンセル]  [確認してリンク]
```

---

## 🎯 Key Improvements Made

### Before (Old Flow)
```
Scan QR → Sign in → Auto-link → Success
                      ⚠️ No confirmation!
```

### After (New Flow)
```
Scan QR → Sign in → ✨ Review & Confirm → Link → Success
                         User sees exactly
                         what's happening!
```

### Benefits
1. **Transparency** - User knows exactly what account is being linked
2. **Safety** - Can cancel if wrong account
3. **Clarity** - Shows what will happen before it happens
4. **Trust** - Explicit consent required

---

## 🔄 Future Enhancements

Potential additions (not implemented):
- [ ] Email notification on successful link
- [ ] Ability to unlink accounts
- [ ] Transfer ELO from opponent to user
- [ ] Merge match history preferences
- [ ] Link to multiple opponents at once
- [ ] Admin approval for high-value accounts

