/**
 * Document Text Extraction
 *
 * Extracts raw text from uploaded documents (PDF, TXT, CSV).
 * Runs entirely client-side. Files never leave the browser.
 *
 * DISCLAIMER: Extracted data is for informational purposes only.
 * Always verify medications with your healthcare team.
 */

const SUPPORTED_TYPES = {
  "application/pdf": "pdf",
  "text/plain": "text",
  "text/csv": "csv",
};

const SUPPORTED_EXTENSIONS = {
  ".pdf": "pdf",
  ".txt": "text",
  ".csv": "csv",
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Validate a file before processing.
 * @param {File} file
 * @returns {{ valid: boolean, error?: string, type?: string }}
 */
export function validateFile(file) {
  if (!file) {
    return { valid: false, error: "No file selected." };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: "File exceeds the 10MB size limit. Please use a smaller file.",
    };
  }

  if (file.size === 0) {
    return { valid: false, error: "This file appears to be empty." };
  }

  // Check by MIME type first
  let fileType = SUPPORTED_TYPES[file.type];

  // Fall back to extension check
  if (!fileType) {
    const ext = "." + file.name.split(".").pop().toLowerCase();
    fileType = SUPPORTED_EXTENSIONS[ext];
  }

  if (!fileType) {
    return {
      valid: false,
      error:
        "Unsupported file type. Please upload a PDF, TXT, or CSV file.",
    };
  }

  return { valid: true, type: fileType };
}

/**
 * Extract text from a File object.
 * @param {File} file
 * @param {function} onProgress - Progress callback (0-100)
 * @returns {Promise<{ success: boolean, text?: string, error?: string, pageCount?: number }>}
 */
export async function extractText(file, onProgress = () => {}) {
  const validation = validateFile(file);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  try {
    switch (validation.type) {
      case "pdf":
        return await extractFromPdf(file, onProgress);
      case "text":
        return await extractFromText(file, onProgress);
      case "csv":
        return await extractFromCsv(file, onProgress);
      default:
        return { success: false, error: "Unsupported file type." };
    }
  } catch (error) {
    console.error("Text extraction error:", error);
    return {
      success: false,
      error:
        "Failed to extract text from this file. It may be corrupted or password-protected.",
    };
  }
}

/**
 * Extract text from PDF using pdfjs-dist (dynamically imported).
 */
async function extractFromPdf(file, onProgress) {
  let pdfjsLib;
  try {
    pdfjsLib = await import("pdfjs-dist");
  } catch {
    return {
      success: false,
      error: "PDF processing library could not be loaded.",
    };
  }

  // Set worker source from CDN to avoid webpack bundling issues
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  }

  const arrayBuffer = await file.arrayBuffer();

  let pdf;
  try {
    pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  } catch (err) {
    const message = err?.message || "";
    if (message.includes("password")) {
      return {
        success: false,
        error:
          "This PDF is password-protected. Please provide an unprotected version.",
      };
    }
    return {
      success: false,
      error:
        "Unable to read this PDF file. It may be corrupted or in an unsupported format.",
    };
  }

  let fullText = "";
  const totalPages = pdf.numPages;

  for (let i = 1; i <= totalPages; i++) {
    onProgress(Math.round((i / totalPages) * 100));
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item) => item.str).join(" ");
    fullText += pageText + "\n\n";
  }

  const trimmed = fullText.trim();
  if (!trimmed) {
    return {
      success: false,
      error:
        "No readable text was found in this PDF. If this is a scanned document, text extraction from images is not yet supported.",
    };
  }

  return { success: true, text: trimmed, pageCount: totalPages };
}

/**
 * Extract text from a plain text file.
 */
async function extractFromText(file, onProgress) {
  onProgress(50);
  const text = await file.text();
  onProgress(100);

  if (!text.trim()) {
    return { success: false, error: "This file appears to be empty." };
  }

  return { success: true, text: text.trim() };
}

/**
 * Extract text from a CSV file.
 */
async function extractFromCsv(file, onProgress) {
  onProgress(50);
  const text = await file.text();
  onProgress(100);

  if (!text.trim()) {
    return { success: false, error: "This file appears to be empty." };
  }

  // Convert CSV rows to readable lines
  const lines = text.split("\n").map((line) => {
    // Remove CSV quoting and join fields with spaces
    return line
      .split(",")
      .map((field) => field.replace(/^"|"$/g, "").trim())
      .filter(Boolean)
      .join(" ");
  });

  return { success: true, text: lines.join("\n").trim() };
}
