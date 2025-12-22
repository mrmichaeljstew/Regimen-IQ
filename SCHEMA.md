# RegimenIQ - Appwrite Database Schema

## Collections Overview

### 1. patients
- **Collection ID**: `patients`
- **Permissions**: Document-level (user can only access their own patients)

**Attributes**:
- `userId` (string, required) - Links to Appwrite user account
- `name` (string, required) - Patient name
- `relationship` (string) - "self", "spouse", "parent", "child", "other"
- `diagnosis` (string) - Primary diagnosis text
- `diagnosisTags` (string[]) - Searchable tags ["lung-cancer", "stage-3", etc]
- `notes` (string) - General patient notes
- `careTeam` (string) - JSON stringified array of care team contacts {name, role, phone, email}
- `createdAt` (datetime, required)
- `updatedAt` (datetime, required)

**Indexes**:
- `userId` (key index for filtering)

---

### 2. regimen_items
- **Collection ID**: `regimen_items`
- **Permissions**: Document-level (user can only access their own items)

**Attributes**:
- `userId` (string, required) - Owner user ID
- `patientId` (string, required) - Links to patients collection
- `name` (string, required) - Medication/supplement/therapy name
- `category` (string, required) - "medication", "supplement", "therapy", "other"
- `dosage` (string) - e.g., "10mg", "2 capsules"
- `frequency` (string) - e.g., "twice daily", "every 8 hours"
- `startDate` (datetime)
- `endDate` (datetime) - null for ongoing
- `source` (string) - Prescriber/source of recommendation
- `notes` (string)
- `isActive` (boolean, default: true)
- `createdAt` (datetime, required)
- `updatedAt` (datetime, required)

**Indexes**:
- `userId` (key index)
- `patientId` (key index)
- `isActive` (key index)

---

### 3. interactions
- **Collection ID**: `interactions`
- **Permissions**: Document-level

**Attributes**:
- `userId` (string, required)
- `patientId` (string, required)
- `itemIds` (string[]) - Array of regimen_item IDs involved (2+)
- `severity` (string) - "low", "moderate", "high", "unknown"
- `description` (string, required) - Interaction description
- `sources` (string) - JSON stringified array of source URLs/citations
- `discussedWithClinician` (boolean, default: false)
- `discussionNotes` (string)
- `createdAt` (datetime, required)
- `updatedAt` (datetime, required)

**Indexes**:
- `userId` (key index)
- `patientId` (key index)

---

### 4. research_notes
- **Collection ID**: `research_notes`
- **Permissions**: Document-level

**Attributes**:
- `userId` (string, required)
- `patientId` (string, required)
- `topic` (string, required) - Research topic
- `tags` (string[]) - Searchable tags
- `content` (string, required) - Research findings/notes
- `sources` (string) - JSON stringified array of sources
- `relatedItems` (string[]) - IDs of related regimen_items
- `createdAt` (datetime, required)
- `updatedAt` (datetime, required)

**Indexes**:
- `userId` (key index)
- `patientId` (key index)

---

### 5. appointment_briefs
- **Collection ID**: `appointment_briefs`
- **Permissions**: Document-level

**Attributes**:
- `userId` (string, required)
- `patientId` (string, required)
- `appointmentDate` (datetime)
- `title` (string, required)
- `generatedContent` (string, required) - Generated brief content (markdown)
- `includedRegimen` (string[]) - IDs of regimen_items included
- `includedInteractions` (string[]) - IDs of interactions included
- `includedResearch` (string[]) - IDs of research_notes included
- `customNotes` (string) - Additional notes for this brief
- `createdAt` (datetime, required)
- `updatedAt` (datetime, required)

**Indexes**:
- `userId` (key index)
- `patientId` (key index)

---

### 6. audit_log
- **Collection ID**: `audit_log`
- **Permissions**: User can only read their own logs

**Attributes**:
- `userId` (string, required)
- `action` (string, required) - "create", "update", "delete", "view"
- `resource` (string, required) - "patient", "regimen_item", "interaction", etc.
- `resourceId` (string) - ID of affected resource
- `metadata` (string) - JSON stringified additional context
- `ipAddress` (string)
- `timestamp` (datetime, required)

**Indexes**:
- `userId` (key index)
- `timestamp` (key index)

---

## Setup Instructions

1. Create database `regimen-iq-db` in Appwrite Console
2. Create each collection with attributes as specified
3. Set permissions:
   - Enable "Create documents" for authenticated users
   - Enable document-level permissions
   - Add permission rule: `document.user.id == userId` for read/update/delete

## Security Notes

- All collections filter by `userId` to ensure user isolation
- No cross-user data access permitted
- Audit logs track all CRUD operations
- Consider implementing rate limiting for API calls
- PHI kept minimal (no SSN, full DOB, full addresses)
