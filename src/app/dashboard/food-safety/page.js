"use client";

import { useState, useEffect, useRef } from "react";
import {
  screenMultipleFoods,
  getVerdictDisplay,
  getCriteriaLabel,
  getFlaggedCriteria,
} from "@/lib/foodScreener";

const UNKNOWN_FOOD_STORAGE_KEY = "regimeniq_unknown_foods";

function getStoredUnknownFoods() {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(UNKNOWN_FOOD_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveUnknownFood(name) {
  const foods = getStoredUnknownFoods();
  const entry = {
    name,
    addedAt: new Date().toISOString(),
  };
  if (!foods.some((f) => f.name.toLowerCase() === name.toLowerCase())) {
    foods.push(entry);
    localStorage.setItem(UNKNOWN_FOOD_STORAGE_KEY, JSON.stringify(foods));
  }
  return foods;
}

function removeUnknownFood(name) {
  const foods = getStoredUnknownFoods().filter(
    (f) => f.name.toLowerCase() !== name.toLowerCase(),
  );
  localStorage.setItem(UNKNOWN_FOOD_STORAGE_KEY, JSON.stringify(foods));
  return foods;
}

export default function FoodSafetyPage() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [quickRefOpen, setQuickRefOpen] = useState(false);
  const [unknownFoods, setUnknownFoods] = useState([]);
  const [showUnknownList, setShowUnknownList] = useState(false);
  const [savedNotice, setSavedNotice] = useState(null);
  const savedNoticeTimeoutRef = useRef(null);

  // Load unknown foods from localStorage after mount to avoid hydration mismatch
  useEffect(() => {
    setUnknownFoods(getStoredUnknownFoods());
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (savedNoticeTimeoutRef.current) {
        clearTimeout(savedNoticeTimeoutRef.current);
      }
    };
  }, []);

  const handleCheck = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const screeningResults = screenMultipleFoods(input);
    setResults(screeningResults);
    setHasSearched(true);
  };

  const handleClear = () => {
    setInput("");
    setResults([]);
    setHasSearched(false);
  };

  const handleFlagUnknown = (foodName) => {
    const updated = saveUnknownFood(foodName);
    setUnknownFoods(updated);
    setSavedNotice(foodName);
    
    // Clear any existing timeout
    if (savedNoticeTimeoutRef.current) {
      clearTimeout(savedNoticeTimeoutRef.current);
    }
    
    // Set new timeout and store reference
    savedNoticeTimeoutRef.current = setTimeout(() => {
      setSavedNotice(null);
      savedNoticeTimeoutRef.current = null;
    }, 2000);
  };

  const handleRemoveUnknown = (foodName) => {
    const updated = removeUnknownFood(foodName);
    setUnknownFoods(updated);
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Food Safety Check</h1>
        <p className="mt-2 text-gray-600">
          Check whether a food or ingredient is safe for a radiation-damaged
          throat. Enter one or more foods separated by commas.
        </p>
      </div>

      {/* Search Input */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleCheck}>
          <label
            htmlFor="food-input"
            className="block text-sm font-medium text-gray-700"
          >
            Enter food or ingredient
          </label>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <input
              id="food-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='e.g. "mashed potatoes, banana puree, orange juice"'
              className="flex-1 rounded-md border border-gray-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoComplete="off"
              aria-label="Enter food name or ingredient to check safety"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Check Safety
              </button>
              {hasSearched && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="rounded-md border border-gray-300 bg-white px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Separate multiple foods with commas. Fuzzy matching is supported —
            you don&apos;t need exact spelling.
          </p>
        </form>
      </div>

      {/* Results */}
      {hasSearched && (
        <div className="mb-8 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Results ({results.length} food{results.length !== 1 ? "s" : ""}{" "}
            checked)
          </h2>

          {results.map((result) => (
            <ResultCard
              key={result.found ? `${result.food.name}-${result.food.category}` : `unknown-${result.input}`}
              result={result}
              onFlagUnknown={handleFlagUnknown}
              savedNotice={savedNotice}
            />
          ))}
        </div>
      )}

      {/* Unknown Foods List */}
      {unknownFoods.length > 0 && (
        <div className="mb-8">
          <button
            onClick={() => setShowUnknownList(!showUnknownList)}
            className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-left shadow-sm hover:bg-gray-50"
          >
            <span className="text-sm font-medium text-gray-900">
              Flagged Unknown Foods ({unknownFoods.length})
            </span>
            <span className="text-gray-400">
              {showUnknownList ? "▲" : "▼"}
            </span>
          </button>
          {showUnknownList && (
            <div className="mt-2 rounded-lg border border-gray-200 bg-white p-4">
              <p className="mb-3 text-xs text-gray-500">
                Foods not in the database that were flagged for later review with
                the care team.
              </p>
              <ul className="space-y-2">
                {unknownFoods.map((food) => (
                  <li
                    key={`${food.name}-${food.addedAt}`}
                    className="flex items-center justify-between rounded-md border border-gray-100 px-3 py-2"
                  >
                    <div>
                      <span className="text-sm font-medium text-gray-800">
                        {food.name}
                      </span>
                      <span className="ml-2 text-xs text-gray-400">
                        {new Date(food.addedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveUnknown(food.name)}
                      className="text-xs text-red-600 hover:text-red-800"
                      aria-label={`Remove ${food.name} from flagged list`}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Quick Reference Panel */}
      <div className="mb-8">
        <button
          onClick={() => setQuickRefOpen(!quickRefOpen)}
          className="flex w-full items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-left shadow-sm hover:bg-blue-100"
          aria-expanded={quickRefOpen}
          aria-controls="quick-reference-panel"
        >
          <span className="text-base font-semibold text-blue-900">
            Quick Reference Guide
          </span>
          <span className="text-blue-400">{quickRefOpen ? "▲" : "▼"}</span>
        </button>

        {quickRefOpen && (
          <div
            id="quick-reference-panel"
            className="mt-2 rounded-lg border border-blue-200 bg-white p-6"
          >
            {/* Always Safe */}
            <div className="mb-6">
              <h3 className="mb-3 flex items-center text-base font-semibold text-green-800">
                <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-sm">
                  ✅
                </span>
                Always Safe (Green Zone)
              </h3>
              <div className="rounded-md border border-green-200 bg-green-50 p-4">
                <ul className="space-y-1 text-sm text-green-900">
                  <li>Mashed potatoes with butter</li>
                  <li>Cream of wheat or smooth oatmeal</li>
                  <li>Plain yogurt</li>
                  <li>Banana puree</li>
                  <li>Avocado</li>
                  <li>Scrambled eggs (soft/blended)</li>
                  <li>Smooth nut butters in shakes</li>
                  <li>Pureed squash or sweet potato with butter</li>
                  <li>Bone broth (cooled to warm)</li>
                  <li>Cream soups (not tomato)</li>
                  <li>Ensure or Boost shakes</li>
                  <li>Cool non-acidic popsicles</li>
                </ul>
              </div>
            </div>

            {/* Always Avoid */}
            <div className="mb-6">
              <h3 className="mb-3 flex items-center text-base font-semibold text-red-800">
                <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-sm">
                  🚫
                </span>
                Always Avoid (Red Zone)
              </h3>
              <div className="rounded-md border border-red-200 bg-red-50 p-4">
                <ul className="space-y-1 text-sm text-red-900">
                  <li>Citrus fruits (orange, lemon, lime, grapefruit)</li>
                  <li>Tomatoes and tomato products</li>
                  <li>Pineapple</li>
                  <li>Berries (strawberry, raspberry, blueberry)</li>
                  <li>Prunes and cranberry</li>
                  <li>Vinegar and vinegar-based condiments</li>
                  <li>Spicy foods (hot sauce, pepper, curry)</li>
                  <li>Seeds of any kind (chia, flax, sesame)</li>
                  <li>Alcohol (including cooking wine, vanilla extract)</li>
                  <li>Very hot foods</li>
                  <li>Excessively salty or sugary items</li>
                </ul>
              </div>
            </div>

            {/* Tips */}
            <div>
              <h3 className="mb-3 flex items-center text-base font-semibold text-blue-800">
                <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-sm">
                  💡
                </span>
                Helpful Tips
              </h3>
              <div className="rounded-md border border-blue-200 bg-blue-50 p-4">
                <ul className="space-y-2 text-sm text-blue-900">
                  <li>
                    <strong>Temperature:</strong> Serve food at room temperature
                    or slightly cool — never hot.
                  </li>
                  <li>
                    <strong>Coating:</strong> Add coconut oil or butter to coat
                    the throat and reduce friction.
                  </li>
                  <li>
                    <strong>Mouthwash timing:</strong> Use magic mouthwash 15–20
                    minutes before meals for best effect.
                  </li>
                  <li>
                    <strong>Labels:</strong> Always check ingredient labels for
                    hidden citric acid, ascorbic acid, and &quot;natural
                    flavors&quot; — these can contain irritants.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <p className="text-xs text-yellow-800">
          <strong>Disclaimer:</strong> This screening tool is for informational
          purposes only and is based on general guidelines for radiation-induced
          oral mucositis. Individual tolerance varies. Always consult your care
          team (oncologist, dietitian, speech pathologist) before introducing new
          foods.
        </p>
      </div>
    </div>
  );
}

/**
 * Result card for a single food screening result.
 */
function ResultCard({ result, onFlagUnknown, savedNotice }) {
  const [expanded, setExpanded] = useState(true);
  const display = getVerdictDisplay(result.verdict);

  if (!result.found) {
    return (
      <div className="rounded-lg border border-gray-300 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-bold ${display.bgColor} ${display.color} ring-1 ${display.ringColor}`}
                role="status"
                aria-label={`Verdict: ${display.label}`}
              >
                {display.icon} {display.label}
              </span>
              <span className="text-lg font-medium text-gray-900">
                {result.input}
              </span>
            </div>
            <div className="mt-3 rounded-md border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm text-gray-700">
                This food is not in the database yet. As a general rule: if
                it&apos;s acidic, rough-textured, spicy, very hot, very
                salty/sweet, or contains alcohol — avoid it. When in doubt, skip
                it and ask the care team.
              </p>
            </div>
          </div>
          <button
            onClick={() => onFlagUnknown(result.input)}
            className="shrink-0 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label={`Flag ${result.input} for later review`}
          >
            {savedNotice === result.input ? "Saved!" : "Flag for Review"}
          </button>
        </div>
      </div>
    );
  }

  const flagged = getFlaggedCriteria(result.criteria);
  const allFlagged = [...flagged.major, ...flagged.minor];

  return (
    <div
      className={`rounded-lg border bg-white shadow-sm ${display.borderColor}`}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between p-5 text-left"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-bold ${display.bgColor} ${display.color} ring-1 ${display.ringColor}`}
            role="status"
            aria-label={`Verdict: ${display.label}`}
          >
            {display.icon} {display.label}
          </span>
          <div>
            <span className="text-lg font-medium text-gray-900">
              {result.food.name}
            </span>
            <span className="ml-2 text-sm text-gray-500">
              ({result.food.category})
            </span>
          </div>
        </div>
        <span className="text-gray-400">{expanded ? "▲" : "▼"}</span>
      </button>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-gray-100 px-5 pb-5">
          {/* Criteria Grid */}
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(result.criteria).map(([key, value]) => (
              <div
                key={key}
                className={`rounded-md border p-3 ${
                  value.flag
                    ? key === "temperature" || key === "osmolality"
                      ? "border-yellow-200 bg-yellow-50"
                      : "border-red-200 bg-red-50"
                    : "border-green-200 bg-green-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    {value.flag
                      ? key === "temperature" || key === "osmolality"
                        ? "⚠️"
                        : "🚫"
                      : "✅"}
                  </span>
                  <span className="text-xs font-semibold text-gray-800">
                    {getCriteriaLabel(key)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-600">{value.note}</p>
              </div>
            ))}
          </div>

          {/* Summary */}
          {allFlagged.length > 0 && (
            <div className="mt-4 rounded-md border border-gray-200 bg-gray-50 p-3">
              <p className="text-sm text-gray-700">
                <strong>Flagged criteria:</strong>{" "}
                {allFlagged.map((c) => getCriteriaLabel(c)).join(", ")}
              </p>
            </div>
          )}

          {/* Suggestion */}
          {result.suggestion && (
            <div className="mt-3 rounded-md border border-blue-200 bg-blue-50 p-3">
              <p className="text-sm text-blue-800">
                <strong>Suggestion:</strong> {result.suggestion}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
