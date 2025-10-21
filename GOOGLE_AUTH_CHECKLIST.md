# ✅ Google Authentication - Quick Setup Checklist

## 🎯 5-Minute Setup Guide

Follow these steps in order to enable Google authentication:

---

## Step 1: Google Cloud Console (5 minutes)

### 1.1 Create Project
- [ ] Go to: https://console.cloud.google.com/
- [ ] Click "New Project"
- [ ] Name: "WanderLink"
- [ ] Click "Create"

### 1.2 Enable API
- [ ] Go to "APIs & Services" > "Library"
- [ ] Search: "Google+ API"
- [ ] Click "Enable"

### 1.3 Configure OAuth Consent
- [ ] Go to "APIs & Services" > "OAuth consent screen"
- [ ] User Type: **External**
- [ ] App name: **WanderLink**
- [ ] User support email: **your@email.com**
- [ ] Developer contact: **your@email.com**
- [ ] Click "Save and Continue" (3 times)

### 1.4 Create OAuth Client
- [ ] Go to "APIs & Services" > "Credentials"
- [ ] Click "Create Credentials" > "OAuth client ID"
- [ ] Application type: **Web application**
- [ ] Name: **WanderLink Web Client**

### 1.5 Add Authorized Origins
```
http://localhost:3000
https://xbspnzviiefekzosukfa.supabase.co
```
- [ ] Paste both URLs in "Authorized JavaScript origins"

### 1.6 Add Redirect URIs
```
https://xbspnzviiefekzosukfa.supabase.co/auth/v1/callback
http://localhost:3000/auth/callback
```
- [ ] Paste both URLs in "Authorized redirect URIs"

### 1.7 Copy Credentials
- [ ] Click "Create"
- [ ] **COPY Client ID** (save it!)
- [ ] **COPY Client Secret** (save it!)

---

## Step 2: Supabase Dashboard (2 minutes)

### 2.1 Open Supabase
- [ ] Go to: https://supabase.com/dashboard/project/xbspnzviiefekzosukfa
- [ ] Click "Authentication" in sidebar
- [ ] Click "Providers"

### 2.2 Configure Google Provider
- [ ] Find "Google" and expand it
- [ ] Toggle **"Enable Sign in with Google"** to ON
- [ ] Paste **Client ID** (from Step 1.7)
- [ ] Paste **Client Secret** (from Step 1.7)
- [ ] Click **"Save"** at bottom

✅ Configuration Complete!

---

## Step 3: Test Authentication (2 minutes)

### 3.1 Start Frontend
```powershell
cd D:\WanderLink\frontend
npm run dev
```

### 3.2 Open Browser
- [ ] Go to: http://localhost:3000
- [ ] Should see "Sign in with Google" button in header

### 3.3 Test Login
- [ ] Click "Sign in with Google" button
- [ ] Choose your Google account
- [ ] Grant permissions
- [ ] Should redirect back to WanderLink
- [ ] Profile button should appear in header

### 3.4 Verify Database
- [ ] Go to: https://supabase.com/dashboard/project/xbspnzviiefekzosukfa/auth/users
- [ ] Your Google account should be listed
- [ ] Go to: Table Editor > users
- [ ] Your user record should exist

### 3.5 Test Profile Dropdown
- [ ] Click profile button in header
- [ ] Dropdown should open
- [ ] Should show your name and email
- [ ] Links should work (Dashboard, My Trips, Profile)

### 3.6 Test Sign Out
- [ ] Click "Sign Out" in dropdown
- [ ] Should sign out
- [ ] "Sign in with Google" button should reappear

✅ All Tests Passed!

---

## 🐛 Troubleshooting

### Problem: "redirect_uri_mismatch" error

**Solution:**
- [ ] Double-check redirect URIs in Google Console
- [ ] Make sure you have BOTH:
  - `https://xbspnzviiefekzosukfa.supabase.co/auth/v1/callback`
  - `http://localhost:3000/auth/callback`
- [ ] Wait 5 minutes for changes to propagate

### Problem: "Invalid client" error

**Solution:**
- [ ] Verify Client ID in Supabase (no extra spaces)
- [ ] Verify Client Secret in Supabase (no extra spaces)
- [ ] Click "Save" again in Supabase
- [ ] Refresh your browser

### Problem: Login works but user not created

**Solution:**
- [ ] Check browser console (F12) for errors
- [ ] Verify Supabase credentials in `.env.local`
- [ ] Make sure frontend is running
- [ ] Check `/api/user` route exists

### Problem: Profile button not showing

**Solution:**
- [ ] Clear browser cache
- [ ] Clear localStorage (DevTools > Application > Local Storage)
- [ ] Refresh page
- [ ] Try logging in again

---

## ✅ Final Checklist

### Google Console:
- [ ] ✅ OAuth Client created
- [ ] ✅ Client ID copied
- [ ] ✅ Client Secret copied
- [ ] ✅ Authorized origins added
- [ ] ✅ Redirect URIs added

### Supabase:
- [ ] ✅ Google provider enabled
- [ ] ✅ Client ID pasted
- [ ] ✅ Client Secret pasted
- [ ] ✅ Configuration saved

### Testing:
- [ ] ✅ Frontend running
- [ ] ✅ Login button visible
- [ ] ✅ Can sign in with Google
- [ ] ✅ Profile button appears
- [ ] ✅ User in database
- [ ] ✅ Can sign out

---

## 🎉 Success!

If all boxes are checked, you have successfully implemented Google authentication!

**What You Can Do Now:**
- ✅ Users can sign in with Google
- ✅ One-click authentication
- ✅ Automatic user creation
- ✅ Profile management
- ✅ Session persistence
- ✅ Secure OAuth flow

**Next Steps:**
1. Test the complete user flow
2. Try "JOIN A TRIP" feature with Google login
3. Customize the user experience
4. Add more features!

---

## 📚 Need More Help?

See these detailed guides:
- **`GOOGLE_AUTH_SETUP.md`** - Complete setup documentation
- **`GOOGLE_AUTH_IMPLEMENTATION.md`** - Implementation details
- **`AUTH_VISUAL_GUIDE.md`** - Visual diagrams and flows

---

**Total Setup Time: ~10 minutes**

You're all set! 🚀
