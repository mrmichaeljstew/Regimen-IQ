"use client";

import { useState, useRef, useCallback } from "react";
import { validateFile } from "@/lib/documentExtractor";

/**
 * DocumentUpload Component
 *
 * Drag-and-drop file upload with validation and progress display.
 *
 * Props:
 * - onFileSelected(file: File) - called when a valid file is selected
 * - processing: boolean - show processing state
 * - progress: number - extraction progress 0-100
 * - disabled: boolean
 */
export default function DocumentUpload({
  onFileSelected,
  processing = false,
  progress = 0,
  disabled = false,
}) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = useCallback(
    (file) => {
      setError("");
      const validation = validateFile(file);

      if (!validation.valid) {
        setError(validation.error);
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
      if (onFileSelected) {
        onFileSelected(file);
      }
    },
    [onFileSelected]
  );

  const handleDragOver = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled && !processing) {
        setDragActive(true);
      }
    },
    [disabled, processing]
  );

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (disabled || processing) return;

      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    },
    [disabled, processing, handleFile]
  );

  const handleInputChange = useCallback(
    (e) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
      // Reset input so the same file can be re-selected
      e.target.value = "";
    },
    [handleFile]
  );

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    setError("");
    if (onFileSelected) {
      onFileSelected(null);
    }
  }, [onFileSelected]);

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split(".").pop().toLowerCase();
    if (ext === "pdf") return "📄";
    if (ext === "csv") return "📊";
    return "📝";
  };

  return (
    <div>
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && !processing && fileInputRef.current?.click()}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors sm:p-12 ${
          disabled || processing
            ? "cursor-not-allowed border-gray-200 bg-gray-50"
            : dragActive
              ? "border-blue-500 bg-blue-50"
              : selectedFile
                ? "border-green-300 bg-green-50"
                : "border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.csv"
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled || processing}
        />

        {processing ? (
          <div>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
            </div>
            <p className="text-sm font-medium text-blue-900">
              Extracting text from document...
            </p>
            {progress > 0 && (
              <div className="mx-auto mt-4 w-64">
                <div className="h-2 overflow-hidden rounded-full bg-blue-100">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="mt-1 text-xs text-blue-700">{progress}%</p>
              </div>
            )}
          </div>
        ) : selectedFile ? (
          <div>
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <span className="text-3xl">
                {getFileIcon(selectedFile.name)}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-900">
              {selectedFile.name}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {formatFileSize(selectedFile.size)}
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveFile();
              }}
              className="mt-3 text-sm text-red-600 hover:text-red-500"
            >
              Remove file
            </button>
          </div>
        ) : (
          <div>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <span className="text-3xl">📁</span>
            </div>
            <p className="text-sm font-medium text-gray-900">
              {dragActive
                ? "Drop your file here"
                : "Drag and drop a file, or click to browse"}
            </p>
            <p className="mt-2 text-xs text-gray-500">
              Supported formats: PDF, TXT, CSV (max 10MB)
            </p>
          </div>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
