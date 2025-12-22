# RegimenIQ - Appwrite Setup Guide

This guide will walk you through setting up the Appwrite backend for RegimenIQ.

## Prerequisites

- An Appwrite Cloud account (free tier available at [cloud.appwrite.io](https://cloud.appwrite.io))
- Or a self-hosted Appwrite instance (version 1.4+)

## Step 1: Create Appwrite Project

1. Log in to your Appwrite Console
2. Click "Create Project"
3. Name it "RegimenIQ" (or your preferred name)
4. Note your **Project ID** - you'll need this for `.env.local`

## Step 2: Create Database

1. Navigate to "Databases" in the left sidebar
2. Click "Create Database"
3. Name it: `regimen-iq-db`
4. Note the **Database ID** - you'll need this for `.env.local`

## Step 3: Create Collections

You need to create 6 collections. For each collection:

### Collection 1: patients

**Collection ID:** `patients`

**Attributes:**
- `userId` (String, 255, required)
- `name` (String, 255, required)
- `relationship` (String, 50)
- `diagnosis` (String, 1000)
- `diagnosisTags` (String[], 100 each, array size: 50)
- `notes` (String, 5000)
- `careTeam` (String, 10000) - JSON stringified
- `createdAt` (DateTime, required)
- `updatedAt` (DateTime, required)

**Indexes:**
- Index key: `userId_idx`, Type: Key, Attribute: `userId`, Order: ASC

**Permissions:**
- Document Security: Enabled
- Create documents: All Users
- Read, Update, Delete: Document permissions (set via code)

---

### Collection 2: regimen_items

**Collection ID:** `regimen_items`

**Attributes:**
- `userId` (String, 255, required)
- `patientId` (String, 255, required)
- `name` (String, 255, required)
- `category` (String, 50, required) - enum: medication, supplement, therapy, other
- `dosage` (String, 255)
- `frequency` (String, 255)
- `startDate` (DateTime)
- `endDate` (DateTime)
- `source` (String, 500)
- `notes` (String, 2000)
- `isActive` (Boolean, required, default: true)
- `createdAt` (DateTime, required)
- `updatedAt` (DateTime, required)

**Indexes:**
- `userId_idx`: Key, `userId`, ASC
- `patientId_idx`: Key, `patientId`, ASC
- `isActive_idx`: Key, `isActive`, ASC

**Permissions:**
- Document Security: Enabled
- Create documents: All Users
- Read, Update, Delete: Document permissions

---

### Collection 3: interactions

**Collection ID:** `interactions`

**Attributes:**
- `userId` (String, 255, required)
- `patientId` (String, 255, required)
- `itemIds` (String[], 255 each, array size: 20)
- `severity` (String, 50, required) - enum: low, moderate, high, unknown
- `description` (String, 2000, required)
- `sources` (String, 5000) - JSON stringified
- `discussedWithClinician` (Boolean, default: false)
- `discussionNotes` (String, 2000)
- `createdAt` (DateTime, required)
- `updatedAt` (DateTime, required)

**Indexes:**
- `userId_idx`: Key, `userId`, ASC
- `patientId_idx`: Key, `patientId`, ASC

**Permissions:**
- Document Security: Enabled
- Create documents: All Users
- Read, Update, Delete: Document permissions

---

### Collection 4: research_notes

**Collection ID:** `research_notes`

**Attributes:**
- `userId` (String, 255, required)
- `patientId` (String, 255, required)
- `topic` (String, 500, required)
- `tags` (String[], 100 each, array size: 20)
- `content` (String, 10000, required)
- `sources` (String, 5000) - JSON stringified
- `relatedItems` (String[], 255 each, array size: 50)
- `createdAt` (DateTime, required)
- `updatedAt` (DateTime, required)

**Indexes:**
- `userId_idx`: Key, `userId`, ASC
- `patientId_idx`: Key, `patientId`, ASC

**Permissions:**
- Document Security: Enabled
- Create documents: All Users
- Read, Update, Delete: Document permissions

---

### Collection 5: appointment_briefs

**Collection ID:** `appointment_briefs`

**Attributes:**
- `userId` (String, 255, required)
- `patientId` (String, 255, required)
- `appointmentDate` (DateTime)
- `title` (String, 500, required)
- `generatedContent` (String, 50000, required)
- `includedRegimen` (String[], 255 each, array size: 100)
- `includedInteractions` (String[], 255 each, array size: 50)
- `includedResearch` (String[], 255 each, array size: 50)
- `customNotes` (String, 5000)
- `createdAt` (DateTime, required)
- `updatedAt` (DateTime, required)

**Indexes:**
- `userId_idx`: Key, `userId`, ASC
- `patientId_idx`: Key, `patientId`, ASC

**Permissions:**
- Document Security: Enabled
- Create documents: All Users
- Read, Update, Delete: Document permissions

---

### Collection 6: audit_log

**Collection ID:** `audit_log`

**Attributes:**
- `userId` (String, 255, required)
- `action` (String, 50, required) - enum: create, update, delete, view
- `resource` (String, 100, required)
- `resourceId` (String, 255)
- `metadata` (String, 2000) - JSON stringified
- `ipAddress` (String, 50)
- `timestamp` (DateTime, required)

**Indexes:**
- `userId_idx`: Key, `userId`, ASC
- `timestamp_idx`: Key, `timestamp`, DESC

**Permissions:**
- Document Security: Enabled
- Create documents: All Users
- Read: Document permissions (user can only read their own logs)
- Update, Delete: None (audit logs are append-only)

---

## Step 4: Configure Environment Variables

Copy your credentials to `.env.local`:

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://sfo.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id-here
NEXT_PUBLIC_APPWRITE_DATABASE_ID=regimen-iq-db
```

Replace:
- `your-project-id-here` with your Project ID from Step 1
- If using self-hosted Appwrite, update the endpoint URL

## Step 5: Enable Authentication

1. In Appwrite Console, go to "Auth" section
2. Ensure "Email/Password" is enabled
3. (Optional) Configure email templates for password reset

## Step 6: Test the Setup

1. Start your development server: `npm run dev`
2. Navigate to [http://localhost:3000](http://localhost:3000)
3. Register a new account
4. Try creating a patient profile

## Troubleshooting

### "Collection not found" errors
- Verify all collection IDs match exactly (case-sensitive)
- Check that Database ID is correct in `.env.local`

### "Unauthorized" errors
- Ensure document-level permissions are enabled for all collections
- Verify "Create documents" is enabled for "All Users"

### "Attribute not found" errors
- Double-check all attributes are created with correct types and sizes
- Ensure required fields are marked as required

### Authentication issues
- Verify Email/Password authentication is enabled in Appwrite Console
- Check Project ID is correct in `.env.local`

## Security Notes

1. **Document-Level Permissions:** All collections use document-level permissions set programmatically via the `Permission` class. This ensures users can only access their own data.

2. **Audit Logs:** The audit_log collection is append-only (no update/delete permissions) to maintain data integrity.

3. **API Keys:** Never commit your Appwrite credentials to version control. Always use `.env.local` (which is gitignored).

4. **Rate Limiting:** Consider enabling rate limiting in Appwrite Console for production deployments.

## Next Steps

Once setup is complete:
1. Review [SCHEMA.md](SCHEMA.md) for detailed database documentation
2. See [README.md](README.md) for application features and usage
3. Start building your treatment management workflow!

## Support

- [Appwrite Documentation](https://appwrite.io/docs)
- [Appwrite Discord Community](https://appwrite.io/discord)
- [RegimenIQ Issues](https://github.com/mrmichaeljstew/Regimen-IQ/issues)
