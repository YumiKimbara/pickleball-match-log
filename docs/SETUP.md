# Setup Instructions

## Environment Variables

Copy `.env.example` to `.env.local` and fill in all values:

```bash
cp .env.example .env.local
```

### Required Variables

1. **Postgres Database (Vercel Postgres)**
   ```
   POSTGRES_URL=
   POSTGRES_PRISMA_URL=
   POSTGRES_URL_NO_SSL=
   POSTGRES_URL_NON_POOLING=
   POSTGRES_USER=
   POSTGRES_HOST=
   POSTGRES_PASSWORD=
   POSTGRES_DATABASE=
   ```
   - Create a Vercel Postgres database in your project
   - Copy all connection strings from Vercel dashboard

2. **NextAuth.js**
   ```
   NEXTAUTH_URL=http://localhost:3000  # Your app URL
   NEXTAUTH_SECRET=                     # Generate with: openssl rand -base64 32
   ```

3. **Google OAuth**
   ```
   GOOGLE_CLIENT_ID=
   GOOGLE_CLIENT_SECRET=
   ```
   - Create a project in [Google Cloud Console](https://console.cloud.google.com/)
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

4. **Email (Resend)**
   ```
   RESEND_API_KEY=
   EMAIL_FROM=noreply@yourdomain.com
   ```
   - Sign up at [Resend](https://resend.com/)
   - Get your API key from the dashboard

5. **Blob Storage (Vercel Blob)**
   ```
   BLOB_READ_WRITE_TOKEN=
   ```
   - Create a blob store in your Vercel project
   - Copy the read/write token

6. **Cron Secret**
   ```
   CRON_SECRET=  # Generate with: openssl rand -base64 32
   ```
   - Required for scheduled cleanup jobs
   - Must match the secret in Vercel environment variables

## Database Setup

1. Run migrations:
   ```bash
   npm run db:migrate
   ```

2. Set admin role (replace with your email):
   ```bash
   npm run db:set-admin your-email@example.com
   ```

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment to Vercel

1. Push your code to GitHub

2. Import project in Vercel

3. Add all environment variables in Vercel dashboard

4. Deploy

5. Verify cron jobs are set up:
   - Go to Settings → Cron Jobs
   - Should see `cleanup-invites` scheduled

## PWA Icons

Generate PWA icons before deploying:

1. Open `public/generate-icons.html` in a browser
2. Download `icon-192.png` and `icon-512.png`
3. Place them in the `public/` folder

## Post-Deployment

1. Test authentication (Google + Magic Link)
2. Create an opponent and test QR invite flow
3. Log a match and verify ELO updates
4. Test PWA installation on mobile
5. Verify offline capabilities

