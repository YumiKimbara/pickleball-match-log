# Admin Features Documentation

All admin features are now fully implemented and accessible at `a13158y@gmail.com` admin account.

## 🎯 Features Implemented

### 1. **User Management** (`/dashboard/admin/users`)
- ✅ View all users with their roles from database
- ✅ See user details: ID, email, name, role (admin/user), ELO, created date
- ✅ Visual role badges (👑 Admin / 👤 User)

### 2. **Opponent Management** (`/dashboard/admin/opponents`)
- ✅ View all opponents in the system
- ✅ Edit opponent name and email inline
- ✅ Delete opponents (with confirmation)
- ✅ See opponent status (Linked vs Guest)
- ✅ Shows ELO ratings

**API Endpoints:**
- `GET /api/admin/opponents` - Fetch all opponents
- `PATCH /api/admin/opponents` - Update opponent details
- `DELETE /api/admin/opponents` - Delete opponent

### 3. **Duplicate Detection & Merging** (`/dashboard/admin/duplicates`)
- ✅ Automatically detect duplicate users (same email)
- ✅ Automatically detect duplicate opponents (same email or similar names)
- ✅ One-click merge functionality
- ✅ Transfers all data (matches, created opponents, invite tokens)
- ✅ Safety confirmations before merging

**API Endpoints:**
- `GET /api/admin/duplicates` - Find duplicates
- `POST /api/admin/users/merge` - Merge two users
- `POST /api/admin/opponents/merge` - Merge two opponents

**Database Functions:**
- `mergeUsers(keepUserId, deleteUserId)` - Transfers all user data and deletes duplicate
- `mergeOpponents(keepOpponentId, deleteOpponentId)` - Transfers all opponent data

### 4. **Match Management** (`/dashboard/admin/matches`)
- ✅ View all matches in the system
- ✅ Edit match scores (winner automatically recalculated)
- ✅ Delete matches (with confirmation)
- ✅ Shows player IDs, types (User/Opponent), scores, and dates
- ⚠️ Note: Editing scores doesn't auto-recalculate ELO (use "Recalculate All ELO" after)

**API Endpoints:**
- `GET /api/admin/matches` - Fetch all matches
- `PATCH /api/admin/matches` - Update match scores
- `DELETE /api/admin/matches` - Delete a match

**Database Functions:**
- `getAllMatches()` - Returns all matches ordered by date
- `updateMatchScores(matchId, scoreA, scoreB)` - Updates scores and winner
- `deleteMatch(matchId)` - Permanently deletes a match

### 5. **Invite Token Management** (`/dashboard/admin/invites`)
- ✅ View all invite tokens (active and expired/redeemed)
- ✅ Expire invite tokens immediately
- ✅ Delete invite tokens
- ✅ Shows creation date, expiration date, opponent ID
- ✅ Separate sections for active vs expired/redeemed

**API Endpoints:**
- `GET /api/admin/invites` - Fetch all invite tokens
- `PATCH /api/admin/invites` - Expire a token
- `DELETE /api/admin/invites` - Delete a token

**Database Functions:**
- `getAllInviteTokens()` - Get all tokens
- `expireInviteToken(tokenId)` - Set expires_at to NOW
- `deleteInviteToken(tokenId)` - Permanently delete token

### 6. **Photo Management** (`/dashboard/admin/photos`)
- ✅ View all photos from users, opponents, and matches
- ✅ Categorized into three sections
- ✅ Display photo with associated name/email/ID
- ✅ Delete photos with confirmation
- ✅ Shows total photo count by category

**API Endpoints:**
- `GET /api/admin/photos` - Fetch all photos
- `DELETE /api/admin/photos` - Delete a photo

**Database Functions:**
- `getAllPhotos()` - Get photos from users, opponents, and matches
- `deletePhoto(type, entityId)` - Remove photo_url from entity

### 7. **Scheduled Cleanup (Vercel Cron)**
- ✅ Daily automated cleanup of expired invite tokens
- ✅ Deletes tokens expired more than 7 days ago
- ✅ Runs at midnight UTC (00:00)
- ✅ Protected by CRON_SECRET environment variable

**Configuration:**
- `vercel.json` defines cron schedule
- `/api/cron/cleanup-invites` handles the cleanup
- See `docs/CRON-JOBS.md` for setup instructions

**Database Function:**
- `deleteExpiredInvites()` - Returns count of deleted tokens

## 🔐 Security

All admin features are protected by `requireAdmin()` guard:
- Checks if user is authenticated
- Checks if user has `role = 'admin'` in database
- Redirects non-admins to `/dashboard`

Example:
```typescript
import { requireAdmin } from '@/lib/auth-guards';

export default async function AdminPage() {
  await requireAdmin(); // Throws if not admin
  // Admin-only code here
}
```

## 📊 Database Functions Added

All new admin functions in `/lib/db/index.ts`:

### Invite Management
- `getAllInviteTokens()` - Get all tokens
- `expireInviteToken(tokenId)` - Expire token
- `deleteInviteToken(tokenId)` - Delete token

### User Management
- `deleteUser(userId)` - Delete user
- `mergeUsers(keepUserId, deleteUserId)` - Merge users
- `updateUserRole(userId, role)` - Change user role
- `updateUserRoleByEmail(email, role)` - Change role by email

### Opponent Management
- `deleteOpponent(opponentId)` - Delete opponent
- `mergeOpponents(keepOpponentId, deleteOpponentId)` - Merge opponents
- `updateOpponentName(opponentId, name)` - Update name
- `updateOpponentEmail(opponentId, email)` - Update email

### Photo Management
- `getAllPhotos()` - Get all photos with metadata
- `deletePhoto(type, entityId)` - Delete photo by type and ID

### Match Management
- `getAllMatches()` - Get all matches
- `updateMatchScores(matchId, scoreA, scoreB)` - Update match scores
- `deleteMatch(matchId)` - Delete a match

### Scheduled Cleanup
- `deleteExpiredInvites()` - Delete old expired tokens

### Duplicate Detection
- `findDuplicateUsers()` - Find users with same/similar emails
- `findDuplicateOpponents()` - Find opponents with same email or similar names

## 🎨 UI Features

### Admin Dashboard (`/dashboard/admin`)
Seven beautifully designed cards:
1. 👥 User Management
2. 🎯 Opponent Management
3. 🔗 Duplicate Detection
4. 📧 Invite Management
5. 📸 Photo Management
6. 🏓 Match Management
7. 📊 ELO Recalculation

### Common UI Patterns
- Consistent table layouts with hover effects
- Inline editing for opponents and matches
- Confirmation dialogs for destructive actions
- Loading states
- Empty states with helpful messages
- Color-coded status badges
- Responsive grid layouts

## 🚀 Usage

### Access Admin Panel

1. **Sign in as admin:**
   - Email: `a13158y@gmail.com`
   - Your role will show as "admin" on dashboard

2. **Click "Admin Panel" button** on main dashboard

3. **Navigate to any admin feature** from the admin dashboard

### Common Tasks

**Merge duplicate opponents:**
1. Go to `/dashboard/admin/duplicates`
2. Find duplicate opponents
3. Click "Merge X into this" button
4. Confirm merge

**Expire an invite:**
1. Go to `/dashboard/admin/invites`
2. Find active invite
3. Click "Expire" button
4. Token is immediately expired

**Delete a photo:**
1. Go to `/dashboard/admin/photos`
2. Find photo in user/opponent/match section
3. Click "Delete Photo" button
4. Confirm deletion

**Edit opponent details:**
1. Go to `/dashboard/admin/opponents`
2. Click "Edit" on any opponent
3. Modify name or email
4. Click "Save"

## 📁 File Structure

```
app/
├── api/
│   ├── admin/
│   │   ├── duplicates/route.ts       # Duplicate detection
│   │   ├── invites/route.ts          # Invite management
│   │   ├── matches/route.ts          # Match management
│   │   ├── opponents/
│   │   │   ├── route.ts              # CRUD operations
│   │   │   └── merge/route.ts        # Merge opponents
│   │   ├── photos/route.ts           # Photo management
│   │   └── users/
│   │       └── merge/route.ts        # Merge users
│   └── cron/
│       └── cleanup-invites/route.ts  # Scheduled cleanup
└── dashboard/admin/
    ├── page.tsx                  # Admin dashboard
    ├── users/page.tsx            # User management
    ├── opponents/page.tsx        # Opponent management
    ├── matches/page.tsx          # Match management
    ├── duplicates/page.tsx       # Duplicate detection
    ├── invites/page.tsx          # Invite management
    └── photos/page.tsx           # Photo management

lib/
├── auth-guards.ts                # requireAdmin() guard
├── constants.ts                  # ADMIN_EMAIL constant
└── db/index.ts                   # All database functions
```

## 🔄 Data Flow

### Merge Operation Flow
```
User clicks merge button
  ↓
Confirmation dialog
  ↓
API call to /api/admin/{users|opponents}/merge
  ↓
db.mergeUsers() or db.mergeOpponents()
  ↓
Transfer all matches (player_a, player_b, winner)
  ↓
Transfer opponents created (created_by_user_id)
  ↓
Transfer invite tokens (created_by_user_id)
  ↓
Delete duplicate user/opponent
  ↓
Return success
  ↓
Refresh list in UI
```

### Delete Operation Flow
```
User clicks delete button
  ↓
Confirmation dialog
  ↓
API call to DELETE /api/admin/{opponents|invites|photos}
  ↓
db.delete{Opponent|InviteToken|Photo}()
  ↓
Database cascade deletes related records
  ↓
Return success
  ↓
Remove from UI list
```

## ⚠️ Important Notes

1. **Merging is permanent** - All data is transferred and the duplicate is deleted
2. **Deleting opponents** - All their matches will be deleted (database CASCADE)
3. **Photo deletion** - Only removes URL from database, doesn't delete file from storage
4. **Invite expiration** - Sets expires_at to NOW, doesn't delete token
5. **Duplicate detection** - Uses exact email match (case-insensitive)

## 🧪 Testing

To test admin features:

1. Create some duplicate opponents with same/similar names
2. Create invite tokens via QR code
3. Upload photos to users/opponents/matches
4. Sign in as admin
5. Test each admin page

## 🎯 Future Enhancements

Potential additions (not implemented):
- Bulk operations (delete multiple, merge multiple)
- Advanced duplicate detection (fuzzy name matching)
- Photo upload directly from admin panel
- Export data to CSV
- Activity logs (audit trail)
- Admin notifications
- Restore deleted items (soft delete)
- Advanced search/filtering

