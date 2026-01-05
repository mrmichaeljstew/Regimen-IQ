'use client';

import { Client, Account, Databases } from "appwrite";

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://sfo.cloud.appwrite.io/v1";
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "regimen-iq";

// Log configuration for debugging (only in development)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('Appwrite configuration:', { endpoint, projectId });
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId);

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
