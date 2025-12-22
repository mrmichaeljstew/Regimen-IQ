"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/auth";
import {
  getPatients,
  getAppointmentBriefs,
  createAppointmentBrief,
  getRegimenItems,
  getResearchNotes,
} from "@/lib/data";
import { checkInteractions } from "@/lib/interactions";
import Link from "next/link";

export default function AppointmentsPage() {
  const [patients, setPatients] = useState([]);
  const [briefs, setBriefs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const user = await getCurrentUser();
      if (user) {
        const result = await getPatients(user.$id);
        if (result.success) {
          setPatients(result.data);

          // Load all briefs for all patients
          const allBriefs = [];
          for (const patient of result.data) {
            const briefResult = await getAppointmentBriefs(
              user.$id,
              patient.$id
            );
            if (briefResult.success) {
              allBriefs.push(
                ...briefResult.data.map((b) => ({
                  ...b,
                  patientName: patient.name,
                }))
              );
            }
          }
          setBriefs(
            allBriefs.sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            )
          );
        }
      }
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Appointment Briefs
          </h1>
          <p className="mt-2 text-gray-600">
            Generate clinician-friendly summaries for appointments
          </p>
        </div>
      </div>

      {patients.length > 0 ? (
        <>
          {/* Create Brief Section */}
          <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Generate New Brief
            </h2>
            <p className="mb-4 text-sm text-gray-600">
              Select a patient to create a comprehensive appointment brief that
              includes their current regimen, flagged interactions, and research
              questions.
            </p>
            <div className="flex flex-wrap gap-3">
              {patients.map((patient) => (
                <Link
                  key={patient.$id}
                  href={`/dashboard/appointments/new?patient=${patient.$id}`}
                  className="rounded-lg border border-blue-200 bg-blue-50 p-4 transition-shadow hover:shadow-md"
                >
                  <p className="font-medium text-blue-900">{patient.name}</p>
                  {patient.diagnosis && (
                    <p className="mt-1 text-xs text-blue-700">
                      {patient.diagnosis.substring(0, 50)}
                      {patient.diagnosis.length > 50 ? "..." : ""}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Saved Briefs */}
          {briefs.length > 0 ? (
            <div>
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Saved Briefs ({briefs.length})
              </h2>
              <div className="space-y-4">
                {briefs.map((brief) => (
                  <Link
                    key={brief.$id}
                    href={`/dashboard/appointments/${brief.$id}`}
                    className="block rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {brief.title}
                          </h3>
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                            {brief.patientName}
                          </span>
                        </div>
                        {brief.appointmentDate && (
                          <p className="mt-1 text-sm text-gray-600">
                            Appointment:{" "}
                            {new Date(brief.appointmentDate).toLocaleDateString(
                              "en-US",
                              {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </p>
                        )}
                        <p className="mt-2 text-xs text-gray-500">
                          Created {new Date(brief.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-gray-400">→</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
              <span className="mb-4 inline-block text-5xl">📋</span>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">
                No briefs created yet
              </h3>
              <p className="text-gray-600">
                Generate your first appointment brief to share with your
                healthcare team
              </p>
            </div>
          )}

          {/* Information Box */}
          <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-6">
            <h3 className="mb-3 text-lg font-semibold text-blue-900">
              About Appointment Briefs
            </h3>
            <div className="space-y-2 text-sm text-blue-800">
              <p>
                Appointment briefs are concise, 1-2 page summaries designed to
                help your healthcare team quickly understand:
              </p>
              <ul className="ml-5 list-disc space-y-1">
                <li>Current treatment regimen (medications, supplements, therapies)</li>
                <li>Flagged potential interactions to discuss</li>
                <li>Research questions or topics you've been investigating</li>
                <li>Notes and observations since last visit</li>
              </ul>
              <p className="mt-3 font-medium">
                These briefs can be viewed on-screen or printed to bring to
                appointments. Future versions will support PDF export.
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
          <span className="mb-4 inline-block text-5xl">👤</span>
          <h3 className="mb-2 text-xl font-semibold text-gray-900">
            No patients yet
          </h3>
          <p className="mb-6 text-gray-600">
            Add a patient profile to start generating appointment briefs
          </p>
          <Link
            href="/dashboard/patients/new"
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Add Patient
          </Link>
        </div>
      )}
    </div>
  );
}
