# Manual Appwrite Collection Setup Guide

## Prerequisites
1. Access to Appwrite Console at https://sfo.cloud.appwrite.io
2. Database ID: `6949d07600128378fb6d`
3. Project: `regimen-iq`

## Step-by-Step Instructions

### Collection 1: Patients

1. **Create Collection**
   - Go to Databases → `6949d07600128378fb6d` → Create Collection
   - Collection ID: `patients`
   - Collection Name: `Patients`
   - Permissions: Enable Document Security
   - Collection Permissions: `Create`, `Read`, `Update`, `Delete` for `Any`

2. **Add Attributes** (Add each in order, wait for status to be "available" before next):
   - `userId` - String - Size: 255 - Required ✓
   - `name` - String - Size: 255 - Required ✓
   - `relationship` - String - Size: 50
   - `diagnosis` - String - Size: 5000
   - `diagnosisTags` - String - Size: 50 - Array ✓
   - `notes` - String - Size: 10000
   - `careTeam` - String - Size: 10000
   - `createdAt` - DateTime - Required ✓
   - `updatedAt` - DateTime - Required ✓

3. **Create Indexes**:
   - Key: `userId_idx` - Type: Key - Attribute: `userId`

---

### Collection 2: Regimen Items

1. **Create Collection**
   - Collection ID: `regimen_items`
   - Collection Name: `Regimen Items`
   - Permissions: Enable Document Security
   - Collection Permissions: `Create`, `Read`, `Update`, `Delete` for `Any`

2. **Add Attributes**:
   - `userId` - String - Size: 255 - Required ✓
   - `patientId` - String - Size: 255 - Required ✓
   - `name` - String - Size: 255 - Required ✓
   - `category` - String - Size: 50 - Required ✓
   - `dosage` - String - Size: 255
   - `frequency` - String - Size: 255
   - `startDate` - DateTime
   - `endDate` - DateTime
   - `source` - String - Size: 255
   - `notes` - String - Size: 5000
   - `isActive` - Boolean - Required ✓ - Default: `true`
   - `createdAt` - DateTime - Required ✓
   - `updatedAt` - DateTime - Required ✓

3. **Create Indexes**:
   - Key: `userId_idx` - Type: Key - Attribute: `userId`
   - Key: `patientId_idx` - Type: Key - Attribute: `patientId`
   - Key: `isActive_idx` - Type: Key - Attribute: `isActive`

---

### Collection 3: Interactions

1. **Create Collection**
   - Collection ID: `interactions`
   - Collection Name: `Interactions`
   - Permissions: Enable Document Security
   - Collection Permissions: `Create`, `Read`, `Update`, `Delete` for `Any`

2. **Add Attributes**:
   - `userId` - String - Size: 255 - Required ✓
   - `patientId` - String - Size: 255 - Required ✓
   - `itemIds` - String - Size: 255 - Required ✓ - Array ✓
   - `severity` - String - Size: 50 - Required ✓
   - `description` - String - Size: 5000 - Required ✓
   - `sources` - String - Size: 10000
   - `discussedWithClinician` - Boolean - Required ✓ - Default: `false`
   - `discussionNotes` - String - Size: 5000
   - `createdAt` - DateTime - Required ✓
   - `updatedAt` - DateTime - Required ✓

3. **Create Indexes**:
   - Key: `userId_idx` - Type: Key - Attribute: `userId`
   - Key: `patientId_idx` - Type: Key - Attribute: `patientId`

---

### Collection 4: Research Notes

1. **Create Collection**
   - Collection ID: `research_notes`
   - Collection Name: `Research Notes`
   - Permissions: Enable Document Security
   - Collection Permissions: `Create`, `Read`, `Update`, `Delete` for `Any`

2. **Add Attributes**:
   - `userId` - String - Size: 255 - Required ✓
   - `patientId` - String - Size: 255 - Required ✓
   - `topic` - String - Size: 255 - Required ✓
   - `tags` - String - Size: 50 - Array ✓
   - `content` - String - Size: 50000 - Required ✓
   - `sources` - String - Size: 10000
   - `relatedItems` - String - Size: 255 - Array ✓
   - `createdAt` - DateTime - Required ✓
   - `updatedAt` - DateTime - Required ✓

3. **Create Indexes**:
   - Key: `userId_idx` - Type: Key - Attribute: `userId`
   - Key: `patientId_idx` - Type: Key - Attribute: `patientId`

---

### Collection 5: Appointment Briefs

1. **Create Collection**
   - Collection ID: `appointment_briefs`
   - Collection Name: `Appointment Briefs`
   - Permissions: Enable Document Security
   - Collection Permissions: `Create`, `Read`, `Update`, `Delete` for `Any`

2. **Add Attributes**:
   - `userId` - String - Size: 255 - Required ✓
   - `patientId` - String - Size: 255 - Required ✓
   - `appointmentDate` - DateTime
   - `title` - String - Size: 255 - Required ✓
   - `generatedContent` - String - Size: 100000 - Required ✓
   - `includedRegimen` - String - Size: 255 - Array ✓
   - `includedInteractions` - String - Size: 255 - Array ✓
   - `includedResearch` - String - Size: 255 - Array ✓
   - `customNotes` - String - Size: 10000
   - `createdAt` - DateTime - Required ✓
   - `updatedAt` - DateTime - Required ✓

3. **Create Indexes**:
   - Key: `userId_idx` - Type: Key - Attribute: `userId`
   - Key: `patientId_idx` - Type: Key - Attribute: `patientId`

---

### Collection 6: Audit Log

1. **Create Collection**
   - Collection ID: `audit_log`
   - Collection Name: `Audit Log`
   - Permissions: Enable Document Security
   - Collection Permissions: `Create`, `Read`, `Update`, `Delete` for `Any`

2. **Add Attributes**:
   - `userId` - String - Size: 255 - Required ✓
   - `action` - String - Size: 50 - Required ✓
   - `resource` - String - Size: 100 - Required ✓
   - `resourceId` - String - Size: 255
   - `metadata` - String - Size: 10000
   - `ipAddress` - String - Size: 50
   - `timestamp` - DateTime - Required ✓

3. **Create Indexes**:
   - Key: `userId_idx` - Type: Key - Attribute: `userId`
   - Key: `timestamp_idx` - Type: Key - Attribute: `timestamp`

---

## Tips

- **Wait between attributes**: Appwrite processes attributes asynchronously. Wait for each attribute to show "available" status before adding the next one.
- **Document Security**: Must be enabled for user isolation to work properly.
- **Collection Permissions**: Set to `Any` at collection level, then use document-level permissions for user isolation.
- **Indexes**: Add these last, after all attributes are available.

## Verification

After setup, verify each collection has:
- ✓ Correct number of attributes
- ✓ All indexes created
- ✓ Document security enabled
- ✓ Collection permissions set correctly
