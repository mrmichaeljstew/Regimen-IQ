#!/usr/bin/env node

/**
 * Appwrite Setup Script
 * 
 * Automatically creates all 6 collections for RegimenIQ with attributes,
 * indexes, and permissions based on SCHEMA.md
 * 
 * Usage:
 *   1. Create an API key in Appwrite Console with Database permissions
 *   2. Add APPWRITE_API_KEY to .env.local
 *   3. Run: node scripts/setup-appwrite.js
 */

const { Client, Databases, Permission, Role, ID } = require("node-appwrite");
const fs = require("fs");
const path = require("path");

// Load environment variables from .env.local
function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) {
    console.error("❌ Error: .env.local file not found");
    console.error("   Create .env.local with APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_DATABASE_ID, and APPWRITE_API_KEY");
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, "utf8");
  const env = {};
  
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...valueParts] = trimmed.split("=");
      const value = valueParts.join("=");
      env[key] = value;
    }
  });

  return env;
}

// Initialize Appwrite client
function initClient(env) {
  const endpoint = env.NEXT_PUBLIC_APPWRITE_ENDPOINT || env.APPWRITE_ENDPOINT;
  const projectId = env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || env.APPWRITE_PROJECT_ID;
  const apiKey = env.APPWRITE_API_KEY;

  if (!endpoint || !projectId || !apiKey) {
    console.error("❌ Error: Missing required environment variables");
    console.error("   Required: APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY");
    process.exit(1);
  }

  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey);

  return new Databases(client);
}

// Collection schemas based on SCHEMA.md
const collections = [
  {
    id: "patients",
    name: "Patients",
    attributes: [
      { key: "userId", type: "string", size: 255, required: true },
      { key: "name", type: "string", size: 255, required: true },
      { key: "relationship", type: "string", size: 50, required: false },
      { key: "diagnosis", type: "string", size: 5000, required: false },
      { key: "diagnosisTags", type: "string", size: 50, required: false, array: true },
      { key: "notes", type: "string", size: 10000, required: false },
      { key: "careTeam", type: "string", size: 10000, required: false },
      { key: "createdAt", type: "datetime", required: true },
      { key: "updatedAt", type: "datetime", required: true },
    ],
    indexes: [
      { key: "userId_idx", type: "key", attributes: ["userId"] },
    ],
  },
  {
    id: "regimen_items",
    name: "Regimen Items",
    attributes: [
      { key: "userId", type: "string", size: 255, required: true },
      { key: "patientId", type: "string", size: 255, required: true },
      { key: "name", type: "string", size: 255, required: true },
      { key: "category", type: "string", size: 50, required: true },
      { key: "dosage", type: "string", size: 255, required: false },
      { key: "frequency", type: "string", size: 255, required: false },
      { key: "startDate", type: "datetime", required: false },
      { key: "endDate", type: "datetime", required: false },
      { key: "source", type: "string", size: 255, required: false },
      { key: "notes", type: "string", size: 5000, required: false },
      { key: "isActive", type: "boolean", required: true, default: true },
      { key: "createdAt", type: "datetime", required: true },
      { key: "updatedAt", type: "datetime", required: true },
    ],
    indexes: [
      { key: "userId_idx", type: "key", attributes: ["userId"] },
      { key: "patientId_idx", type: "key", attributes: ["patientId"] },
      { key: "isActive_idx", type: "key", attributes: ["isActive"] },
    ],
  },
  {
    id: "interactions",
    name: "Interactions",
    attributes: [
      { key: "userId", type: "string", size: 255, required: true },
      { key: "patientId", type: "string", size: 255, required: true },
      { key: "itemIds", type: "string", size: 255, required: true, array: true },
      { key: "severity", type: "string", size: 50, required: true },
      { key: "description", type: "string", size: 5000, required: true },
      { key: "sources", type: "string", size: 10000, required: false },
      { key: "discussedWithClinician", type: "boolean", required: true, default: false },
      { key: "discussionNotes", type: "string", size: 5000, required: false },
      { key: "createdAt", type: "datetime", required: true },
      { key: "updatedAt", type: "datetime", required: true },
    ],
    indexes: [
      { key: "userId_idx", type: "key", attributes: ["userId"] },
      { key: "patientId_idx", type: "key", attributes: ["patientId"] },
    ],
  },
  {
    id: "research_notes",
    name: "Research Notes",
    attributes: [
      { key: "userId", type: "string", size: 255, required: true },
      { key: "patientId", type: "string", size: 255, required: true },
      { key: "topic", type: "string", size: 255, required: true },
      { key: "tags", type: "string", size: 50, required: false, array: true },
      { key: "content", type: "string", size: 50000, required: true },
      { key: "sources", type: "string", size: 10000, required: false },
      { key: "relatedItems", type: "string", size: 255, required: false, array: true },
      { key: "createdAt", type: "datetime", required: true },
      { key: "updatedAt", type: "datetime", required: true },
    ],
    indexes: [
      { key: "userId_idx", type: "key", attributes: ["userId"] },
      { key: "patientId_idx", type: "key", attributes: ["patientId"] },
    ],
  },
  {
    id: "appointment_briefs",
    name: "Appointment Briefs",
    attributes: [
      { key: "userId", type: "string", size: 255, required: true },
      { key: "patientId", type: "string", size: 255, required: true },
      { key: "appointmentDate", type: "datetime", required: false },
      { key: "title", type: "string", size: 255, required: true },
      { key: "generatedContent", type: "string", size: 100000, required: true },
      { key: "includedRegimen", type: "string", size: 255, required: false, array: true },
      { key: "includedInteractions", type: "string", size: 255, required: false, array: true },
      { key: "includedResearch", type: "string", size: 255, required: false, array: true },
      { key: "customNotes", type: "string", size: 10000, required: false },
      { key: "createdAt", type: "datetime", required: true },
      { key: "updatedAt", type: "datetime", required: true },
    ],
    indexes: [
      { key: "userId_idx", type: "key", attributes: ["userId"] },
      { key: "patientId_idx", type: "key", attributes: ["patientId"] },
    ],
  },
  {
    id: "audit_log",
    name: "Audit Log",
    attributes: [
      { key: "userId", type: "string", size: 255, required: true },
      { key: "action", type: "string", size: 50, required: true },
      { key: "resource", type: "string", size: 100, required: true },
      { key: "resourceId", type: "string", size: 255, required: false },
      { key: "metadata", type: "string", size: 10000, required: false },
      { key: "ipAddress", type: "string", size: 50, required: false },
      { key: "timestamp", type: "datetime", required: true },
    ],
    indexes: [
      { key: "userId_idx", type: "key", attributes: ["userId"] },
      { key: "timestamp_idx", type: "key", attributes: ["timestamp"] },
    ],
  },
];

// Helper to create collection
async function createCollection(databases, databaseId, collection) {
  try {
    console.log(`\n📦 Creating collection: ${collection.name} (${collection.id})`);
    
    await databases.createCollection(
      databaseId,
      collection.id,
      collection.name,
      [
        Permission.create(Role.users()),
        Permission.read(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ],
      true // documentSecurity enabled for user isolation
    );
    
    console.log(`   ✅ Collection created`);
    return true;
  } catch (error) {
    if (error.code === 409) {
      console.log(`   ⚠️  Collection already exists, updating attributes...`);
      return true; // Continue to add attributes
    }
    if (error.code === 401) {
      console.error(`   ❌ Authentication failed: Invalid or expired API key`);
      console.error(`      Please verify your APPWRITE_API_KEY in .env.local`);
      console.error(`      Create a new key in: Appwrite Console → Settings → API Keys`);
      return false;
    }
    if (error.code === 403 || error.message.includes("not authorized")) {
      console.error(`   ❌ Permission denied: API key lacks required permissions`);
      console.error(`      Required scopes: databases, collections, attributes, indexes (read & write)`);
      console.error(`      Update key in: Appwrite Console → Settings → API Keys`);
      return false;
    }
    console.error(`   ❌ Error creating collection: ${error.message}`);
    return false;
  }
}

// Helper to create attribute
async function createAttribute(databases, databaseId, collectionId, attr) {
  try {
    const attrName = `${attr.key} (${attr.type}${attr.array ? "[]" : ""})`;
    
    if (attr.type === "string") {
      if (attr.array) {
        await databases.createStringAttribute(
          databaseId,
          collectionId,
          attr.key,
          attr.size,
          attr.required,
          null, // default
          true  // array
        );
      } else {
        await databases.createStringAttribute(
          databaseId,
          collectionId,
          attr.key,
          attr.size,
          attr.required,
          attr.default || null
        );
      }
    } else if (attr.type === "boolean") {
      await databases.createBooleanAttribute(
        databaseId,
        collectionId,
        attr.key,
        attr.required,
        attr.default !== undefined ? attr.default : null
      );
    } else if (attr.type === "datetime") {
      await databases.createDatetimeAttribute(
        databaseId,
        collectionId,
        attr.key,
        attr.required,
        attr.default || null
      );
    }
    
    console.log(`   ✅ ${attrName}`);
    return true;
  } catch (error) {
    if (error.code === 409) {
      console.log(`   ⏭️  ${attr.key} already exists`);
      return true;
    }
    console.error(`   ❌ Error creating ${attr.key}: ${error.message}`);
    return false;
  }
}

// Helper to create index
async function createIndex(databases, databaseId, collectionId, index) {
  try {
    await databases.createIndex(
      databaseId,
      collectionId,
      index.key,
      index.type,
      index.attributes
    );
    
    console.log(`   ✅ Index: ${index.key} on [${index.attributes.join(", ")}]`);
    return true;
  } catch (error) {
    if (error.code === 409) {
      console.log(`   ⏭️  Index ${index.key} already exists`);
      return true;
    }
    console.error(`   ❌ Error creating index ${index.key}: ${error.message}`);
    return false;
  }
}

// Main setup function
async function setup() {
  console.log("🚀 RegimenIQ Appwrite Setup");
  console.log("================================\n");

  // Load environment
  const env = loadEnv();
  const databaseId = env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || env.APPWRITE_DATABASE_ID || "regimen-iq-db";
  
  console.log(`📋 Configuration:`);
  console.log(`   Endpoint: ${env.NEXT_PUBLIC_APPWRITE_ENDPOINT || env.APPWRITE_ENDPOINT}`);
  console.log(`   Project:  ${env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || env.APPWRITE_PROJECT_ID}`);
  console.log(`   Database: ${databaseId}`);

  // Initialize client
  const databases = initClient(env);

  // Skip database verification - proceed directly to collection creation
  // The API key may have collection permissions without database.read permission
  console.log(`   Proceeding with database: ${databaseId}\n`);

  // Create collections
  let successCount = 0;
  let errorCount = 0;

  for (const collection of collections) {
    const created = await createCollection(databases, databaseId, collection);
    
    if (!created) {
      errorCount++;
      continue;
    }

    // Wait a bit for collection to be ready
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Create attributes
    console.log(`   Creating attributes...`);
    for (const attr of collection.attributes) {
      const attrCreated = await createAttribute(databases, databaseId, collection.id, attr);
      if (!attrCreated) {
        errorCount++;
      }
      // Small delay between attributes
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // Wait for attributes to be ready before creating indexes
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Create indexes
    if (collection.indexes && collection.indexes.length > 0) {
      console.log(`   Creating indexes...`);
      for (const index of collection.indexes) {
        const indexCreated = await createIndex(databases, databaseId, collection.id, index);
        if (!indexCreated) {
          errorCount++;
        }
        // Small delay between indexes
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    successCount++;
  }

  // Summary
  console.log("\n================================");
  console.log("📊 Setup Summary");
  console.log("================================");
  console.log(`✅ Collections processed: ${successCount}/${collections.length}`);
  if (errorCount > 0) {
    console.log(`⚠️  Errors encountered: ${errorCount}`);
  }
  
  console.log("\n🎉 Setup complete!");
  console.log("\n📝 Next steps:");
  console.log("   1. Verify collections in Appwrite Console");
  console.log("   2. Review document-level permissions");
  console.log("   3. Enable Email/Password auth in Appwrite Console");
  console.log("   4. Run: npm run dev");
  console.log("\n💡 Tip: You can re-run this script safely - it skips existing items.\n");
}

// Run setup
setup().catch((error) => {
  console.error("\n❌ Fatal error during setup:");
  console.error(error);
  process.exit(1);
});
