"use client";

import { useState } from "react";

/**
 * ExtractedItemsReview Component
 *
 * Displays extracted medication items in an editable review interface.
 * Users can edit fields, toggle selection, and remove items before importing.
 *
 * Props:
 * - items: ExtractedItem[] - extracted items to review
 * - onItemsChange(items) - called when items are modified
 * - onImport(selectedItems) - called when user confirms import
 * - onCancel() - called when user cancels
 * - importing: boolean - shows importing state
 * - existingItems: string[] - lowercased names of existing regimen items
 */
export default function ExtractedItemsReview({
  items,
  onItemsChange,
  onImport,
  onCancel,
  importing = false,
  existingItems = [],
}) {
  const [expandedItem, setExpandedItem] = useState(null);

  const selectedCount = items.filter((i) => i.selected).length;
  const medCount = items.filter(
    (i) => i.selected && i.category === "medication"
  ).length;
  const suppCount = items.filter(
    (i) => i.selected && i.category === "supplement"
  ).length;
  const otherCount = selectedCount - medCount - suppCount;

  const updateItem = (index, updates) => {
    const updated = items.map((item, i) =>
      i === index ? { ...item, ...updates } : item
    );
    onItemsChange(updated);
  };

  const removeItem = (index) => {
    const updated = items.filter((_, i) => i !== index);
    onItemsChange(updated);
  };

  const toggleAll = (selected) => {
    const updated = items.map((item) => ({ ...item, selected }));
    onItemsChange(updated);
  };

  const deselectDuplicates = () => {
    const updated = items.map((item) => ({
      ...item,
      selected: item.selected
        ? !existingItems.includes(item.name.toLowerCase())
        : false,
    }));
    onItemsChange(updated);
  };

  const removeLowConfidence = () => {
    const updated = items.filter((item) => item.confidence !== "low");
    onItemsChange(updated);
  };

  const isDuplicate = (name) => {
    return existingItems.includes(name.toLowerCase());
  };

  const getConfidenceBadge = (confidence) => {
    const styles = {
      high: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-red-100 text-red-800",
    };
    return styles[confidence] || styles.low;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      medication: "💊",
      supplement: "🌿",
      therapy: "🏥",
      other: "📝",
    };
    return icons[category] || icons.other;
  };

  const handleImport = () => {
    const selectedItems = items.filter((i) => i.selected);
    if (selectedItems.length === 0) return;
    onImport(selectedItems);
  };

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
          <span className="text-3xl">🔍</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900">
          No medications found
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-gray-600">
          We could not identify any medications or supplements in this document.
          You can try uploading a different document or add items manually.
        </p>
        <button
          onClick={onCancel}
          className="mt-6 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Disclaimer */}
      <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <p className="text-sm font-medium text-yellow-900">
          Review Carefully
        </p>
        <p className="mt-1 text-xs text-yellow-800">
          The items below were automatically extracted and may contain errors.
          Please verify each medication name, dosage, and frequency before
          importing. This tool is for informational and organizational purposes
          only and is not a substitute for professional medical advice.
        </p>
      </div>

      {/* Summary */}
      <div className="mb-4 flex flex-wrap gap-3">
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
          {selectedCount} selected
        </span>
        {medCount > 0 && (
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700">
            💊 {medCount} medication{medCount !== 1 ? "s" : ""}
          </span>
        )}
        {suppCount > 0 && (
          <span className="rounded-full bg-green-50 px-3 py-1 text-xs text-green-700">
            🌿 {suppCount} supplement{suppCount !== 1 ? "s" : ""}
          </span>
        )}
        {otherCount > 0 && (
          <span className="rounded-full bg-gray-50 px-3 py-1 text-xs text-gray-700">
            📝 {otherCount} other
          </span>
        )}
      </div>

      {/* Bulk Actions */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => toggleAll(true)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          Select All
        </button>
        <button
          onClick={() => toggleAll(false)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          Deselect All
        </button>
        {existingItems.length > 0 && (
          <button
            onClick={deselectDuplicates}
            className="rounded-md border border-yellow-300 px-3 py-1.5 text-xs font-medium text-yellow-700 hover:bg-yellow-50"
          >
            Deselect Duplicates
          </button>
        )}
        {items.some((i) => i.confidence === "low") && (
          <button
            onClick={removeLowConfidence}
            className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
          >
            Remove Low Confidence
          </button>
        )}
      </div>

      {/* Items List */}
      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            className={`rounded-lg border bg-white p-4 transition-colors ${
              item.selected
                ? "border-gray-200"
                : "border-gray-100 bg-gray-50 opacity-60"
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Checkbox */}
              <div className="flex pt-1">
                <input
                  type="checkbox"
                  checked={item.selected}
                  onChange={(e) =>
                    updateItem(index, { selected: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  disabled={importing}
                />
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-lg">
                    {getCategoryIcon(item.category)}
                  </span>

                  {/* Editable Name */}
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) =>
                      updateItem(index, { name: e.target.value })
                    }
                    className="min-w-0 flex-1 rounded border border-transparent px-1 py-0.5 text-sm font-semibold text-gray-900 hover:border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    disabled={importing}
                  />

                  {/* Confidence Badge */}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${getConfidenceBadge(item.confidence)}`}
                  >
                    {item.confidence}
                  </span>

                  {/* Duplicate Warning */}
                  {isDuplicate(item.name) && (
                    <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                      Already in regimen
                    </span>
                  )}
                </div>

                {/* Editable Fields Row */}
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  {/* Category */}
                  <div>
                    <label className="mb-0.5 block text-xs text-gray-500">
                      Category
                    </label>
                    <select
                      value={item.category}
                      onChange={(e) =>
                        updateItem(index, { category: e.target.value })
                      }
                      className="w-full rounded border border-gray-200 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      disabled={importing}
                    >
                      <option value="medication">Medication</option>
                      <option value="supplement">Supplement</option>
                      <option value="therapy">Therapy</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Dosage */}
                  <div>
                    <label className="mb-0.5 block text-xs text-gray-500">
                      Dosage
                    </label>
                    <input
                      type="text"
                      value={item.dosage}
                      onChange={(e) =>
                        updateItem(index, { dosage: e.target.value })
                      }
                      placeholder="e.g., 200mg"
                      className="w-full rounded border border-gray-200 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      disabled={importing}
                    />
                  </div>

                  {/* Frequency */}
                  <div>
                    <label className="mb-0.5 block text-xs text-gray-500">
                      Frequency
                    </label>
                    <input
                      type="text"
                      value={item.frequency}
                      onChange={(e) =>
                        updateItem(index, { frequency: e.target.value })
                      }
                      placeholder="e.g., twice daily"
                      className="w-full rounded border border-gray-200 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      disabled={importing}
                    />
                  </div>
                </div>

                {/* Original Text (expandable) */}
                {item.originalText && (
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedItem(
                          expandedItem === index ? null : index
                        )
                      }
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      {expandedItem === index
                        ? "Hide original text"
                        : "Show original text"}
                    </button>
                    {expandedItem === index && (
                      <p className="mt-1 rounded bg-gray-50 p-2 text-xs text-gray-600">
                        &quot;{item.originalText}&quot;
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Remove Button */}
              <button
                type="button"
                onClick={() => removeItem(index)}
                disabled={importing}
                className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                title="Remove item"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex flex-col gap-3 border-t border-gray-200 pt-6 sm:flex-row">
        <button
          onClick={handleImport}
          disabled={importing || selectedCount === 0}
          className="rounded-md bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {importing
            ? "Importing..."
            : `Import ${selectedCount} Selected Item${selectedCount !== 1 ? "s" : ""}`}
        </button>
        <button
          onClick={onCancel}
          disabled={importing}
          className="rounded-md border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Start Over
        </button>
      </div>
    </div>
  );
}
