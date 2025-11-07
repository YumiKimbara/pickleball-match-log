# Vercel Cron Jobs

This app uses Vercel Cron to automatically clean up expired invite tokens.

## Configuration

The cron configuration is in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-invites",
      "schedule": "0 0 * * *"
    }
  ]
}
```

## Scheduled Jobs

### Cleanup Expired Invites
- **Path**: `/api/cron/cleanup-invites`
- **Schedule**: Daily at midnight (00:00 UTC)
- **Description**: Deletes invite tokens that expired more than 7 days ago

## Security

The cron endpoint is protected by a `CRON_SECRET` environment variable:

1. Set `CRON_SECRET` in your Vercel project environment variables
2. The endpoint validates the `Authorization: Bearer <CRON_SECRET>` header
3. Only requests from Vercel's cron service with the correct secret can trigger the job

## Setup

1. Add `CRON_SECRET` to your Vercel environment variables:
   ```bash
   # Generate a random secret
   openssl rand -base64 32
   
   # Add it to Vercel
   vercel env add CRON_SECRET
   ```

2. Deploy your app to Vercel

3. Verify the cron job is set up:
   - Go to your Vercel project dashboard
   - Navigate to Settings → Cron Jobs
   - You should see the cleanup-invites job listed

## Testing Locally

You can test the cron endpoint locally:

```bash
curl -X GET http://localhost:3000/api/cron/cleanup-invites \
  -H "Authorization: Bearer your-cron-secret"
```

## Monitoring

Check Vercel logs to see when the cron job runs:
- Go to your project dashboard
- Click on "Logs"
- Filter for "[Cron]" to see cleanup activity

