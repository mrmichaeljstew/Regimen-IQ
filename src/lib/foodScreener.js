/**
 * Food Safety Screening Engine
 *
 * Evaluates foods against six safety criteria for a throat cancer patient
 * undergoing radiation treatment. Uses a local rules engine with fuzzy
 * matching — no external API dependency.
 *
 * DISCLAIMER: This is for informational purposes only. Always consult
 * qualified healthcare professionals before making dietary decisions.
 */

import foodDatabase from "./foodDatabase";

/**
 * Common abbreviations and alternate names mapped to canonical search terms.
 */
const ABBREVIATIONS = {
  oj: "orange juice",
  pb: "peanut butter",
  evoo: "olive oil",
  acv: "apple cider vinegar",
  "mash potato": "mashed potatoes",
  "mash potatoes": "mashed potatoes",
  "sweet pot": "sweet potato",
  "mac and cheese": "pasta",
  "mac n cheese": "pasta",
  pbj: "peanut butter",
  "ice cream": "ice cream",
  broth: "chicken broth",
};

/**
 * Compute simple similarity score between two strings.
 * Returns a number between 0 and 1.
 */
function similarity(a, b) {
  const strA = a.toLowerCase().trim();
  const strB = b.toLowerCase().trim();

  if (strA === strB) return 1;
  if (strA.includes(strB) || strB.includes(strA)) return 0.85;

  // Bigram similarity
  const bigramsA = getBigrams(strA);
  const bigramsB = getBigrams(strB);

  if (bigramsA.size === 0 && bigramsB.size === 0) return 0;

  let intersection = 0;
  for (const gram of bigramsA) {
    if (bigramsB.has(gram)) intersection++;
  }

  return (2 * intersection) / (bigramsA.size + bigramsB.size);
}

/**
 * Get bigrams (pairs of consecutive characters) from a string.
 */
function getBigrams(str) {
  const bigrams = new Set();
  for (let i = 0; i < str.length - 1; i++) {
    bigrams.add(str.slice(i, i + 2));
  }
  return bigrams;
}

/**
 * Normalize input by expanding abbreviations and cleaning up.
 */
function normalizeInput(input) {
  let normalized = input.toLowerCase().trim();

  // Remove trailing 's' for simple plurals (but not words like "peas", "grits")
  const preservePlural = ["peas", "grits", "oats", "beans", "lentils", "seeds"];
  if (
    normalized.endsWith("s") &&
    !preservePlural.some((w) => normalized.endsWith(w))
  ) {
    const singular = normalized.slice(0, -1);
    // Only de-pluralize if we'd get a better match
    const matchPlural = findBestMatch(normalized, false);
    const matchSingular = findBestMatch(singular, false);
    if (matchSingular && (!matchPlural || matchSingular.score > matchPlural.score)) {
      normalized = singular;
    }
  }

  // Check abbreviation map
  if (ABBREVIATIONS[normalized]) {
    normalized = ABBREVIATIONS[normalized];
  }

  return normalized;
}

/**
 * Find the best matching food entry for a given input string.
 * @param {string} input - raw user input
 * @param {boolean} [doNormalize=true] - whether to normalize input
 * @returns {{ food: object, score: number } | null}
 */
function findBestMatch(input, doNormalize = true) {
  const query = doNormalize ? normalizeInput(input) : input.toLowerCase().trim();

  if (!query) return null;

  let bestMatch = null;
  let bestScore = 0;

  for (const food of foodDatabase) {
    // Check main name
    let score = similarity(query, food.name);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = food;
    }

    // Check aliases
    for (const alias of food.aliases) {
      score = similarity(query, alias);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = food;
      }
    }
  }

  // Minimum threshold for a match — set to avoid false positives from
  // partial bigram overlap (e.g., "jackfruit" matching "kiwifruit")
  if (bestScore < 0.55) return null;

  return { food: bestMatch, score: bestScore };
}

/**
 * Screen a single food input against all six criteria.
 * @param {string} input - food name or ingredient
 * @returns {object} screening result
 */
export function screenFood(input) {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const match = findBestMatch(trimmed);

  if (!match) {
    return {
      input: trimmed,
      found: false,
      verdict: "UNKNOWN",
      food: null,
      criteria: null,
      suggestion: null,
    };
  }

  return {
    input: trimmed,
    found: true,
    verdict: match.food.verdict,
    food: match.food,
    criteria: match.food.criteria,
    suggestion: match.food.suggestion,
    matchScore: match.score,
  };
}

/**
 * Screen multiple foods from a comma-separated or newline-separated string.
 * @param {string} input - comma or newline separated food list
 * @returns {object[]} array of screening results
 */
export function screenMultipleFoods(input) {
  // Split on commas or newlines
  const foods = input
    .split(/[,\n]+/)
    .map((f) => f.trim())
    .filter((f) => f.length > 0);

  return foods.map(screenFood).filter(Boolean);
}

/**
 * Get counts of flagged criteria for a food entry.
 * Returns major/minor flags for UI breakdown and summaries; does not determine the SAFE/CAUTION/AVOID verdict.
 */
export function getFlaggedCriteria(criteria) {
  if (!criteria) return { major: [], minor: [] };

  const major = [];
  const minor = [];

  if (criteria.acidity?.flag) major.push("acidity");
  if (criteria.texture?.flag) major.push("texture");
  if (criteria.spice?.flag) major.push("spice");
  if (criteria.alcohol?.flag) major.push("alcohol");
  if (criteria.temperature?.flag) minor.push("temperature");
  if (criteria.osmolality?.flag) minor.push("osmolality");

  return { major, minor };
}

/**
 * Get display properties for a verdict.
 */
export function getVerdictDisplay(verdict) {
  const verdicts = {
    SAFE: {
      label: "SAFE",
      color: "text-green-800",
      bgColor: "bg-green-100",
      borderColor: "border-green-300",
      ringColor: "ring-green-500",
      icon: "✅",
      description: "Safe to prepare and serve",
    },
    CAUTION: {
      label: "CAUTION",
      color: "text-yellow-800",
      bgColor: "bg-yellow-100",
      borderColor: "border-yellow-300",
      ringColor: "ring-yellow-500",
      icon: "⚠️",
      description: "Can be served with modification",
    },
    AVOID: {
      label: "AVOID",
      color: "text-red-800",
      bgColor: "bg-red-100",
      borderColor: "border-red-300",
      ringColor: "ring-red-500",
      icon: "🚫",
      description: "Do not serve",
    },
    UNKNOWN: {
      label: "UNKNOWN",
      color: "text-gray-800",
      bgColor: "bg-gray-100",
      borderColor: "border-gray-300",
      ringColor: "ring-gray-500",
      icon: "❓",
      description: "Not in database",
    },
  };

  return verdicts[verdict] || verdicts.UNKNOWN;
}

/**
 * Get a human-readable label for a criteria key.
 */
export function getCriteriaLabel(key) {
  const labels = {
    acidity: "Acidity (pH)",
    texture: "Texture",
    spice: "Spice / Irritants",
    temperature: "Temperature",
    osmolality: "Osmolality (Salt/Sugar)",
    alcohol: "Alcohol",
  };
  return labels[key] || key;
}
