/**
 * Medication Parser
 *
 * Extracts structured medication data from raw text using pattern matching
 * and a local dictionary. Optionally uses an LLM API for enhanced extraction.
 *
 * DISCLAIMER: Extracted data is for informational purposes only.
 * Always verify all medications with your healthcare team before importing.
 */

import MEDICATIONS from "./medicationDictionary";

// --- Dosage regex patterns ---
const DOSAGE_PATTERNS = [
  // Ranges: "200-400mg", "10-20 mg"
  /(\d+\.?\d*\s*[-\u2013]\s*\d+\.?\d*\s*(?:mg|mcg|g|ml|mL|units?|IU))/i,
  // Standard: "200mg", "10 mg", "0.5 mg", "2000 IU"
  /(\d+\.?\d*\s*(?:mg|mcg|g|ml|mL|units?|IU))/i,
  // Count-based: "2 capsules", "1 tablet"
  /(\d+\s+(?:capsule|tablet|cap|tab|pill|drop|patch|softgel|lozenge|gummy|gummies)s?)/i,
];

// --- Frequency patterns ---
const FREQUENCY_PATTERNS = [
  { pattern: /\bonce\s+daily\b|\bevery\s+day\b|\bdaily\b|\bQD\b|\bq\.?d\.?\b/i, value: "daily" },
  { pattern: /\btwice\s+(?:a\s+)?daily\b|\btwo\s+times?\s+(?:a|per)\s+day\b|\bBID\b|\bb\.?i\.?d\.?\b/i, value: "twice daily" },
  { pattern: /\bthree\s+times?\s+(?:a|per)\s+day\b|\bTID\b|\bt\.?i\.?d\.?\b/i, value: "three times daily" },
  { pattern: /\bfour\s+times?\s+(?:a|per)\s+day\b|\bQID\b|\bq\.?i\.?d\.?\b/i, value: "four times daily" },
  { pattern: /\bevery\s+(\d+)\s+hours?\b/i, value: null, compute: (m) => `every ${m[1]} hours` },
  { pattern: /\bevery\s+(\d+)\s+weeks?\b/i, value: null, compute: (m) => `every ${m[1]} weeks` },
  { pattern: /\bevery\s+(\d+)\s+days?\b/i, value: null, compute: (m) => `every ${m[1]} days` },
  { pattern: /\bweekly\b|\bonce\s+(?:a|per)\s+week\b/i, value: "weekly" },
  { pattern: /\bmonthly\b|\bonce\s+(?:a|per)\s+month\b/i, value: "monthly" },
  { pattern: /\bPRN\b|\bas\s+needed\b/i, value: "as needed" },
  { pattern: /\bat\s+bedtime\b|\bQHS\b|\bq\.?h\.?s\.?\b/i, value: "at bedtime" },
  { pattern: /\bwith\s+meals?\b|\bwith\s+food\b/i, value: "with meals" },
  { pattern: /\bbefore\s+meals?\b|\bac\b/i, value: "before meals" },
  { pattern: /\bafter\s+meals?\b|\bpc\b/i, value: "after meals" },
  { pattern: /\bin\s+the\s+morning\b|\bQAM\b/i, value: "in the morning" },
  { pattern: /\bin\s+the\s+evening\b|\bQPM\b/i, value: "in the evening" },
];

// --- Lines to skip (headers, metadata, non-medication content) ---
const SKIP_PATTERNS = [
  /^\s*$/,
  /^(page|date|time|name|address|phone|fax|dr\.|doctor|hospital|clinic|pharmacy|patient|mrn|dob|gender|allergies|diagnosis|provider|facility|department|account|visit|discharge|instructions|notes|signature)/i,
  /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/, // Date lines
  /^\(\d{3}\)\s*\d{3}/, // Phone numbers
  /^\d{3}[-.]?\d{3}[-.]?\d{4}/, // Phone numbers
  /^[A-Z\s]{20,}$/, // All-caps headers
  /^[-=_]{3,}$/, // Divider lines
  /^(sincerely|regards|thank you|prepared by|reviewed by|cc:|bcc:)/i,
  /^(total|subtotal|insurance|copay|balance|amount|cost|\$)/i,
  /^\d+\.\d{2}$/, // Dollar amounts
];

/**
 * Compute bigram similarity between two strings (0 to 1).
 * Same algorithm as foodScreener.js.
 */
function similarity(a, b) {
  const strA = a.toLowerCase().trim();
  const strB = b.toLowerCase().trim();

  if (strA === strB) return 1;
  if (strA.includes(strB) || strB.includes(strA)) return 0.85;

  const bigramsA = getBigrams(strA);
  const bigramsB = getBigrams(strB);

  if (bigramsA.size === 0 && bigramsB.size === 0) return 0;

  let intersection = 0;
  for (const gram of bigramsA) {
    if (bigramsB.has(gram)) intersection++;
  }

  return (2 * intersection) / (bigramsA.size + bigramsB.size);
}

function getBigrams(str) {
  const bigrams = new Set();
  for (let i = 0; i < str.length - 1; i++) {
    bigrams.add(str.slice(i, i + 2));
  }
  return bigrams;
}

/**
 * Check if a line should be skipped (headers, dates, etc.).
 */
function isSkippableLine(line) {
  return SKIP_PATTERNS.some((p) => p.test(line));
}

/**
 * Parse dosage from a text segment.
 * @param {string} text
 * @returns {string} extracted dosage or empty string
 */
function parseDosage(text) {
  for (const pattern of DOSAGE_PATTERNS) {
    const match = text.match(pattern);
    if (match) return match[1].trim();
  }
  return "";
}

/**
 * Parse frequency from a text segment.
 * @param {string} text
 * @returns {string} extracted frequency or empty string
 */
function parseFrequency(text) {
  for (const { pattern, value, compute } of FREQUENCY_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      return compute ? compute(match) : value;
    }
  }
  return "";
}

/**
 * Fuzzy match a name against the medication dictionary.
 * @param {string} name
 * @returns {{ medication: object, score: number } | null}
 */
function findMedicationMatch(name) {
  const query = name.toLowerCase().trim();
  if (!query || query.length < 2) return null;

  let bestMatch = null;
  let bestScore = 0;

  for (const med of MEDICATIONS) {
    let score = similarity(query, med.name);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = med;
    }

    for (const alias of med.aliases) {
      score = similarity(query, alias);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = med;
      }
    }
  }

  if (bestScore < 0.55) return null;

  return { medication: bestMatch, score: bestScore };
}

/**
 * Extract a probable medication name from a line of text.
 * Strips dosage, frequency, and common non-name prefixes.
 * @param {string} line
 * @returns {string | null}
 */
function extractNameFromLine(line) {
  let cleaned = line
    // Remove list markers: "1.", "1)", "-", "*", "•"
    .replace(/^\s*[\d]+[.)]\s*/, "")
    .replace(/^\s*[-*\u2022]\s*/, "")
    .trim();

  // Remove dosage and frequency info to isolate the name
  for (const pattern of DOSAGE_PATTERNS) {
    cleaned = cleaned.replace(pattern, " ");
  }
  for (const { pattern } of FREQUENCY_PATTERNS) {
    cleaned = cleaned.replace(pattern, " ");
  }

  // Remove common trailing descriptors
  cleaned = cleaned
    .replace(/\b(oral|tablet|capsule|injection|infusion|topical|solution|suspension|cream|ointment|patch|drops?|spray|inhaler|powder|liquid|chewable|extended[- ]release|delayed[- ]release|immediate[- ]release|er|dr|ir|sr|xl|xr)\b/gi, " ")
    .replace(/\b(take|by mouth|po|iv|im|sq|sub-?q|sub-?cutaneous|intravenous|intramuscular)\b/gi, " ")
    .replace(/\b(morning|evening|night|bedtime|breakfast|lunch|dinner)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Remove trailing punctuation
  cleaned = cleaned.replace(/[,;:.\-]+$/, "").trim();

  if (!cleaned || cleaned.length < 2) return null;

  // Limit name to first few words (medication names are usually 1-4 words)
  const words = cleaned.split(/\s+/).slice(0, 4);
  return words.join(" ");
}

/**
 * Deduplicate extracted items by name similarity.
 * Keeps the entry with the highest confidence or most complete data.
 * @param {Array} items
 * @returns {Array}
 */
function deduplicateItems(items) {
  const unique = [];

  for (const item of items) {
    const dupIndex = unique.findIndex(
      (existing) => similarity(existing.name, item.name) >= 0.8
    );

    if (dupIndex === -1) {
      unique.push(item);
    } else {
      // Keep the one with higher confidence or more data
      const existing = unique[dupIndex];
      const existingScore = confidenceScore(existing);
      const newScore = confidenceScore(item);
      if (newScore > existingScore) {
        unique[dupIndex] = item;
      }
    }
  }

  return unique;
}

function confidenceScore(item) {
  let score = 0;
  if (item.confidence === "high") score += 3;
  else if (item.confidence === "medium") score += 2;
  else score += 1;
  if (item.dosage) score += 1;
  if (item.frequency) score += 1;
  return score;
}

/**
 * Extract medications from raw text using pattern matching.
 * @param {string} text - Raw text from document
 * @returns {{ items: Array, rawText: string, method: string }}
 */
export function extractMedications(text) {
  if (!text || !text.trim()) {
    return { items: [], rawText: "", method: "pattern" };
  }

  const items = [];
  const lines = text.split(/\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.length < 3) continue;
    if (isSkippableLine(trimmed)) continue;

    // Remove list markers for matching
    const cleanedLine = trimmed
      .replace(/^\s*[\d]+[.)]\s*/, "")
      .replace(/^\s*[-*\u2022]\s*/, "")
      .trim();

    if (!cleanedLine || cleanedLine.length < 2) continue;

    // Tier 1: Dictionary match
    const match = findMedicationMatch(cleanedLine);
    if (match && match.score >= 0.55) {
      items.push({
        name: match.medication.name,
        category: match.medication.category,
        dosage: parseDosage(trimmed),
        frequency: parseFrequency(trimmed),
        confidence: match.score >= 0.7 ? "high" : "medium",
        matchSource: "dictionary",
        originalText: trimmed,
        selected: true,
      });
      continue;
    }

    // Tier 2: Pattern-based detection (lines containing dosage info)
    const hasDosage = DOSAGE_PATTERNS.some((p) => p.test(trimmed));
    if (hasDosage) {
      const nameCandidate = extractNameFromLine(trimmed);
      if (nameCandidate && nameCandidate.length >= 3) {
        // Try dictionary match on extracted name
        const nameMatch = findMedicationMatch(nameCandidate);
        if (nameMatch && nameMatch.score >= 0.55) {
          items.push({
            name: nameMatch.medication.name,
            category: nameMatch.medication.category,
            dosage: parseDosage(trimmed),
            frequency: parseFrequency(trimmed),
            confidence: nameMatch.score >= 0.7 ? "medium" : "low",
            matchSource: "dictionary",
            originalText: trimmed,
            selected: true,
          });
        } else {
          items.push({
            name: nameCandidate,
            category: "medication",
            dosage: parseDosage(trimmed),
            frequency: parseFrequency(trimmed),
            confidence: "low",
            matchSource: "pattern",
            originalText: trimmed,
            selected: true,
          });
        }
      }
    }
  }

  return {
    items: deduplicateItems(items),
    rawText: text,
    method: "pattern",
  };
}

/**
 * Enhanced extraction using an LLM API (optional).
 * The API key is user-provided and stored in localStorage only.
 * @param {string} text - Raw text from document
 * @param {string} apiKey - User-provided API key
 * @param {string} apiEndpoint - API endpoint URL (defaults to OpenAI)
 * @returns {Promise<{ items: Array, method: string }>}
 */
export async function extractMedicationsWithLLM(text, apiKey, apiEndpoint) {
  if (!apiKey) {
    throw new Error("API key is required for AI-powered extraction.");
  }

  const systemPrompt = `You are a medical document parser. Extract all medications, supplements, and therapies from the provided text. Return a JSON object with an "items" array. Each item should have: "name" (string), "category" (one of: "medication", "supplement", "therapy", "other"), "dosage" (string or empty), "frequency" (string or empty). Only include items that are clearly medications, supplements, or treatments mentioned in the text. Do not add items that are not present.`;

  // Truncate to stay within token limits
  const truncatedText = text.substring(0, 8000);

  const endpoint =
    apiEndpoint || "https://api.openai.com/v1/chat/completions";

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Extract all medications, supplements, and therapies from the following document text:\n\n${truncatedText}`,
        },
      ],
      temperature: 0.1,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const status = response.status;
    if (status === 401) {
      throw new Error(
        "Invalid API key. Please check your key in the extraction settings."
      );
    }
    if (status === 429) {
      throw new Error("API rate limit reached. Please try again shortly.");
    }
    throw new Error(`API request failed (${status}). Please try again.`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("No response received from the AI model.");
  }

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("Failed to parse AI response.");
  }

  const rawItems = parsed.items || parsed.medications || [];

  return {
    items: rawItems.map((item) => ({
      name: item.name || "",
      category: ["medication", "supplement", "therapy", "other"].includes(
        item.category
      )
        ? item.category
        : "medication",
      dosage: item.dosage || "",
      frequency: item.frequency || "",
      confidence: "high",
      matchSource: "llm",
      originalText: "",
      selected: true,
    })),
    method: "llm",
  };
}

/**
 * Merge LLM results with pattern-matching results.
 * LLM results take precedence for items matched by both methods.
 * @param {Array} patternItems - Items from pattern matching
 * @param {Array} llmItems - Items from LLM extraction
 * @returns {Array}
 */
export function mergeExtractionResults(patternItems, llmItems) {
  // Start with LLM items
  const merged = [...llmItems];

  // Add pattern items that weren't found by the LLM
  for (const patternItem of patternItems) {
    const alreadyFound = merged.some(
      (llmItem) => similarity(llmItem.name, patternItem.name) >= 0.7
    );
    if (!alreadyFound) {
      merged.push(patternItem);
    }
  }

  return deduplicateItems(merged);
}
