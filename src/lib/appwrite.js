import { Client, Account, Databases } from "appwrite";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://sfo.cloud.appwrite.io/v1")
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "regimen-iq");

const account = new Account(client);
const databases = new Databases(client);

// Database ID - create this in Appwrite Console
export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "regimen-iq-db";

// Collection IDs
export const COLLECTIONS = {
  PATIENTS: "patients",
  REGIMEN_ITEMS: "regimen_items",
  INTERACTIONS: "interactions",
  RESEARCH_NOTES: "research_notes",
  APPOINTMENT_BRIEFS: "appointment_briefs",
  AUDIT_LOG: "audit_log",
};

export { client, account, databases };
