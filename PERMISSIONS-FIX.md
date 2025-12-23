# Fixing Authorization Errors

## The Problem
You're seeing: `The current user is not authorized to perform the requested action.`

This happens when Appwrite collection permissions don't match what the code expects.

## Quick Fix Steps

### 1. Check Collection Permissions in Appwrite Console

Go to: **Appwrite Console → Database → regimen-iq-db → Each Collection → Settings → Permissions**

Each collection (`patients`, `regimen_items`, `interactions`, `research_notes`, `appointment_briefs`, `audit_log`) should have:

```
✅ Create: Any authenticated user (Role: Users)
✅ Read: Any authenticated user (Role: Users)  
✅ Update: Any authenticated user (Role: Users)
✅ Delete: Any authenticated user (Role: Users)
```

### 2. Enable Document Security

Each collection should have **Document Security** enabled:
- Go to Collection → Settings → Security
- Toggle ON: "Document Security"

### 3. Verify Database ID

Check that your `.env.local` has:
```env
NEXT_PUBLIC_APPWRITE_DATABASE_ID=regimen-iq-db
```

### 4. Re-run Setup Script (If Needed)

If collections don't exist or permissions are wrong:

```bash
# Make sure you have APPWRITE_API_KEY in .env.local
node scripts/setup-appwrite.js
```

## Understanding the Permission System

With **Document Security enabled**, Appwrite checks BOTH:

1. **Collection-level permissions**: Can users of this type access this collection at all?
   - Set in Appwrite Console for the collection
   - Example: `Permission.create(Role.users())` = authenticated users can create

2. **Document-level permissions**: Can this specific user access this specific document?
   - Set when creating/updating documents in code
   - Example: `Permission.read(Role.user(userId))` = only this user can read

### Current Code Implementation

When creating a patient, we set:
```javascript
[
  Permission.read(Role.user(userId)),
  Permission.update(Role.user(userId)),
  Permission.delete(Role.user(userId)),
]
```

This means:
- ✅ Only the creator can read/update/delete their patients
- ✅ Other users cannot see this patient
- ❌ Won't work if collection permissions block `Role.users()`

## Common Errors and Solutions

### Error: 401 Unauthorized
**Cause**: User not logged in or session expired
**Fix**: Navigate to `/login` and log in again

### Error: 404 Not Found  
**Cause**: Database or collection doesn't exist
**Fix**: Run `node scripts/setup-appwrite.js`

### Error: User not authorized
**Cause**: Collection permissions too restrictive
**Fix**: Update collection permissions in Console (see step 1 above)

## Testing the Fix

1. Log out: Navigate to `/login` and ensure fresh session
2. Log back in
3. Try creating a patient
4. Check browser console - should see no errors
5. Patient should appear in list immediately

## Still Having Issues?

Check browser console for the specific error code:
- `401` = Authentication problem (re-login)
- `403` or `404` = Collection/database setup problem (check Appwrite Console)
- Other codes = Contact support with error details
