# 🚀 Quick Setup Guide - WanderLink Production

## Prerequisites
- ✅ Supabase account
- ✅ Google Cloud account
- ✅ Node.js installed
- ✅ Agents running (ports 8000, 8001, 8002)

## Setup Steps (15 minutes)

### 1. Database Setup (5 min)

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Click your project: `xbspnzviiefekzosukfa`
3. Go to **SQL Editor**
4. Copy entire content of `supabase/migrations/001_init_schema.sql`
5. Paste and click **RUN**
6. Should see: "Success. No rows returned"

### 2. Get Service Role Key (2 min)

1. In Supabase Dashboard → **Settings** → **API**
2. Scroll to "Project API keys"
3. Copy **service_role** key (starts with `eyJ...`)
4. Add to `.env.local`:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

### 3. Google OAuth Setup (5 min)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Go to **APIs & Services** → **Credentials**
4. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
5. Application type: **Web application**
6. Name: `WanderLink`
7. Authorized JavaScript origins:
   ```
   http://localhost:3000
   ```
8. Authorized redirect URIs:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
9. Click **CREATE**
10. Copy **Client ID** and **Client secret**
11. Add to `.env.local`:
    ```env
    GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
    GOOGLE_CLIENT_SECRET=your_client_secret_here
    ```

### 4. Generate NextAuth Secret (1 min)

**Windows PowerShell:**
```powershell
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

**OR use online:** https://generate-secret.vercel.app/32

Add to `.env.local`:
```env
NEXTAUTH_SECRET=your_generated_secret_here
```

### 5. Create Test Data (2 min)

1. Start frontend: `cd frontend && npm run dev`
2. Go to http://localhost:3000/auth/signin
3. **Sign in with Google**
4. After sign-in, go to Supabase → **SQL Editor**
5. Get your user ID:
   ```sql
   SELECT id, email FROM auth.users;
   ```
6. Copy your UUID
7. Create test groups:
   ```sql
   INSERT INTO travel_groups (name, destination, start_date, end_date, budget_per_person, max_members, current_members, status, creator_id)
   VALUES
     ('Tokyo Adventure', 'Tokyo, Japan', '2025-11-15', '2025-11-22', 1200, 3, 1, 'forming', 'your-uuid-here'),
     ('Bali Retreat', 'Bali, Indonesia', '2025-12-01', '2025-12-10', 950, 3, 1, 'forming', 'your-uuid-here'),
     ('Iceland Expedition', 'Reykjavik, Iceland', '2025-11-20', '2025-11-28', 2100, 3, 2, 'forming', 'your-uuid-here');
   ```
8. Click **RUN**

## Testing

1. Go to http://localhost:3000/trips
2. Click **"JOIN A TRIP"** or **"FIND MY MATCHES"**
3. Fill preferences form
4. Click **"FIND MY MATCHES!"**
5. Should see **REAL GROUPS** from database (not mock data)!

## Verification Checklist

✅ Database tables created (7 tables)
✅ Google sign-in works
✅ Test groups visible in database
✅ Match-finding returns real data
✅ No mock data showing
✅ Compatibility scores calculated
✅ Agents running (8000, 8001, 8002)

## Troubleshooting

**"Unauthorized" error:**
- Check if signed in with Google
- Verify NEXTAUTH_SECRET is set
- Check GOOGLE_CLIENT_ID and SECRET

**"No groups available":**
- Verify groups created in database
- Check group status = 'forming'
- Check current_members < max_members

**"Database error":**
- Verify migration ran successfully
- Check SUPABASE_SERVICE_ROLE_KEY
- Check RLS policies enabled

**Agent service errors:**
- Check agents running on ports 8000, 8001, 8002
- Verify AGENT_SERVICE_URL in `.env.local`
- Check agent logs for errors

## Your Final `.env.local` Should Look Like:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xbspnzviiefekzosukfa.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # NEW!

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_32_char_base64_secret  # NEW!

# Google OAuth
GOOGLE_CLIENT_ID=your_id.apps.googleusercontent.com  # NEW!
GOOGLE_CLIENT_SECRET=your_secret  # NEW!

# Agent Service
AGENT_SERVICE_URL=http://localhost:8000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_AGENT_SERVICE_URL=http://localhost:8000

# Other
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_HEDERA_NETWORK=testnet
NEXT_PUBLIC_POLYGON_NETWORK=mumbai
```

## Success! 🎉

You now have:
- ✅ Real database integration
- ✅ Google authentication
- ✅ AI-powered matching (agents)
- ✅ No mock data
- ✅ Production-ready foundation

Next: Implement group creation UI and match request acceptance flow!
