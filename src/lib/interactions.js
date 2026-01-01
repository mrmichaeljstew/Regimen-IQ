/**
 * Interaction Checking Service
 * 
 * This module provides an abstraction layer for checking drug/supplement interactions.
 * Currently uses a local knowledge base, but designed to integrate with external
 * medical data APIs in the future.
 * 
 * DISCLAIMER: This is for informational purposes only. All interactions should be
 * discussed with qualified healthcare professionals.
 */

import { createInteraction, getRegimenItems } from "./data";

/**
 * Check for potential interactions between regimen items
 * @param {string} userId 
 * @param {string} patientId 
 * @returns {Promise<object>} Array of detected interactions
 */
export async function checkInteractions(userId, patientId) {
  // Get all active regimen items
  const result = await getRegimenItems(userId, patientId, true);
  
  if (!result.success) {
    return { success: false, error: result.error };
  }

  const items = result.data;
  const detectedInteractions = [];

  // Check pairwise combinations
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const interaction = await checkPairInteraction(items[i], items[j]);
      if (interaction) {
        detectedInteractions.push(interaction);
      }
    }
  }

  return { success: true, data: detectedInteractions };
}

/**
 * Check interaction between two specific items
 * @param {object} item1 
 * @param {object} item2 
 * @returns {Promise<object|null>} Interaction data or null
 */
async function checkPairInteraction(item1, item2) {
  // TODO: Replace with external API call when available
  // Example: const response = await fetch(`https://api.drugbank.com/interactions?drug1=${item1.name}&drug2=${item2.name}`);
  
  // For now, use local knowledge base
  const interaction = localInteractionCheck(item1, item2);
  
  if (interaction) {
    return {
      itemIds: [item1.$id, item2.$id],
      items: [item1, item2],
      severity: interaction.severity,
      description: interaction.description,
      sources: interaction.sources,
    };
  }
  
  return null;
}

/**
 * Local interaction knowledge base
 * This is a placeholder for demonstration. In production, this would be replaced
 * by an external medical database API.
 */
function localInteractionCheck(item1, item2) {
  const name1 = item1.name.toLowerCase();
  const name2 = item2.name.toLowerCase();
  
  // Common interaction patterns (educational examples only)
  const interactions = [
    {
      terms: ["warfarin", "vitamin k"],
      severity: "high",
      description: "Vitamin K can reduce the effectiveness of warfarin (blood thinner). Consistent intake is important.",
      sources: [
        { title: "Warfarin and Vitamin K Interaction", url: "https://www.drugs.com/drug-interactions/vitamin-k-with-warfarin-2066-0-2318-0.html" }
      ]
    },
    {
      terms: ["warfarin", "vitamin e"],
      severity: "moderate",
      description: "High doses of Vitamin E may increase bleeding risk when taken with warfarin.",
      sources: [
        { title: "Warfarin Interactions", url: "https://www.drugs.com/drug-interactions/warfarin.html" }
      ]
    },
    {
      terms: ["calcium", "iron"],
      severity: "low",
      description: "Calcium can reduce iron absorption. Take these supplements at different times of day.",
      sources: [
        { title: "Calcium-Iron Interaction", url: "https://ods.od.nih.gov/factsheets/Iron-HealthProfessional/" }
      ]
    },          {
      terms: ["tamoxifen", "st john"],
      severity: "high",
      description: "St. John's Wort significantly reduces Tamoxifen effectiveness by increasing its metabolism through CYP3A4 enzyme induction. This can reduce cancer treatment efficacy. Avoid concurrent use or discuss alternatives with your oncologist.",
      sources: [
        { title: "Tamoxifen-St. John's Wort Interaction", url: "https://www.cancer.gov/about-cancer/treatment/drugs" }
      ]
    },
    {
      terms: ["st john's wort", "chemotherapy"],
      severity: "high",
      description: "St. John's Wort can interfere with many chemotherapy drugs. Consult your oncologist.",
      sources: [
        { title: "St. John's Wort and Cancer Treatment", url: "https://www.cancer.gov/about-cancer/treatment/cam/patient/st-johns-wort-pdq" }
      ]
    },
    {
      terms: ["grapefruit", "chemotherapy"],
      severity: "moderate",
      description: "Grapefruit can affect the metabolism of certain chemotherapy drugs.",
      sources: [
        { title: "Grapefruit Drug Interactions", url: "https://www.cancer.gov/about-cancer/treatment/cam/patient/grapefruit-pdq" }
      ]
    },
    {
      terms: ["green tea", "chemotherapy"],
      severity: "moderate",
      description: "Green tea extract may interact with some chemotherapy medications. Discuss with your oncologist.",
      sources: [
        { title: "Green Tea and Cancer Treatment", url: "https://www.cancer.gov/about-cancer/treatment/cam/patient/green-tea-pdq" }
      ]
    },
    {
      terms: ["turmeric", "blood thinner"],
      severity: "moderate",
      description: "Turmeric may increase bleeding risk when combined with anticoagulants.",
      sources: [
        { title: "Turmeric Interactions", url: "https://www.nccih.nih.gov/health/turmeric" }
      ]
    },
  ];

  // Check if any interaction patterns match
  for (const interaction of interactions) {
    const matchesAll = interaction.terms.every(term =>
      name1.includes(term) || name2.includes(term)
    );
    
    if (matchesAll && interaction.terms.length === 2) {
      // Ensure both items are involved
      const match1 = interaction.terms.some(term => name1.includes(term));
      const match2 = interaction.terms.some(term => name2.includes(term));
      
      if (match1 && match2 && name1 !== name2) {
        return interaction;
      }
    }
  }

  return null;
}

/**
 * Save a detected interaction to the database
 * @param {string} userId 
 * @param {string} patientId 
 * @param {object} interactionData 
 * @returns {Promise<object>}
 */
export async function saveInteraction(userId, patientId, interactionData) {
  return await createInteraction(userId, patientId, interactionData);
}

/**
 * Get external API interaction data (future implementation)
 * @param {string} drug1 
 * @param {string} drug2 
 * @returns {Promise<object>}
 */
export async function getExternalInteractionData(drug1, drug2) {
  // TODO: Implement external API integration
  // Possible APIs:
  // - DrugBank API: https://www.drugbank.com/
  // - RxNorm API: https://rxnav.nlm.nih.gov/
  // - OpenFDA: https://open.fda.gov/
  // - Memorial Sloan Kettering About Herbs: https://www.mskcc.org/cancer-care/diagnosis-treatment/symptom-management/integrative-medicine/herbs
  
  throw new Error("External API not yet implemented");
}

/**
 * Parse interaction severity to display properties
 * @param {string} severity 
 * @returns {object}
 */
export function getSeverityDisplay(severity) {
  const severityMap = {
    high: {
      label: "High Priority",
      color: "text-red-700",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      description: "Discuss with your healthcare provider immediately"
    },
    moderate: {
      label: "Moderate",
      color: "text-yellow-700",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      description: "Mention to your healthcare provider at next visit"
    },
    low: {
      label: "Low",
      color: "text-blue-700",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      description: "Good to be aware of, discuss if convenient"
    },
    unknown: {
      label: "Unknown",
      color: "text-gray-700",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
      description: "Insufficient data available"
    }
  };

  return severityMap[severity] || severityMap.unknown;
}
