import { databases, DATABASE_ID, COLLECTIONS } from "./appwrite";
import { ID, Query, Permission, Role } from "appwrite";

/**
 * Data access layer for RegimenIQ
 * All functions handle Appwrite CRUD operations with proper error handling
 */

// ============ PATIENTS ============

export async function createPatient(userId, patientData) {
  try {
    const doc = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.PATIENTS,
      ID.unique(),
      {
        userId,
        name: patientData.name,
        relationship: patientData.relationship || "",
        diagnosis: patientData.diagnosis || "",
        diagnosisTags: patientData.diagnosisTags || [],
        notes: patientData.notes || "",
        careTeam: patientData.careTeam ? JSON.stringify(patientData.careTeam) : "[]",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      [
        Permission.read(Role.user(userId)),
        Permission.update(Role.user(userId)),
        Permission.delete(Role.user(userId)),
      ]
    );
    
    // Audit log
    await logAction(userId, "create", "patient", doc.$id, { name: patientData.name });
    
    return { success: true, data: parsePatient(doc) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getPatients(userId) {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.PATIENTS,
      [Query.equal("userId", userId), Query.orderDesc("createdAt")]
    );
    return { success: true, data: response.documents.map(parsePatient) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getPatient(patientId) {
  try {
    const doc = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.PATIENTS,
      patientId
    );
    return { success: true, data: parsePatient(doc) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function updatePatient(patientId, updates) {
  try {
    const doc = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.PATIENTS,
      patientId,
      {
        ...updates,
        careTeam: updates.careTeam ? JSON.stringify(updates.careTeam) : undefined,
        updatedAt: new Date().toISOString(),
      }
    );
    
    // Audit log
    await logAction(doc.userId, "update", "patient", patientId, { fields: Object.keys(updates) });
    
    return { success: true, data: parsePatient(doc) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function deletePatient(patientId) {
  try {
    const doc = await databases.getDocument(DATABASE_ID, COLLECTIONS.PATIENTS, patientId);
    const userId = doc.userId;

    // Delete associated regimen items
    const regimenItems = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.REGIMEN_ITEMS,
      [Query.equal("patientId", patientId)]
    );
    for (const item of regimenItems.documents) {
      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.REGIMEN_ITEMS, item.$id);
    }

    // Delete associated research notes
    const researchNotes = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.RESEARCH_NOTES,
      [Query.equal("patientId", patientId)]
    );
    for (const note of researchNotes.documents) {
      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.RESEARCH_NOTES, note.$id);
    }

    // Delete associated appointment briefs
    const briefs = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.APPOINTMENT_BRIEFS,
      [Query.equal("patientId", patientId)]
    );
    for (const brief of briefs.documents) {
      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.APPOINTMENT_BRIEFS, brief.$id);
    }

    // Delete associated interactions
    const interactions = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.INTERACTIONS,
      [Query.equal("patientId", patientId)]
    );
    for (const interaction of interactions.documents) {
      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.INTERACTIONS, interaction.$id);
    }

    // Finally delete the patient
    await databases.deleteDocument(DATABASE_ID, COLLECTIONS.PATIENTS, patientId);
    
    // Audit log
    await logAction(userId, "delete", "patient", patientId, { name: doc.name });
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function parsePatient(doc) {
  return {
    ...doc,
    careTeam: doc.careTeam ? JSON.parse(doc.careTeam) : [],
    diagnosisTags: doc.diagnosisTags || [],
  };
}

// ============ REGIMEN ITEMS ============

export async function createRegimenItem(userId, patientId, itemData) {
  try {
    const doc = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.REGIMEN_ITEMS,
      ID.unique(),
      {
        userId,
        patientId,
        name: itemData.name,
        category: itemData.category,
        dosage: itemData.dosage || "",
        frequency: itemData.frequency || "",
        startDate: itemData.startDate || null,
        endDate: itemData.endDate || null,
        source: itemData.source || "",
        notes: itemData.notes || "",
        isActive: itemData.isActive !== undefined ? itemData.isActive : true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      [
        Permission.read(Role.user(userId)),
        Permission.update(Role.user(userId)),
        Permission.delete(Role.user(userId)),
      ]
    );
    
    // Audit log
    await logAction(userId, "create", "regimen_item", doc.$id, { 
      name: itemData.name,
      category: itemData.category,
      patientId 
    });
    
    return { success: true, data: doc };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getRegimenItems(userId, patientId, activeOnly = false) {
  try {
    const queries = [
      Query.equal("userId", userId),
      Query.equal("patientId", patientId),
      Query.orderDesc("createdAt"),
    ];
    
    if (activeOnly) {
      queries.push(Query.equal("isActive", true));
    }
    
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.REGIMEN_ITEMS,
      queries
    );
    return { success: true, data: response.documents };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function updateRegimenItem(itemId, updates) {
  try {
    const doc = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.REGIMEN_ITEMS,
      itemId,
      {
        ...updates,
        updatedAt: new Date().toISOString(),
      }
    );
    return { success: true, data: doc };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function deleteRegimenItem(itemId) {
  try {
    const doc = await databases.getDocument(DATABASE_ID, COLLECTIONS.REGIMEN_ITEMS, itemId);
    await databases.deleteDocument(DATABASE_ID, COLLECTIONS.REGIMEN_ITEMS, itemId);
    
    // Audit log
    await logAction(doc.userId, "delete", "regimen_item", itemId, { 
      name: doc.name,
      patientId: doc.patientId 
    });
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============ INTERACTIONS ============

export async function createInteraction(userId, patientId, interactionData) {
  try {
    const doc = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.INTERACTIONS,
      ID.unique(),
      {
        userId,
        patientId,
        itemIds: interactionData.itemIds,
        severity: interactionData.severity || "unknown",
        description: interactionData.description,
        sources: interactionData.sources ? JSON.stringify(interactionData.sources) : "[]",
        discussedWithClinician: interactionData.discussedWithClinician || false,
        discussionNotes: interactionData.discussionNotes || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      [
        Permission.read(Role.user(userId)),
        Permission.update(Role.user(userId)),
        Permission.delete(Role.user(userId)),
      ]
    );
    return { success: true, data: parseInteraction(doc) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getInteractions(userId, patientId) {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.INTERACTIONS,
      [
        Query.equal("userId", userId),
        Query.equal("patientId", patientId),
        Query.orderDesc("createdAt"),
      ]
    );
    return { success: true, data: response.documents.map(parseInteraction) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function updateInteraction(interactionId, updates) {
  try {
    const doc = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.INTERACTIONS,
      interactionId,
      {
        ...updates,
        sources: updates.sources ? JSON.stringify(updates.sources) : undefined,
        updatedAt: new Date().toISOString(),
      }
    );
    return { success: true, data: parseInteraction(doc) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function deleteInteraction(interactionId) {
  try {
    await databases.deleteDocument(DATABASE_ID, COLLECTIONS.INTERACTIONS, interactionId);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function parseInteraction(doc) {
  return {
    ...doc,
    sources: doc.sources ? JSON.parse(doc.sources) : [],
  };
}

// ============ RESEARCH NOTES ============

export async function createResearchNote(userId, patientId, noteData) {
  try {
    const doc = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.RESEARCH_NOTES,
      ID.unique(),
      {
        userId,
        patientId,
        topic: noteData.topic,
        tags: noteData.tags || [],
        content: noteData.content,
        sources: noteData.sources ? JSON.stringify(noteData.sources) : "[]",
        relatedItems: noteData.relatedItems || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      [
        Permission.read(Role.user(userId)),
        Permission.update(Role.user(userId)),
        Permission.delete(Role.user(userId)),
      ]
    );
    return { success: true, data: parseResearchNote(doc) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getResearchNotes(userId, patientId) {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.RESEARCH_NOTES,
      [
        Query.equal("userId", userId),
        Query.equal("patientId", patientId),
        Query.orderDesc("createdAt"),
      ]
    );
    return { success: true, data: response.documents.map(parseResearchNote) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function updateResearchNote(noteId, updates) {
  try {
    const doc = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.RESEARCH_NOTES,
      noteId,
      {
        ...updates,
        sources: updates.sources ? JSON.stringify(updates.sources) : undefined,
        updatedAt: new Date().toISOString(),
      }
    );
    return { success: true, data: parseResearchNote(doc) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function deleteResearchNote(noteId) {
  try {
    await databases.deleteDocument(DATABASE_ID, COLLECTIONS.RESEARCH_NOTES, noteId);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function parseResearchNote(doc) {
  return {
    ...doc,
    sources: doc.sources ? JSON.parse(doc.sources) : [],
  };
}

// ============ APPOINTMENT BRIEFS ============

export async function createAppointmentBrief(userId, patientId, briefData) {
  try {
    const doc = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.APPOINTMENT_BRIEFS,
      ID.unique(),
      {
        userId,
        patientId,
        appointmentDate: briefData.appointmentDate || null,
        title: briefData.title,
        generatedContent: briefData.generatedContent,
        includedRegimen: briefData.includedRegimen || [],
        includedInteractions: briefData.includedInteractions || [],
        includedResearch: briefData.includedResearch || [],
        customNotes: briefData.customNotes || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      [
        Permission.read(Role.user(userId)),
        Permission.update(Role.user(userId)),
        Permission.delete(Role.user(userId)),
      ]
    );
    return { success: true, data: doc };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getAppointmentBriefs(userId, patientId) {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.APPOINTMENT_BRIEFS,
      [
        Query.equal("userId", userId),
        Query.equal("patientId", patientId),
        Query.orderDesc("createdAt"),
      ]
    );
    return { success: true, data: response.documents };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function updateAppointmentBrief(briefId, updates) {
  try {
    const doc = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.APPOINTMENT_BRIEFS,
      briefId,
      {
        ...updates,
        updatedAt: new Date().toISOString(),
      }
    );
    return { success: true, data: doc };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function deleteAppointmentBrief(briefId) {
  try {
    await databases.deleteDocument(DATABASE_ID, COLLECTIONS.APPOINTMENT_BRIEFS, briefId);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============ AUDIT LOG ============

export async function logAction(userId, action, resource, resourceId, metadata = {}) {
  try {
    await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.AUDIT_LOG,
      ID.unique(),
      {
        userId,
        action,
        resource,
        resourceId: resourceId || "",
        metadata: JSON.stringify(metadata),
        ipAddress: "", // TODO: Add IP tracking if needed
        timestamp: new Date().toISOString(),
      },
      [Permission.read(Role.user(userId))]
    );
  } catch (error) {
    console.error("Audit log error:", error);
    // Don't fail operations if audit log fails
  }
}
