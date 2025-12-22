"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { databases, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import Link from "next/link";

export default function ViewBriefPage() {
  const params = useParams();
  const router = useRouter();
  const [brief, setBrief] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBrief() {
      try {
        const doc = await databases.getDocument(
          DATABASE_ID,
          COLLECTIONS.APPOINTMENT_BRIEFS,
          params.id
        );
        setBrief(doc);
      } catch (error) {
        console.error("Error loading brief:", error);
      }
      setLoading(false);
    }
    loadBrief();
  }, [params.id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
      </div>
    );
  }

  if (!brief) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Brief not found</h1>
        <Link
          href="/dashboard/appointments"
          className="mt-4 inline-block text-blue-600 hover:text-blue-500"
        >
          ← Back to Appointments
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* No-print header */}
      <div className="mb-6 print:hidden">
        <Link
          href="/dashboard/appointments"
          className="text-sm text-blue-600 hover:text-blue-500"
        >
          ← Back to Appointments
        </Link>
      </div>

      <div className="mb-6 flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{brief.title}</h1>
          <p className="mt-1 text-sm text-gray-600">
            Created {new Date(brief.createdAt).toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          🖨️ Print
        </button>
      </div>

      {/* Brief Content - Print-friendly */}
      <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm print:border-0 print:shadow-none">
        <div className="prose max-w-none">
          {brief.generatedContent.split("\n").map((line, idx) => {
            // Parse markdown-style content
            if (line.startsWith("# ")) {
              return (
                <h1 key={idx} className="mb-4 text-3xl font-bold text-gray-900">
                  {line.substring(2)}
                </h1>
              );
            }
            if (line.startsWith("## ")) {
              return (
                <h2 key={idx} className="mb-3 mt-6 text-2xl font-semibold text-gray-900">
                  {line.substring(3)}
                </h2>
              );
            }
            if (line.startsWith("### ")) {
              return (
                <h3 key={idx} className="mb-2 mt-4 text-xl font-medium text-gray-900">
                  {line.substring(4)}
                </h3>
              );
            }
            if (line.startsWith("**") && line.endsWith("**")) {
              return (
                <p key={idx} className="mb-2 font-semibold text-gray-900">
                  {line.replaceAll("**", "")}
                </p>
              );
            }
            if (line.includes("**")) {
              const parts = line.split("**");
              return (
                <p key={idx} className="mb-2 text-gray-700">
                  {parts.map((part, i) =>
                    i % 2 === 0 ? (
                      part
                    ) : (
                      <strong key={i} className="font-semibold">
                        {part}
                      </strong>
                    )
                  )}
                </p>
              );
            }
            if (line.startsWith("- ")) {
              return (
                <li key={idx} className="ml-6 text-gray-700">
                  {line.substring(2)}
                </li>
              );
            }
            if (line === "---") {
              return <hr key={idx} className="my-6 border-gray-300" />;
            }
            if (line.startsWith("*") && line.endsWith("*")) {
              return (
                <p key={idx} className="italic text-gray-600">
                  {line.substring(1, line.length - 1)}
                </p>
              );
            }
            if (line.trim() === "") {
              return <br key={idx} />;
            }
            return (
              <p key={idx} className="mb-2 text-gray-700">
                {line}
              </p>
            );
          })}
        </div>
      </div>

      {/* Print-only footer */}
      <div className="hidden print:block print:mt-8">
        <p className="text-center text-xs text-gray-500">
          Generated by RegimenIQ · Not a substitute for professional medical
          advice
        </p>
      </div>
    </>
  );
}
