# Security & Access Control Features

## ✅ Implemented Security Features

### 1. Role-Based Access Control (RBAC)

**Two Roles:**
- **Admin** (Yumi: `a13158y@gmail.com`): Full system access
- **User**: Standard access, can only manage own data

**Implementation:**
- Server-side guards: `requireAuth()`, `requireAdmin()`
- Role stored in database and JWT session
- All admin routes protected with `requireAdmin()`
- All API routes protected with `requireAuth()`

### 2. Ownership Checks

**Opponents:**
- ✅ Users can only create invites for opponents they created
- ✅ Users can only upload/delete photos for their own opponents
- ✅ Admin can manage any opponent
- ✅ Users only see opponents they created (admin sees all)

**Matches:**
- ✅ Users can only log matches with opponents they created
- ✅ Users can only upload photos to matches they logged
- ✅ Admin exemption for all operations

**QR Invites:**
- ✅ Users can only generate QR codes for their opponents
- ✅ Rate limited (5 per hour)

### 3. Rate Limiting

All critical operations are rate-limited per user:

| Operation | Limit | Window |
|-----------|-------|--------|
| Invite creation | 5 invites | 1 hour |
| Photo uploads | 10 photos | 1 hour |
| Match creation | 50 matches | 1 hour |
| Opponent creation | 20 opponents | 24 hours |

**Implementation:**
- In-memory rate limiter (`lib/rate-limit.ts`)
- Automatic cleanup of expired entries
- User-friendly error messages with reset time
- Returns 429 status code on limit exceeded

### 4. QR Flow Security

**Invite Token Validation:**
- ✅ Token must exist in database
- ✅ Cannot be already redeemed
- ✅ Must not be expired (7 days)
- ✅ Clear error messages for each state

**Linking Confirmation:**
- Shows opponent name before linking
- Email pre-filled if available
- Two-step process: auth → confirm
- Prevents accidental linking

## API Route Protection Summary

### Protected Routes (Require Auth)

**Match Operations:**
```typescript
POST   /api/matches              // Rate limited, ownership check
POST   /api/matches/[id]/photo   // Rate limited, ownership check
```

**Opponent Operations:**
```typescript
POST   /api/opponents/photo      // Rate limited, ownership check
DELETE /api/opponents/photo      // Ownership check
```

**QR Generation:**
```typescript
GET    /dashboard/opponents/[id]/qr  // Rate limited, ownership check
```

### Admin-Only Routes

All require `requireAdmin()`:
```typescript
GET    /api/admin/opponents       // View all
DELETE /api/admin/opponents       // Delete any
PATCH  /api/admin/opponents       // Update any
POST   /api/admin/opponents/merge // Merge duplicates

GET    /api/admin/invites         // View all
DELETE /api/admin/invites         // Invalidate any
PATCH  /api/admin/invites         // Expire any

GET    /api/admin/users           // View all
POST   /api/admin/users/merge     // Merge duplicates

GET    /api/admin/photos          // View all
DELETE /api/admin/photos          // Delete any

GET    /api/admin/duplicates      // Find duplicates
POST   /api/admin/recalculate-elo // Recalc all ELO
```

## Ownership Validation Flow

### Creating a Match:
```
1. User authenticated? (requireAuth)
2. Rate limit check (50/hour)
3. Opponent exists?
4. User created this opponent? (or is admin)
5. ✅ Allow match creation
```

### Uploading Photo:
```
1. User authenticated? (requireAuth)
2. Rate limit check (10/hour)
3. Resource exists? (opponent or match)
4. User owns resource? (or is admin)
5. ✅ Allow upload
```

### Generating QR Code:
```
1. User authenticated? (requireAuth)
2. Opponent exists?
3. User created opponent? (or is admin)
4. Rate limit check (5/hour)
5. ✅ Generate invite token
```

## Security Best Practices Implemented

✅ **Server-side validation**: All checks happen server-side  
✅ **No client-side trust**: UI checks are cosmetic only  
✅ **Explicit ownership**: All resources linked to creator  
✅ **Admin override**: Admin can bypass ownership for management  
✅ **Rate limiting**: Prevents abuse of expensive operations  
✅ **Clear error messages**: User-friendly feedback  
✅ **Proper HTTP status codes**: 401, 403, 404, 429  

## Rate Limit Configuration

Located in `/lib/rate-limit.ts`:

```typescript
export const RateLimits = {
  INVITE_CREATE: { limit: 5, windowSeconds: 3600 },
  PHOTO_UPLOAD: { limit: 10, windowSeconds: 3600 },
  MATCH_CREATE: { limit: 50, windowSeconds: 3600 },
  OPPONENT_CREATE: { limit: 20, windowSeconds: 86400 },
};
```

Adjust these values as needed for production traffic.

## Testing Security

### Test Ownership:
1. User A creates opponent
2. User B tries to log match with A's opponent
3. ✅ Should get 403 error

### Test Rate Limiting:
1. Generate 6 QR codes quickly
2. ✅ 6th should fail with 429 error
3. Wait 1 hour
4. ✅ Should work again

### Test Admin Override:
1. Admin views opponents page
2. ✅ Sees ALL opponents (not just own)
3. Admin logs match with any opponent
4. ✅ Works regardless of creator

## Future Enhancements

Potential additions:
- Redis-based rate limiting for multi-instance deployments
- IP-based rate limiting for unauthenticated endpoints
- Audit logging for admin actions
- Two-factor authentication for admin
- CAPTCHA on invite redemption
- Suspicious activity detection

