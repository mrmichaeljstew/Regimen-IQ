# Fixing "Failed to fetch" Error on Sign In

## Problem
When trying to sign in at `https://regimeniq.appwrite.network/login`, you're getting a "Failed to fetch" error.

## Root Cause
The "Failed to fetch" error occurs when the browser cannot make a network request to the Appwrite backend. This is typically caused by:

1. **Missing Platform Configuration** - The deployment domain must be registered in your Appwrite project
2. **CORS Issues** - Cross-Origin Resource Sharing restrictions prevent the request
3. **Incorrect Endpoint Configuration** - The Appwrite endpoint or project ID is not set correctly

## Solution

### Step 1: Add Web Platform in Appwrite Console

This is the most likely cause of the error. You need to register your deployment domain with Appwrite:

1. Go to [Appwrite Console](https://cloud.appwrite.io)
2. Select your project (`regimen-iq`)
3. Navigate to **Settings** → **Platforms**
4. Click **"Add Platform"**
5. Select **"Web App"**
6. Enter the following details:
   - **Name**: `RegimenIQ Production` (or any descriptive name)
   - **Hostname**: `regimeniq.appwrite.network`
   - Leave **Port** empty (will default to 443 for HTTPS)
7. Click **"Next"** or **"Create"**

**Important**: Do NOT include `https://` or `http://` in the hostname - just enter `regimeniq.appwrite.network`

### Step 2: Verify Environment Variables

Ensure your deployment has the correct environment variables set:

```
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://sfo.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=regimen-iq
NEXT_PUBLIC_APPWRITE_DATABASE_ID=regimen-iq-db
```

Note: Your Appwrite Cloud console URL may look like `.../console/project-sfo-regimen-iq/...`.
The SDK **project ID** is just `regimen-iq` (the part after `project-sfo-`).

### Step 3: Add Additional Hostnames (if needed)

If you're also testing from `localhost` or have other deployment environments, add those as separate web platforms:

- `localhost` (for local development)
- Any preview/staging URLs

### Step 4: Wait and Test

- After adding the platform, wait 1-2 minutes for the changes to propagate
- Clear your browser cache or open an incognito window
- Try signing in again

## Verification

Once the platform is added correctly, you should be able to:
1. Navigate to `/login`
2. Enter email and password
3. Sign in successfully without "Failed to fetch" errors

## Additional Troubleshooting

### If the error persists:

1. **Check Browser Console**
   - Open DevTools (F12)
   - Go to Console tab
   - Look for detailed error messages
   - Check Network tab for failed requests

2. **Verify Appwrite Project**
   - Ensure the project ID matches (`regimen-iq`)
   - Confirm Email/Password auth is enabled
   - Check that the database and collections exist

3. **Test the Connection**
   - You can use the demo ping functionality to test if the Appwrite endpoint is reachable
   - If ping fails, it's definitely a platform/CORS issue

4. **Check for Typos**
   - Verify the hostname in Platform settings exactly matches your deployment URL
   - Ensure no trailing slashes or extra characters

## Common Mistakes

❌ **Wrong**: `https://regimeniq.appwrite.network` (includes protocol)
✅ **Correct**: `regimeniq.appwrite.network` (hostname only)

❌ **Wrong**: `regimeniq.appwrite.network/` (trailing slash)
✅ **Correct**: `regimeniq.appwrite.network` (no trailing slash)

## References

- [Appwrite Web Platform Documentation](https://appwrite.io/docs/getting-started-for-web)
- [Appwrite CORS Documentation](https://appwrite.io/docs/cors)
