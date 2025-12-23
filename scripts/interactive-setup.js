#!/usr/bin/env node

/**
 * Interactive Appwrite Setup - Collection Configuration Helper
 * 
 * This script provides an interactive way to set up Appwrite collections
 * with copy-paste commands for the Appwrite Console or CLI.
 */

const readline = require("readline");
const fs = require("fs");
const path = require("path");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Load environment
function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) {
    return {};
  }
  const envContent = fs.readFileSync(envPath, "utf8");
  const env = {};
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...valueParts] = trimmed.split("=");
      env[key] = valueParts.join("=");
    }
  });
  return env;
}

const env = loadEnv();
const DATABASE_ID = env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || env.APPWRITE_DATABASE_ID || "6949d07600128378fb6d";
const PROJECT_ID = env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || env.APPWRITE_PROJECT_ID || "regimen-iq";
const ENDPOINT = env.NEXT_PUBLIC_APPWRITE_ENDPOINT || env.APPWRITE_ENDPOINT || "https://sfo.cloud.appwrite.io/v1";

// Collection schemas
const collections = {
  patients: {
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
    indexes: [{ key: "userId_idx", attributes: ["userId"] }],
  },
  regimen_items: {
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
      { key: "userId_idx", attributes: ["userId"] },
      { key: "patientId_idx", attributes: ["patientId"] },
      { key: "isActive_idx", attributes: ["isActive"] },
    ],
  },
  interactions: {
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
      { key: "userId_idx", attributes: ["userId"] },
      { key: "patientId_idx", attributes: ["patientId"] },
    ],
  },
  research_notes: {
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
      { key: "userId_idx", attributes: ["userId"] },
      { key: "patientId_idx", attributes: ["patientId"] },
    ],
  },
  appointment_briefs: {
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
      { key: "userId_idx", attributes: ["userId"] },
      { key: "patientId_idx", attributes: ["patientId"] },
    ],
  },
  audit_log: {
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
      { key: "userId_idx", attributes: ["userId"] },
      { key: "timestamp_idx", attributes: ["timestamp"] },
    ],
  },
};

console.log("\n🚀 RegimenIQ Appwrite Interactive Setup");
console.log("========================================\n");
console.log(`Project: ${PROJECT_ID}`);
console.log(`Database: ${DATABASE_ID}`);
console.log(`Endpoint: ${ENDPOINT}\n`);

console.log("This interactive tool will guide you through setting up collections.\n");
console.log("Choose your setup method:\n");
console.log("1. Manual Setup (Web Console) - Recommended if API key issues persist");
console.log("2. View Collection Details");
console.log("3. Generate Appwrite CLI Commands");
console.log("4. Exit\n");

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

function printCollectionDetails(collectionId) {
  const collection = collections[collectionId];
  console.log(`\n${"=".repeat(60)}`);
  console.log(`Collection: ${collection.name} (${collectionId})`);
  console.log("=".repeat(60));
  
  console.log("\n📋 Attributes:");
  collection.attributes.forEach((attr, i) => {
    const required = attr.required ? " [REQUIRED]" : "";
    const array = attr.array ? "[]" : "";
    const defaultVal = attr.default !== undefined ? ` (default: ${attr.default})` : "";
    const size = attr.size ? ` (size: ${attr.size})` : "";
    console.log(`  ${i + 1}. ${attr.key} - ${attr.type}${array}${size}${required}${defaultVal}`);
  });

  console.log("\n📊 Indexes:");
  collection.indexes.forEach((idx, i) => {
    console.log(`  ${i + 1}. ${idx.key} on [${idx.attributes.join(", ")}]`);
  });
}

async function manualSetup() {
  console.log("\n📖 Manual Setup Guide");
  console.log("====================\n");
  console.log("A detailed guide has been created at:");
  console.log("  📄 scripts/manual-setup-guide.md\n");
  console.log("Open the Appwrite Console:");
  console.log(`  🌐 ${ENDPOINT.replace('/v1', '')}`);
  console.log(`\nNavigate to: Databases → ${DATABASE_ID}\n`);
  
  console.log("Follow these steps for EACH collection:\n");
  console.log("1. Click 'Create Collection'");
  console.log("2. Set Collection ID and Name (see guide)");
  console.log("3. Enable 'Document Security'");
  console.log("4. Add attributes ONE AT A TIME (wait for 'available' status)");
  console.log("5. Create indexes AFTER all attributes are ready\n");
  
  const viewDetails = await ask("Would you like to see details for a specific collection? (1-6 or 'no'): ");
  
  if (viewDetails !== "no" && viewDetails !== "n") {
    const collectionIds = Object.keys(collections);
    const idx = parseInt(viewDetails) - 1;
    if (idx >= 0 && idx < collectionIds.length) {
      printCollectionDetails(collectionIds[idx]);
    }
  }
}

async function viewDetails() {
  console.log("\n📚 Available Collections:");
  const collectionIds = Object.keys(collections);
  collectionIds.forEach((id, i) => {
    console.log(`  ${i + 1}. ${collections[id].name} (${id})`);
  });
  
  const choice = await ask("\nSelect collection (1-6): ");
  const idx = parseInt(choice) - 1;
  
  if (idx >= 0 && idx < collectionIds.length) {
    printCollectionDetails(collectionIds[idx]);
  } else {
    console.log("Invalid choice.");
  }
}

async function generateCLICommands() {
  console.log("\n💻 Appwrite CLI Commands");
  console.log("========================\n");
  console.log("Note: You'll need to install and configure Appwrite CLI first:");
  console.log("  npm install -g appwrite-cli");
  console.log("  appwrite login\n");
  
  console.log("Commands to create all collections:\n");
  
  Object.entries(collections).forEach(([id, config]) => {
    console.log(`# ${config.name}`);
    console.log(`appwrite databases createCollection \\`);
    console.log(`  --databaseId "${DATABASE_ID}" \\`);
    console.log(`  --collectionId "${id}" \\`);
    console.log(`  --name "${config.name}" \\`);
    console.log(`  --documentSecurity true\n`);
  });
  
  console.log("\nFor detailed attribute and index commands, see the manual setup guide.\n");
}

async function main() {
  const choice = await ask("Enter your choice (1-4): ");
  
  switch (choice) {
    case "1":
      await manualSetup();
      break;
    case "2":
      await viewDetails();
      break;
    case "3":
      await generateCLICommands();
      break;
    case "4":
      console.log("\n👋 Goodbye!\n");
      rl.close();
      return;
    default:
      console.log("\nInvalid choice. Please run the script again.\n");
  }
  
  const again = await ask("\nReturn to main menu? (yes/no): ");
  if (again.toLowerCase() === "yes" || again.toLowerCase() === "y") {
    await main();
  } else {
    console.log("\n✅ Setup helper complete!");
    console.log("\n📝 Remember:");
    console.log("  - Enable Document Security for each collection");
    console.log("  - Wait for attributes to be 'available' before adding indexes");
    console.log("  - Verify in Console after setup\n");
    rl.close();
  }
}

main();
