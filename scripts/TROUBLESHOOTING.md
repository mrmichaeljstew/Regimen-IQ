# Setup Script Troubleshooting Guide

Common issues and solutions when running `npm run setup`.

## Error: .env.local file not found

**Symptom:**
```
❌ Error: .env.local file not found
   Create .env.local with APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID...
```

**Solution:**
1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Edit `.env.local` and fill in your actual values
3. Re-run `npm run setup`

---

## Error: Missing required environment variables

**Symptom:**
```
❌ Error: Missing required environment variables
   Required: APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY
```

**Solution:**
Check that your `.env.local` contains all 4 required variables:
```bash
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://sfo.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=regimen-iq-db
APPWRITE_API_KEY=your_api_key
```

**Common mistakes:**
- Typos in variable names (must match exactly)
- Missing `=` between key and value
- Extra spaces around the `=` sign
- Using `#` comments on the same line as values

---

## Error: Database not found

**Symptom:**
```
❌ Error: Database 'regimen-iq-db' not found
   Please create the database in Appwrite Console first.
```

**Solution:**
1. Go to your Appwrite Console
2. Navigate to "Databases" in the sidebar
3. Click "Create Database"
4. Set name/ID to: `regimen-iq-db`
5. Click Create
6. Re-run `npm run setup`

---

## Error: Authentication failed / Invalid API key

**Symptom:**
```
❌ Authentication failed: Invalid or expired API key
   Please verify your APPWRITE_API_KEY in .env.local
```

**Possible causes:**
1. **API key is incorrect**: Double-check you copied the entire key
2. **API key expired**: Check expiration date in Appwrite Console
3. **Wrong project**: Verify `APPWRITE_PROJECT_ID` matches the project where you created the API key

**Solution:**
1. Go to Appwrite Console → Settings → API Keys
2. Find your key or create a new one
3. Verify it's not expired
4. Copy the key again (carefully, without extra spaces)
5. Update `APPWRITE_API_KEY` in `.env.local`
6. Re-run `npm run setup`

---

## Error: Permission denied / Not authorized

**Symptom:**
```
❌ Permission denied: API key lacks required permissions
   Required scopes: databases, collections, attributes, indexes (read & write)
```

**Solution:**
Your API key doesn't have the necessary permissions. Create a new API key:

1. Go to: Appwrite Console → Settings → API Keys
2. Click "Create API Key"
3. Set name: "Setup Script" (or similar)
4. Select these scopes (check ALL of them):
   - ✅ `databases.read`
   - ✅ `databases.write`
   - ✅ `collections.read`
   - ✅ `collections.write`
   - ✅ `attributes.read`
   - ✅ `attributes.write`
   - ✅ `indexes.read`
   - ✅ `indexes.write`
5. Set expiration (recommend 1 day for setup)
6. Click "Create"
7. Copy the new API key
8. Update `APPWRITE_API_KEY` in `.env.local`
9. Re-run `npm run setup`

**After successful setup:**
- Delete this API key from Appwrite Console
- Remove `APPWRITE_API_KEY` from `.env.local`

---

## Warning: Collection already exists (409)

**Symptom:**
```
⚠️  Collection already exists, updating attributes...
```

**This is NORMAL!** The script is designed to:
- Skip existing collections
- Add any missing attributes
- Continue without errors

You can safely re-run the script multiple times.

---

## Warning: Attribute already exists (409)

**Symptom:**
```
⏭️  userId already exists
⏭️  name already exists
```

**This is NORMAL!** The script skips attributes that already exist. This allows you to:
- Re-run the script if setup was interrupted
- Add new attributes in future schema updates
- Safely run setup multiple times

---

## Error: Rate limit exceeded

**Symptom:**
```
❌ Error: Rate limit exceeded
```

**Solution:**
1. Wait 60 seconds
2. Re-run `npm run setup`

The script includes delays between operations, but if you've been making many API calls manually, you might hit rate limits.

**Prevention:**
- Don't run the script multiple times in quick succession
- Avoid manual API calls while script is running
- On self-hosted Appwrite, adjust rate limit settings if needed

---

## Collections created but attributes missing

**Symptom:**
Collections appear in Console but have no attributes.

**Solution:**
1. Wait 30-60 seconds for Appwrite to finish processing
2. Refresh the Appwrite Console page
3. Check script output for attribute creation errors
4. If attributes are still missing, re-run: `npm run setup`

**Note:** The script includes delays, but Appwrite may need extra time to process on slower connections.

---

## Indexes not appearing

**Symptom:**
Collections and attributes exist, but indexes are missing.

**Cause:**
Indexes require attributes to exist first. If attribute creation failed, indexes can't be created.

**Solution:**
1. Verify all attributes exist in Appwrite Console
2. Re-run `npm run setup` to create missing indexes
3. Check for error messages about specific indexes

---

## Script hangs or times out

**Symptom:**
Script stops responding during execution.

**Possible causes:**
1. Network connectivity issues
2. Appwrite server unresponsive
3. Rate limiting (no error shown)

**Solution:**
1. Check your internet connection
2. Check Appwrite status: https://status.appwrite.io
3. Wait 2-3 minutes, then Ctrl+C to cancel
4. Re-run `npm run setup`

---

## node-appwrite module not found

**Symptom:**
```
Error: Cannot find module 'node-appwrite'
```

**Solution:**
```bash
npm install
```

This installs `node-appwrite` (it's in devDependencies).

---

## Self-hosted Appwrite connection issues

**Symptom:**
Script can't connect to self-hosted Appwrite instance.

**Solutions:**

1. **Check endpoint URL:**
   ```bash
   # Should NOT end with /v1 for some self-hosted versions
   NEXT_PUBLIC_APPWRITE_ENDPOINT=http://localhost/v1
   # or
   NEXT_PUBLIC_APPWRITE_ENDPOINT=https://appwrite.yourdomain.com/v1
   ```

2. **Verify SSL certificates:**
   - For self-signed certificates, you may need to disable SSL verification (dev only!)
   - For production, use valid SSL certificates

3. **Check firewall/network:**
   - Ensure port 80/443 is accessible
   - Check Docker network settings if running in containers

---

## Debugging Tips

### Enable verbose output

Modify the script to see more details:

```javascript
// At the top of setup-appwrite.js
const DEBUG = true;

// Then add console.log statements as needed
if (DEBUG) console.log('Creating attribute:', attr);
```

### Test API key manually

Test your API key with a simple script:

```javascript
const { Client, Databases } = require("node-appwrite");

const client = new Client()
  .setEndpoint("https://sfo.cloud.appwrite.io/v1")
  .setProject("your-project-id")
  .setKey("your-api-key");

const databases = new Databases(client);

databases.list().then(
  result => console.log("Success:", result),
  error => console.error("Error:", error)
);
```

Run: `node test-api-key.js`

### Check Appwrite Console logs

1. Go to Appwrite Console
2. Navigate to "Logs" section
3. Look for errors around the time you ran the script
4. Filter by "Databases" category

---

## Still Having Issues?

If none of these solutions work:

1. **Check the docs:**
   - [SETUP.md](../SETUP.md) - Full setup guide
   - [scripts/README.md](README.md) - Script documentation
   - [Appwrite Docs](https://appwrite.io/docs)

2. **Verify environment:**
   ```bash
   cat .env.local  # Check your config
   npm list node-appwrite  # Verify SDK installed
   node --version  # Ensure Node 18+
   ```

3. **Try manual setup:**
   - Follow [SETUP.md](../SETUP.md) for manual collection creation
   - Helps identify if issue is with script or Appwrite connection

4. **Create GitHub issue:**
   - Include script output (remove API key!)
   - Include Node.js version
   - Include steps to reproduce
   - Repository: https://github.com/mrmichaeljstew/Regimen-IQ

---

## Success Checklist

After successful setup, you should see:

- ✅ All 6 collections in Appwrite Console
- ✅ Each collection has 7-13 attributes
- ✅ Indexes created (1-3 per collection)
- ✅ Document-level permissions enabled
- ✅ Script output shows no errors
- ✅ Summary shows: "Collections processed: 6/6"

**Next steps:**
1. Enable Email/Password auth in Console
2. Delete setup API key
3. Remove `APPWRITE_API_KEY` from `.env.local`
4. Run `npm run dev`
5. Test registration and login

---

**Last updated:** December 2024
