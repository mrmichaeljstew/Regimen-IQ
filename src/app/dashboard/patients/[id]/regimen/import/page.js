"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getPatient, getRegimenItems, createRegimenItem } from "@/lib/data";
import { extractText } from "@/lib/documentExtractor";
import {
  extractMedications,
  extractMedicationsWithLLM,
  mergeExtractionResults,
} from "@/lib/medicationParser";
import DocumentUpload from "@/components/DocumentUpload";
import ExtractedItemsReview from "@/components/ExtractedItemsReview";
import Link from "next/link";

const LLM_API_KEY_STORAGE = "regimeniq_llm_api_key";
const LLM_ENDPOINT_STORAGE = "regimeniq_llm_endpoint";

export default function ImportRegimenPage() {
  const params = useParams();
  const router = useRouter();

  // Auth and patient state
  const [user, setUser] = useState(null);
  const [patient, setPatient] = useState(null);
  const [existingItems, setExistingItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Workflow: "upload" -> "extracting" -> "review" -> "importing" -> "done"
  const [step, setStep] = useState("upload");

  // Extraction state
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [extractedItems, setExtractedItems] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  // LLM settings
  const [showLlmSettings, setShowLlmSettings] = useState(false);
  const [llmApiKey, setLlmApiKey] = useState("");
  const [llmEndpoint, setLlmEndpoint] = useState("");
  const [useLlm, setUseLlm] = useState(false);

  // Import state
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState(null);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push("/login");
        return;
      }
      setUser(currentUser);

      const patientResult = await getPatient(params.id);
      if (!patientResult.success) {
        router.push("/dashboard/patients");
        return;
      }
      setPatient(patientResult.data);

      const regimenResult = await getRegimenItems(
        currentUser.$id,
        params.id
      );
      if (regimenResult.success) {
        setExistingItems(
          regimenResult.data.map((item) => item.name.toLowerCase())
        );
      }

      // Load saved LLM settings from localStorage
      try {
        const savedKey = localStorage.getItem(LLM_API_KEY_STORAGE);
        const savedEndpoint = localStorage.getItem(LLM_ENDPOINT_STORAGE);
        if (savedKey) {
          setLlmApiKey(savedKey);
          setUseLlm(true);
        }
        if (savedEndpoint) setLlmEndpoint(savedEndpoint);
      } catch {
        // localStorage may not be available
      }

      setLoading(false);
    }
    loadData();
  }, [params.id, router]);

  const handleFileSelected = (file) => {
    setSelectedFile(file);
    setError("");
  };

  const handleExtract = async () => {
    if (!selectedFile) return;

    setStep("extracting");
    setError("");
    setExtractionProgress(0);

    // Step 1: Extract text from document
    const textResult = await extractText(selectedFile, setExtractionProgress);

    if (!textResult.success) {
      setError(textResult.error);
      setStep("upload");
      return;
    }

    // Step 2: Extract medications via pattern matching
    const patternResult = extractMedications(textResult.text);
    let finalItems = patternResult.items;

    // Step 3: Optionally enhance with LLM
    if (useLlm && llmApiKey) {
      try {
        const llmResult = await extractMedicationsWithLLM(
          textResult.text,
          llmApiKey,
          llmEndpoint || undefined
        );
        finalItems = mergeExtractionResults(patternResult.items, llmResult.items);
      } catch (llmError) {
        // LLM failed — fall back to pattern results, show warning
        setError(
          `AI extraction failed: ${llmError.message}. Showing pattern-matched results instead.`
        );
      }
    }

    setExtractedItems(finalItems);
    setStep("review");
  };

  const handleImport = async (selectedItems) => {
    if (!user || !params.id) return;

    setImporting(true);
    setStep("importing");
    setImportProgress({ current: 0, total: selectedItems.length });

    const results = { imported: 0, failed: 0, errors: [] };

    for (let i = 0; i < selectedItems.length; i++) {
      const item = selectedItems[i];
      setImportProgress({ current: i + 1, total: selectedItems.length });

      const result = await createRegimenItem(user.$id, params.id, {
        name: item.name,
        category: item.category,
        dosage: item.dosage,
        frequency: item.frequency,
        source: "Document Import",
        notes: `Imported from uploaded document. Confidence: ${item.confidence}. Please verify with your healthcare team.`,
        isActive: true,
      });

      if (result.success) {
        results.imported++;
      } else {
        results.failed++;
        results.errors.push({ name: item.name, error: result.error });
      }
    }

    setImportResults(results);
    setImporting(false);
    setStep("done");
  };

  const handleReset = () => {
    setStep("upload");
    setSelectedFile(null);
    setExtractedItems([]);
    setExtractionProgress(0);
    setImportResults(null);
    setError("");
  };

  const saveLlmSettings = () => {
    try {
      if (llmApiKey) {
        localStorage.setItem(LLM_API_KEY_STORAGE, llmApiKey);
      } else {
        localStorage.removeItem(LLM_API_KEY_STORAGE);
      }
      if (llmEndpoint) {
        localStorage.setItem(LLM_ENDPOINT_STORAGE, llmEndpoint);
      } else {
        localStorage.removeItem(LLM_ENDPOINT_STORAGE);
      }
    } catch {
      // localStorage may not be available
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Back Link */}
      <div className="mb-6">
        <Link
          href={`/dashboard/patients/${params.id}`}
          className="text-sm text-blue-600 hover:text-blue-500"
        >
          &larr; Back to Patient
        </Link>
      </div>

      {/* Header */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <h1 className="mb-1 text-xl font-bold text-gray-900 sm:text-2xl">
          Import from Document
        </h1>
        <p className="text-sm text-gray-600">
          Upload a medication list, discharge summary, or treatment plan to
          automatically extract and import medications for{" "}
          <strong>{patient?.name}</strong>.
        </p>
      </div>

      {/* Medical Disclaimer */}
      <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
        <p className="text-xs text-amber-900">
          <strong>Document Import Disclaimer:</strong> This tool extracts
          medication information from uploaded documents using automated text
          processing. Extracted data may be incomplete or inaccurate. Always
          verify all imported medications, dosages, and frequencies with your
          healthcare team before relying on this information for any medical
          decisions.
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Step: Upload */}
      {(step === "upload" || step === "extracting") && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
          <DocumentUpload
            onFileSelected={handleFileSelected}
            processing={step === "extracting"}
            progress={extractionProgress}
          />

          {/* LLM Settings (collapsible) */}
          <div className="mt-6 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={() => setShowLlmSettings(!showLlmSettings)}
              className="flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <svg
                className={`mr-1 h-4 w-4 transition-transform ${showLlmSettings ? "rotate-90" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
              Enhanced Extraction Settings
            </button>

            {showLlmSettings && (
              <div className="mt-3 rounded-lg border border-gray-100 bg-gray-50 p-4">
                <div className="mb-3 flex items-center">
                  <input
                    type="checkbox"
                    id="useLlm"
                    checked={useLlm}
                    onChange={(e) => setUseLlm(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="useLlm"
                    className="ml-2 text-sm font-medium text-gray-700"
                  >
                    Use AI-powered extraction (requires API key)
                  </label>
                </div>

                {useLlm && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600">
                        API Key
                      </label>
                      <input
                        type="password"
                        value={llmApiKey}
                        onChange={(e) => setLlmApiKey(e.target.value)}
                        onBlur={saveLlmSettings}
                        placeholder="sk-..."
                        className="mt-1 w-full rounded border border-gray-200 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600">
                        API Endpoint (optional)
                      </label>
                      <input
                        type="text"
                        value={llmEndpoint}
                        onChange={(e) => setLlmEndpoint(e.target.value)}
                        onBlur={saveLlmSettings}
                        placeholder="https://api.openai.com/v1/chat/completions"
                        className="mt-1 w-full rounded border border-gray-200 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Your API key is stored locally in your browser and never
                      sent to our servers. It is used only for direct
                      communication with the AI provider.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Extract Button */}
          {step === "upload" && (
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleExtract}
                disabled={!selectedFile}
                className="rounded-md bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Extract Medications
              </button>
              <Link
                href={`/dashboard/patients/${params.id}`}
                className="rounded-md border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Step: Review */}
      {step === "review" && (
        <ExtractedItemsReview
          items={extractedItems}
          onItemsChange={setExtractedItems}
          onImport={handleImport}
          onCancel={handleReset}
          importing={importing}
          existingItems={existingItems}
        />
      )}

      {/* Step: Importing */}
      {step === "importing" && (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            Importing medications...
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Adding item {importProgress.current} of {importProgress.total}
          </p>
          <div className="mx-auto mt-4 w-64">
            <div className="h-2 overflow-hidden rounded-full bg-blue-100">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-300"
                style={{
                  width: `${importProgress.total > 0 ? Math.round((importProgress.current / importProgress.total) * 100) : 0}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Step: Done */}
      {step === "done" && importResults && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 sm:p-8">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <span className="text-3xl">
                {importResults.failed > 0 ? "⚠️" : "✅"}
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              {importResults.failed > 0
                ? "Import Completed with Issues"
                : "Import Successful"}
            </h3>
            <p className="mt-2 text-gray-600">
              Successfully imported{" "}
              <strong>{importResults.imported} item{importResults.imported !== 1 ? "s" : ""}</strong>{" "}
              to {patient?.name}&apos;s regimen.
            </p>

            {importResults.failed > 0 && (
              <div className="mx-auto mt-4 max-w-md rounded-md bg-red-50 p-4 text-left text-sm text-red-700">
                <p className="font-medium">
                  {importResults.failed} item{importResults.failed !== 1 ? "s" : ""} failed to import:
                </p>
                <ul className="mt-2 list-inside list-disc">
                  {importResults.errors.map((err, i) => (
                    <li key={i}>
                      {err.name}: {err.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Reminder */}
          <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-xs text-blue-900">
              <strong>Reminder:</strong> These items were automatically
              extracted and should be reviewed with your healthcare team at your
              next appointment. Do not make any changes to your treatment
              regimen without consulting your healthcare provider.
            </p>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href={`/dashboard/patients/${params.id}`}
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              View Regimen
            </Link>
            <button
              onClick={handleReset}
              className="inline-flex items-center justify-center rounded-md border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Import More
            </button>
          </div>
        </div>
      )}

      {/* Tip Box */}
      {step === "upload" && (
        <div className="mt-6 rounded-md bg-blue-50 p-4 text-sm text-blue-800">
          <p className="font-semibold">💡 Tips for best results:</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-xs">
            <li>
              Medication lists and discharge summaries in PDF format work best
            </li>
            <li>
              Documents with structured lists (one medication per line) yield
              the most accurate results
            </li>
            <li>
              You can edit any extracted item before importing to correct
              errors
            </li>
            <li>
              Files are processed entirely in your browser and are never
              uploaded to any server
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
