# Pickleball Match Logger

A mobile-first PWA for logging pickleball matches, tracking stats, and managing opponents with QR code invites.

## Features

- ✅ **Authentication**: Magic link (email) and Google SSO via NextAuth
- ✅ **Opponent Management**: Add opponents with optional email and photos
- ✅ **QR Invites**: Generate QR codes for opponents to claim their profiles
- ✅ **Match Logging**: One-handed scoring interface optimized for mobile
- ✅ **ELO Tracking**: Automatic ELO calculation after each match
- ✅ **Post-Match Photos**: Optional photo capture after each game
- ✅ **PWA Support**: Installable app with offline capabilities
- ✅ **Admin Controls**: Yumi (admin) can manage all users and opponents

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Authentication**: NextAuth.js v5 (beta)
- **Database**: Vercel Postgres
- **File Storage**: Vercel Blob
- **Styling**: Tailwind CSS
- **PWA**: next-pwa
- **QR Codes**: qrcode.react
- **Avatars**: DiceBear (deterministic avatars)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Vercel account (for deployment)
- Google Cloud Console project (for Google OAuth)
- Resend account (for magic link emails)

### Local Development

1. **Clone the repository**
   ```bash
   git clone git@github.com:YumiKimbara/pickleball-match-log.git
   cd pickleball-match-log
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy `.env.example` to `.env.local` and fill in the values:
   ```bash
   cp .env.example .env.local
   ```

   You'll need to set up:
   - Vercel Postgres (see below)
   - Google OAuth credentials
   - Resend API key
   - Vercel Blob storage

4. **Set up the database**

   Apply the schema to your Vercel Postgres database:
   ```bash
   psql $POSTGRES_URL -f lib/db/schema.sql
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Vercel

### Step 1: Connect Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js

### Step 2: Set Up Vercel Postgres

1. In your Vercel project, go to the **Storage** tab
2. Click "Create Database" → Choose "Postgres"
3. Copy the connection strings to your environment variables:
   - `POSTGRES_URL`
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`

4. Apply the database schema:
   ```bash
   psql $POSTGRES_URL_NON_POOLING -f lib/db/schema.sql
   ```

### Step 3: Set Up Vercel Blob

1. In the **Storage** tab, create a new Blob store
2. Copy the `BLOB_READ_WRITE_TOKEN` to your environment variables

### Step 4: Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Set authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (dev)
   - `https://your-domain.vercel.app/api/auth/callback/google` (prod)
6. Copy Client ID and Client Secret to environment variables

### Step 5: Set Up Resend for Magic Links

1. Sign up at [Resend](https://resend.com)
2. Get your API key from the dashboard
3. Add `RESEND_API_KEY` to environment variables

### Step 6: Configure Environment Variables in Vercel

In Vercel Dashboard → Settings → Environment Variables, add:

```env
POSTGRES_URL=
POSTGRES_PRISMA_URL=
POSTGRES_URL_NON_POOLING=
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
RESEND_API_KEY=
BLOB_READ_WRITE_TOKEN=
ADMIN_EMAIL=yumi@example.com
```

### Step 7: Deploy

```bash
git add .
git commit -m "Initial deployment"
git push origin main
```

Vercel will automatically deploy your app!

## Creating App Icons

The PWA requires two icon sizes:
- `public/icon-192.png` (192x192px)
- `public/icon-512.png` (512x512px)

See `public/ICONS_README.md` for instructions.

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/     # NextAuth API routes
│   │   └── matches/                # Match creation API
│   ├── auth/
│   │   └── signin/                 # Sign-in page
│   ├── dashboard/
│   │   ├── page.tsx                # Main dashboard
│   │   ├── opponents/              # Opponent management
│   │   └── match/                  # Match logging
│   ├── invite/[token]/             # QR invite redemption
│   └── layout.tsx
├── lib/
│   ├── auth.ts                     # NextAuth configuration
│   ├── auth-guards.ts              # Auth helper functions
│   ├── avatar.ts                   # Deterministic avatar generator
│   ├── elo.ts                      # ELO calculation
│   └── db/
│       ├── index.ts                # Database helpers
│       └── schema.sql              # Database schema
├── types/
│   └── next-auth.d.ts              # NextAuth type extensions
└── public/
    └── manifest.json               # PWA manifest
```

## Database Schema

The app uses 5 main tables:
- `users` - User accounts (admin & regular users)
- `opponents` - Opponent profiles (can exist without accounts)
- `invite_tokens` - QR invite tokens for account linking
- `matches` - Match records with ELO changes
- `in_progress_matches` - Resume interrupted matches

## Key Features Explained

### QR Invite Flow

1. Admin/user creates an opponent with optional email
2. Generate QR code from opponent's page
3. Opponent scans QR → prompted to sign in
4. If email matches opponent's email, profile is linked
5. If new email, creates new account and links

### Match Logging

- One-handed UI with large touch targets (≥56px)
- Quick presets: 11, 15, 21 points
- Undo button for mistakes
- End game confirmation if score incomplete
- Automatic ELO calculation on completion

### ELO System

- Starting ELO: 1500
- K-factor: 32
- Updates both players after each match
- Displayed on dashboard and opponent cards

## Admin Features

Admin users (set via `ADMIN_EMAIL` env var) can:
- View all opponents (not just their own)
- Manage all matches
- See all users

## Future Enhancements

- [ ] Charts (ELO trends, win rate over time)
- [ ] Head-to-head statistics
- [ ] Match history filtering
- [ ] Photo gallery view
- [ ] Export data as CSV
- [ ] Push notifications
- [ ] Admin tools (merge duplicates, delete users)

## Troubleshooting

### Magic links not sending
- Verify `RESEND_API_KEY` is correct
- Check Resend dashboard for API usage
- Ensure sender email is verified

### Photos not uploading
- Verify `BLOB_READ_WRITE_TOKEN` is set
- Check Vercel Blob quota in dashboard

### QR codes not working
- Ensure `NEXTAUTH_URL` matches your production domain
- Check invite token hasn't expired (7 days default)

### ELO not updating
- Verify match creation API is being called
- Check database for `elo_change_a` and `elo_change_b` values

## License

MIT

## Contact

For issues or questions, please open an issue on GitHub.
