# Automated Appwrite Setup - Summary

## What Was Created

A Node.js script at `scripts/setup-appwrite.js` that automates the complete Appwrite database setup for RegimenIQ.

## Features

✅ **Automated Collection Creation**: Creates all 6 collections based on SCHEMA.md
✅ **Attribute Management**: Sets up all attributes with correct types, sizes, and constraints
✅ **Index Creation**: Creates query optimization indexes
✅ **Permission Configuration**: Enables document-level permissions for user isolation
✅ **Idempotent**: Safe to re-run - skips existing items
✅ **Error Handling**: Graceful error handling with clear messages
✅ **Progress Feedback**: Real-time progress messages during setup

## How to Use

### 1. Prerequisites
- Appwrite project created
- Database `regimen-iq-db` created
- API key with required permissions (see SETUP.md)

### 2. Configure Environment
Add to `.env.local`:
```bash
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://sfo.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=regimen-iq-db
APPWRITE_API_KEY=your_api_key
```

### 3. Run Setup
```bash
npm run setup
```

Or directly:
```bash
node scripts/setup-appwrite.js
```

## What It Creates

### Collection 1: patients
- **Attributes**: userId, name, relationship, diagnosis, diagnosisTags, notes, careTeam, createdAt, updatedAt
- **Indexes**: userId_idx
- **Permissions**: Document-level with user isolation

### Collection 2: regimen_items
- **Attributes**: userId, patientId, name, category, dosage, frequency, startDate, endDate, source, notes, isActive, createdAt, updatedAt
- **Indexes**: userId_idx, patientId_idx, isActive_idx
- **Permissions**: Document-level with user isolation

### Collection 3: interactions
- **Attributes**: userId, patientId, itemIds, severity, description, sources, discussedWithClinician, discussionNotes, createdAt, updatedAt
- **Indexes**: userId_idx, patientId_idx
- **Permissions**: Document-level with user isolation

### Collection 4: research_notes
- **Attributes**: userId, patientId, topic, tags, content, sources, relatedItems, createdAt, updatedAt
- **Indexes**: userId_idx, patientId_idx
- **Permissions**: Document-level with user isolation

### Collection 5: appointment_briefs
- **Attributes**: userId, patientId, appointmentDate, title, generatedContent, includedRegimen, includedInteractions, includedResearch, customNotes, createdAt, updatedAt
- **Indexes**: userId_idx, patientId_idx
- **Permissions**: Document-level with user isolation

### Collection 6: audit_log
- **Attributes**: userId, action, resource, resourceId, metadata, ipAddress, timestamp
- **Indexes**: userId_idx, timestamp_idx
- **Permissions**: Document-level (read-only for users)

## Technical Details

### Dependencies
- `node-appwrite`: Appwrite Node SDK for server-side operations
- Node.js 18+: For running the script

### Script Architecture
1. **Environment Loading**: Reads `.env.local` and parses variables
2. **Client Initialization**: Sets up Appwrite client with API key
3. **Collection Schemas**: Defined based on SCHEMA.md specifications
4. **Sequential Processing**: Creates collections → attributes → indexes
5. **Error Handling**: Catches 409 (already exists) and continues
6. **Timing**: Includes delays to allow Appwrite to process operations

### Key Functions
- `loadEnv()`: Parses .env.local file
- `initClient()`: Initializes Appwrite SDK
- `createCollection()`: Creates collection with permissions
- `createAttribute()`: Creates individual attributes (string, boolean, datetime)
- `createIndex()`: Creates indexes for query optimization

### Permissions Strategy
- **Document Security**: Enabled on all collections
- **Create**: Role.users() - Any authenticated user can create
- **Read/Update/Delete**: Controlled via document-level permissions in code
- **User Isolation**: Enforced by `userId` field and permission rules

## Benefits Over Manual Setup

| Manual Setup | Automated Script |
|-------------|-----------------|
| 30-45 minutes | 2-3 minutes |
| Error-prone (typos, missing fields) | Consistent and accurate |
| Hard to replicate | Run once per environment |
| No documentation of what was created | Self-documenting via code |
| Difficult to update | Easy to modify and re-run |

## Security Notes

⚠️ **API Key Security**:
1. The API key is ONLY needed for setup
2. After setup, delete the key from Appwrite Console
3. Remove `APPWRITE_API_KEY` from `.env.local`
4. Never commit API keys to version control
5. Use separate API keys for dev/staging/production

## Troubleshooting

### Script fails with "API key invalid"
- Verify API key is correct and not expired
- Check API key has all required scopes (see SETUP.md)
- Ensure endpoint and project ID are correct

### Collections already exist (409 errors)
- This is normal! The script skips existing items
- Safe to re-run if setup was interrupted
- Check Appwrite Console to verify collections were created

### Attributes not appearing
- Wait 30-60 seconds for Appwrite to process
- Refresh the Appwrite Console page
- Check for error messages in script output

### Rate limiting errors
- Script includes delays to avoid rate limits
- If you hit limits, wait 60 seconds and re-run
- Consider increasing delay values in script

## Future Enhancements

Potential improvements for future versions:
- [ ] Add data migration support for schema updates
- [ ] Support for multiple environments (dev/staging/prod)
- [ ] Rollback functionality
- [ ] Dry-run mode to preview changes
- [ ] Backup existing collections before modifications
- [ ] Parallel attribute creation for faster setup
- [ ] Validation of existing schema vs expected schema
- [ ] Support for custom collection IDs

## Related Documentation

- [SETUP.md](../SETUP.md) - Complete setup guide with API key instructions
- [SCHEMA.md](../SCHEMA.md) - Database schema specification
- [scripts/README.md](README.md) - Scripts directory documentation
- [Appwrite Databases Docs](https://appwrite.io/docs/products/databases)

## Success Metrics

After running the script successfully:
- ✅ 6 collections visible in Appwrite Console
- ✅ Each collection has all required attributes
- ✅ Indexes created for query optimization
- ✅ Document-level permissions enabled
- ✅ No error messages in script output
- ✅ Application can connect and create/read data

---

**Next Steps After Setup:**
1. Verify collections in Appwrite Console
2. Enable Email/Password authentication
3. Remove API key from environment
4. Run `npm run dev` to start the application
5. Register first user account
6. Test creating a patient and regimen items

**Time Saved**: ~30-40 minutes per environment setup!
