# 🔐 Google Authentication Setup Guide

## Overview
This guide will help you set up Google OAuth authentication in your WanderLink application using Supabase.

---

## 📋 Step 1: Create Google OAuth Credentials

### 1.1 Go to Google Cloud Console
Visit: https://console.cloud.google.com/

### 1.2 Create a New Project (or select existing)
1. Click on the project dropdown at the top
2. Click "NEW PROJECT"
3. Name it "WanderLink" (or your preferred name)
4. Click "CREATE"

### 1.3 Enable Google+ API
1. Go to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click on it and click "ENABLE"

### 1.4 Create OAuth Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "CREATE CREDENTIALS" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen first:
   - User Type: **External**
   - App name: **WanderLink**
   - User support email: Your email
   - Developer contact: Your email
   - Click "SAVE AND CONTINUE"
   - Scopes: Click "ADD OR REMOVE SCOPES"
     - Select: `email`, `profile`, `openid`
   - Click "SAVE AND CONTINUE"
   - Test users: Add your email (for testing)
   - Click "SAVE AND CONTINUE"

4. Back to Create OAuth client ID:
   - Application type: **Web application**
   - Name: **WanderLink Web Client**
   
5. **Authorized JavaScript origins:**
   ```
   http://localhost:3000
   https://xbspnzviiefekzosukfa.supabase.co
   ```

6. **Authorized redirect URIs:**
   ```
   https://xbspnzviiefekzosukfa.supabase.co/auth/v1/callback
   http://localhost:3000/auth/callback
   ```

7. Click "CREATE"

8. **IMPORTANT:** Copy these values:
   - **Client ID** (looks like: `xxxxx.apps.googleusercontent.com`)
   - **Client Secret** (looks like: `GOCSPX-xxxxx`)

---

## 📋 Step 2: Configure Supabase

### 2.1 Go to Supabase Dashboard
Visit: https://supabase.com/dashboard/project/xbspnzviiefekzosukfa

### 2.2 Enable Google Provider
1. Click on "Authentication" in the left sidebar
2. Click on "Providers"
3. Find "Google" and click to expand

### 2.3 Configure Google Settings
Enable the following:

✅ **Enable Sign in with Google** - Toggle ON

**Client IDs:**
```
Paste your Google Client ID here
(e.g., 123456789-abcdefg.apps.googleusercontent.com)
```

**Client Secret (for OAuth):**
```
Paste your Google Client Secret here
(e.g., GOCSPX-xxxxxxxxxxxxxxxx)
```

**Callback URL (already provided by Supabase):**
```
https://xbspnzviiefekzosukfa.supabase.co/auth/v1/callback
```
✅ This URL should already be in Google Console's Authorized redirect URIs

**Advanced Settings (Optional):**
- ❌ Skip nonce checks - Leave UNCHECKED (more secure)
- ❌ Allow users without an email - Leave UNCHECKED

### 2.4 Save Configuration
Click "Save" at the bottom

---

## 📋 Step 3: Update Environment Variables

Your `.env.local` file already has Supabase configured, but verify:

```bash
# frontend/.env.local

NEXT_PUBLIC_SUPABASE_URL=https://xbspnzviiefekzosukfa.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhic3BuenZpaWVmZWt6b3N1a2ZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNjEwNTksImV4cCI6MjA3NjYzNzA1OX0.OSDEg4tKfOCQJ_-Ese4TTArJlTQ1vuPfKH8sLNRVy5g
```

✅ Already configured!

---

## 📋 Step 4: Test Authentication

### 4.1 Start the Frontend
```powershell
cd D:\WanderLink\frontend
npm run dev
```

### 4.2 Open Browser
Go to: http://localhost:3000

### 4.3 Click "Sign in with Google"
You should see the Google login button in the header.

### 4.4 Sign In Flow
1. Click the button
2. Redirected to Google login
3. Choose your Google account
4. Grant permissions
5. Redirected back to WanderLink
6. You should see your profile button in header

### 4.5 Verify Success
✅ Profile button shows your name/avatar
✅ Can click to see dropdown menu
✅ User saved to Supabase `users` table

---

## 🔍 How to Verify in Supabase

### Check Authentication Users
1. Go to: https://supabase.com/dashboard/project/xbspnzviiefekzosukfa/auth/users
2. You should see your Google account listed
3. Check the `email`, `provider` (should be "google"), and `last_sign_in_at`

### Check Users Table
1. Go to: https://supabase.com/dashboard/project/xbspnzviiefekzosukfa/editor
2. Click on `users` table
3. You should see a row with:
   - `email`: Your Google email
   - `name`: Your Google name
   - `created_at`: Recent timestamp

---

## 🎯 What's Been Implemented

### ✅ Authentication Flow
1. **Google Login Button** - Replaces wallet connect
2. **Auth Context** - Manages authentication state
3. **User Profile Button** - Shows when logged in
4. **Auto User Creation** - Creates user in database on first login
5. **Protected Routes** - Can check auth status
6. **Sign Out** - Clears session and local storage

### ✅ Components Created
- `contexts/AuthContext.tsx` - Global auth state
- `components/auth/GoogleLoginButton.tsx` - Login button
- `components/auth/UserProfileButton.tsx` - Profile dropdown
- `app/auth/callback/page.tsx` - OAuth callback handler
- Updated `components/layout/Header.tsx` - Uses new auth

### ✅ Features
- Automatic user creation on first login
- Profile dropdown with navigation
- Sign out functionality
- Loading states
- User avatar from Google
- LocalStorage integration for user ID

---

## 🐛 Troubleshooting

### Error: "redirect_uri_mismatch"
**Problem:** Redirect URI not authorized in Google Console

**Solution:**
1. Go to Google Cloud Console > Credentials
2. Click on your OAuth client
3. Add to Authorized redirect URIs:
   ```
   https://xbspnzviiefekzosukfa.supabase.co/auth/v1/callback
   http://localhost:3000/auth/callback
   ```
4. Save and wait 5 minutes for changes to propagate

### Error: "Invalid client"
**Problem:** Client ID or Secret incorrect in Supabase

**Solution:**
1. Double-check Client ID and Secret in Supabase Dashboard
2. Make sure there are no extra spaces
3. Save changes in Supabase

### Login redirects but user not created
**Problem:** API route not working

**Solution:**
1. Check browser console for errors
2. Verify `/api/user` route exists
3. Check Supabase credentials in `.env.local`
4. Restart frontend: `npm run dev`

### Profile button not showing
**Problem:** Auth state not loading

**Solution:**
1. Open browser DevTools > Application > Local Storage
2. Clear all WanderLink data
3. Refresh page
4. Try logging in again

---

## 🎉 Success Checklist

✅ Google OAuth credentials created  
✅ Redirect URIs configured in Google Console  
✅ Google provider enabled in Supabase  
✅ Client ID and Secret added to Supabase  
✅ Environment variables configured  
✅ Frontend running on localhost:3000  
✅ "Sign in with Google" button visible  
✅ Can click and authenticate  
✅ Profile button appears after login  
✅ User created in Supabase database  
✅ Can sign out successfully  

---

## 📚 Additional Resources

- [Supabase Google Auth Docs](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Next.js Authentication Patterns](https://nextjs.org/docs/authentication)

---

## 🔒 Security Notes

1. **Never commit secrets** - Client Secret should never be in git
2. **Use environment variables** - Already configured in `.env.local`
3. **HTTPS in production** - Google requires HTTPS for production apps
4. **Row Level Security** - Supabase RLS policies protect user data
5. **JWT tokens** - Supabase handles secure token management

---

## 🚀 Next Steps After Setup

Once Google login is working:

1. **Test the complete flow:**
   - Sign in with Google
   - Click "JOIN A TRIP" on /trips page
   - Fill preference form
   - Verify user data persists

2. **Customize the experience:**
   - Update user profile settings
   - Add more OAuth providers (GitHub, Facebook)
   - Implement role-based access

3. **Deploy to production:**
   - Update redirect URIs with production domain
   - Configure production environment variables
   - Test OAuth flow on live site

---

**You're all set! 🎉**

The authentication system is ready. Just configure the Google OAuth credentials in both Google Console and Supabase Dashboard, and users can sign in with Google!
