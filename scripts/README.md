# Setup Scripts

This directory contains utility scripts for RegimenIQ setup and maintenance.

## setup-appwrite.js

Automatically creates all Appwrite collections, attributes, indexes, and permissions based on [SCHEMA.md](../SCHEMA.md).

### Prerequisites

1. Appwrite project created
2. Database created (`regimen-iq-db`)
3. API key with database/collection/attribute/index permissions
4. Environment variables in `.env.local`:
   - `NEXT_PUBLIC_APPWRITE_ENDPOINT`
   - `NEXT_PUBLIC_APPWRITE_PROJECT_ID`
   - `NEXT_PUBLIC_APPWRITE_DATABASE_ID`
   - `APPWRITE_API_KEY`

### Usage

```bash
# Option 1: Using npm script
npm run setup

# Option 2: Direct execution
node scripts/setup-appwrite.js
```

### What It Does

1. ✅ Creates 6 collections:
   - `patients` - Patient profiles
   - `regimen_items` - Medications/supplements/therapies
   - `interactions` - Drug interaction records
   - `research_notes` - Research documentation
   - `appointment_briefs` - Generated appointment summaries
   - `audit_log` - Activity audit trail

2. ✅ Adds all attributes with correct types, sizes, and constraints
3. ✅ Creates indexes for query optimization
4. ✅ Enables document-level permissions for user isolation
5. ✅ Skips existing items (safe to re-run)

### Output Example

```
🚀 RegimenIQ Appwrite Setup
================================

📋 Configuration:
   Endpoint: https://sfo.cloud.appwrite.io/v1
   Project:  regimen-iq
   Database: regimen-iq-db

📦 Creating collection: Patients (patients)
   ✅ Collection created
   Creating attributes...
   ✅ userId (string)
   ✅ name (string)
   ✅ relationship (string)
   ...
   Creating indexes...
   ✅ Index: userId_idx on [userId]

================================
📊 Setup Summary
================================
✅ Collections processed: 6/6

🎉 Setup complete!
```

### Troubleshooting

For detailed troubleshooting, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md).

**Quick fixes:**

**Error: .env.local file not found**
- Create `.env.local` from `.env.example` and fill in your values

**Error: Missing required environment variables**
- Ensure all 4 variables are set in `.env.local`
- Check for typos in variable names

**Error: Invalid API key**
- Verify API key is correct and not expired
- Ensure API key has required scopes (see Prerequisites)

**Error: Database not found**
- Create database `regimen-iq-db` in Appwrite Console first

**Error: Collection already exists (409)**
- This is normal! The script will skip existing items and continue

**Error: Attribute already exists (409)**
- This is normal! The script will skip existing attributes

**Error: Permission denied / Not authorized**
- API key lacks required permissions
- Create new API key with all database/collection/attribute/index scopes

**Error: Rate limit exceeded**
- The script includes delays between operations
- If you hit limits, wait a minute and re-run
- Consider increasing delays in the script

### Security Notes

⚠️ **Important:** After setup is complete:
1. Delete the API key from Appwrite Console
2. Remove `APPWRITE_API_KEY` from `.env.local`
3. Never commit API keys to version control
4. The API key is only needed for setup, not runtime

### Future Scripts

Additional setup/maintenance scripts may be added here:
- Database migration scripts
- Data seeding for development
- Backup/restore utilities
- Analytics generation

---

For full setup instructions, see [SETUP.md](../SETUP.md).
