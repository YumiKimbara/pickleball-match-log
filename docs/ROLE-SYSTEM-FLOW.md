# Role System Flow - Database-Based

## Summary

**The role system is 100% database-driven.** Roles are:
1. ✅ Stored in the `users` table in PostgreSQL
2. ✅ Fetched from DB on every login/session refresh
3. ✅ Available throughout the codebase via `session.user.role`

## Flow Diagram

```
Sign In → Check DB → Assign Role → Store in DB → Fetch from DB → Use in Session
```

## Detailed Flow

### 1. User Signs In (First Time)

**File:** `lib/auth.ts` - `signIn` callback

```typescript
// Check if user exists in DB
let dbUser = await db.getUserByEmail(user.email);

if (!dbUser) {
  // Determine role based on email
  const role = user.email === 'a13158y@gmail.com' ? 'admin' : 'user';
  
  // CREATE USER IN DB WITH ROLE ← This is where role is stored in DB
  dbUser = await db.createUser(user.email, user.name || null, role);
}
```

### 2. Database Storage

**File:** `lib/db/index.ts` - `createUser` function

```typescript
async createUser(email: string, name: string | null, role: 'admin' | 'user' = 'user'): Promise<User> {
  const result = await sql<User>`
    INSERT INTO users (email, name, role)  ← Role stored in DB
    VALUES (${email}, ${name}, ${role})
    RETURNING *
  `;
  return result.rows[0];
}
```

**Database Schema:** `lib/db/schema.sql`

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),  ← Role column
  photo_url TEXT,
  elo DECIMAL(10, 2) DEFAULT 1500.00,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 3. Fetch Role from DB on Login

**File:** `lib/auth.ts` - `jwt` callback

```typescript
async jwt({ token, user, trigger, session }) {
  if (user) {
    // FETCH USER FROM DB (including role)
    const dbUser = await db.getUserByEmail(user.email!);
    if (dbUser) {
      token.id = dbUser.id;
      token.role = dbUser.role;  ← Role fetched from DB and stored in JWT
      token.elo = dbUser.elo;
    }
  }
  return token;
}
```

### 4. Add Role to Session

**File:** `lib/auth.ts` - `session` callback

```typescript
async session({ session, token }) {
  if (session.user) {
    session.user.id = token.id as number;
    session.user.role = token.role as 'admin' | 'user';  ← Role from DB available in session
    session.user.elo = token.elo as number;
  }
  return session;
}
```

### 5. Use Role Throughout App

**Any Server Component:**

```typescript
import { requireAuth } from '@/lib/auth-guards';

export default async function MyPage() {
  const session = await requireAuth();
  
  // Role from DB is available here
  console.log(session.user.role);  // 'admin' or 'user' (from DB)
  
  if (session.user.role === 'admin') {
    // Admin-only features
  }
}
```

## Verification Points

### ✅ Where role is stored in DB:
- `lib/db/index.ts` - `createUser()` function
- PostgreSQL `users` table

### ✅ Where role is fetched from DB:
- `lib/auth.ts` - `jwt` callback (line 52-55)
- `lib/db/index.ts` - `getUserByEmail()` and `getUserById()` functions

### ✅ Where you can see roles from DB:
- Session object: `session.user.role`
- Admin users page: `/dashboard/admin/users` (shows all users with their DB roles)
- Terminal script: `node scripts/check-roles.js` (queries DB directly)

## How to Set Up

### 1. Run migrations to ensure DB has role column:
```bash
node scripts/run-migration.js lib/db/migrations/001-nextauth-tables.sql
node scripts/run-migration.js lib/db/migrations/002-set-admin-role.sql
```

### 2. Verify roles in DB:
```bash
node scripts/check-roles.js
```

### 3. Sign in with `a13158y@gmail.com`:
- Will be created with `role = 'admin'` in DB
- All other emails get `role = 'user'` in DB

### 4. View roles in admin panel:
- Go to `/dashboard/admin/users`
- See all users with their roles from DB

## Database Query Examples

### Check roles directly in DB:
```sql
SELECT id, email, name, role FROM users;
```

### Update a user's role:
```sql
UPDATE users SET role = 'admin' WHERE email = 'someone@example.com';
```

### Count users by role:
```sql
SELECT role, COUNT(*) FROM users GROUP BY role;
```

## Key Files

1. **`lib/constants.ts`** - Admin email constant
2. **`lib/auth.ts`** - Role assignment and fetching from DB
3. **`lib/db/index.ts`** - Database functions (including `createUser`, `getUserByEmail`)
4. **`lib/db/schema.sql`** - Database schema with role column
5. **`lib/db/migrations/002-set-admin-role.sql`** - Set existing admin user
6. **`app/dashboard/admin/users/page.tsx`** - View all users and their DB roles
7. **`scripts/check-roles.js`** - Verify roles in terminal

## Role is NOT hardcoded at runtime

The email `a13158y@gmail.com` is only used to **determine the initial role when creating a user**. After that:

- ✅ Role is stored in DB
- ✅ Role is fetched from DB on every session
- ✅ You can change roles directly in DB
- ✅ Changes take effect on next login

## Changing a User's Role

Option 1 - SQL:
```sql
UPDATE users SET role = 'admin' WHERE email = 'newadmin@example.com';
```

Option 2 - Add a database function:
```typescript
async updateUserRole(userId: number, role: 'admin' | 'user'): Promise<void> {
  await sql`
    UPDATE users SET role = ${role}, updated_at = NOW()
    WHERE id = ${userId}
  `;
}
```

The next time the user logs in, their new role from the DB will be loaded into their session.

