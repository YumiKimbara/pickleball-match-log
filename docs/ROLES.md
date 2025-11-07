# Role-Based Access Control (RBAC)

## Overview

The application implements a simple role-based access control system with two roles:
- **Admin**: Full access to all features including admin panel
- **User**: Standard user access

## Admin Configuration

The admin email is hardcoded in `/lib/constants.ts`:

```typescript
export const ADMIN_EMAIL = 'a13158y@gmail.com';
```

When a user signs in with this email, they are automatically assigned the `admin` role. All other users receive the `user` role.

## Role Assignment

Roles are assigned during user creation in the `signIn` callback (`lib/auth.ts`):

```typescript
const role = user.email === ADMIN_EMAIL ? 'admin' : 'user';
dbUser = await db.createUser(user.email, user.name || null, role);
```

## Database Schema

The `users` table includes a `role` column:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  ...
);
```

## Migrations

### Initial Setup
- `001-nextauth-tables.sql`: Creates NextAuth adapter tables
- `002-set-admin-role.sql`: Updates existing admin user to have admin role

To run migrations:
```bash
node scripts/run-migration.js lib/db/migrations/002-set-admin-role.sql
```

## Usage

### Server Components (Recommended)

#### Require Admin Access
```typescript
import { requireAdmin } from '@/lib/auth-guards';

export default async function AdminPage() {
  const session = await requireAdmin(); // Redirects non-admins to /dashboard
  return <div>Admin Only Content</div>;
}
```

#### Require Any Authenticated User
```typescript
import { requireAuth } from '@/lib/auth-guards';

export default async function ProtectedPage() {
  const session = await requireAuth(); // Redirects unauthenticated to /auth/signin
  return <div>Protected Content</div>;
}
```

#### Optional Auth (Check User Role)
```typescript
import { getOptionalAuth, isAdmin } from '@/lib/auth-guards';

export default async function Page() {
  const session = await getOptionalAuth();
  
  if (isAdmin(session?.user)) {
    return <div>Admin view</div>;
  }
  
  return <div>Regular view</div>;
}
```

### API Routes

```typescript
import { requireAdmin } from '@/lib/auth-guards';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    await requireAdmin(); // Throws/redirects if not admin
    
    // Admin-only logic here
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
}
```

### Utility Functions

#### `isAdminEmail(email: string): boolean`
Check if an email belongs to an admin.

```typescript
import { isAdminEmail } from '@/lib/auth-guards';

if (isAdminEmail('a13158y@gmail.com')) {
  // This user is an admin
}
```

#### `isAdmin(user): boolean`
Check if a user object has admin role.

```typescript
import { isAdmin } from '@/lib/auth-guards';

const session = await auth();
if (isAdmin(session?.user)) {
  // User is an admin
}
```

## Admin Features

### Admin Dashboard
- URL: `/dashboard/admin`
- Protected by `requireAdmin()`
- Accessible via "Admin Panel" button on main dashboard (only visible to admins)

### Admin API Routes
- `/api/admin/recalculate-elo` - Recalculate all ELO ratings (POST)
- Additional admin routes can be added under `/api/admin/`

## Session Data

The user's role is included in the session object:

```typescript
{
  user: {
    id: number;
    email: string;
    name?: string;
    role: 'admin' | 'user';  // Available in all session objects
    elo: number;
  }
}
```

## TypeScript Types

Role types are defined in `types/next-auth.d.ts`:

```typescript
declare module "next-auth" {
  interface Session {
    user: {
      role: 'admin' | 'user';
      // ... other fields
    };
  }
}
```

## Changing the Admin Email

To change the admin email:

1. Update `ADMIN_EMAIL` in `/lib/constants.ts`
2. Run migration to update existing user:
   ```sql
   UPDATE users SET role = 'user' WHERE email = 'old-admin@example.com';
   UPDATE users SET role = 'admin' WHERE email = 'new-admin@example.com';
   ```
3. New signins will automatically use the new admin email

## Security Notes

- Role checks happen server-side via `requireAdmin()` and `requireAuth()`
- Roles are stored in JWT tokens and database
- Always use `requireAdmin()` for admin-only pages/routes
- Client-side role checks are for UI only; never trust client-side authorization

