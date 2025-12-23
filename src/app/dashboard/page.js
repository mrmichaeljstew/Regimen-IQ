"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/auth";
import { getPatients, getRegimenItems, getAppointmentBriefs } from "@/lib/data";
import { checkInteractions } from "@/lib/interactions";
import Link from "next/link";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [patients, setPatients] = useState([]);
  const [stats, setStats] = useState({
    activeRegimens: 0,
    interactions: 0,
    briefs: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showQuickStart, setShowQuickStart] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("regimeniq_quickstart_dismissed");
    if (!dismissed) {
      setShowQuickStart(true);
    }
  }, []);

  useEffect(() => {
    async function loadData() {
      const currentUser = await getCurrentUser();
      setUser(currentUser);

      if (currentUser) {
        const patientResult = await getPatients(currentUser.$id);
        if (patientResult.success) {
          setPatients(patientResult.data);

          // Calculate stats
          let totalActiveRegimens = 0;
          let totalInteractions = 0;
          let totalBriefs = 0;

          for (const patient of patientResult.data) {
            // Get active regimens
            const regimenResult = await getRegimenItems(
              currentUser.$id,
              patient.$id,
              true
            );
            if (regimenResult.success) {
              totalActiveRegimens += regimenResult.data.length;
            }

            // Get interactions
            const interactionResult = await checkInteractions(
              currentUser.$id,
              patient.$id
            );
            if (interactionResult.success) {
              totalInteractions += interactionResult.data.length;
            }

            // Get briefs
            const briefResult = await getAppointmentBriefs(
              currentUser.$id,
              patient.$id
            );
            if (briefResult.success) {
              totalBriefs += briefResult.data.length;
            }
          }

          setStats({
            activeRegimens: totalActiveRegimens,
            interactions: totalInteractions,
            briefs: totalBriefs,
          });
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name?.split(" ")[0] || "there"}!
        </h1>
        <p className="mt-2 text-gray-600">
          Manage your treatment regimens and health information
        </p>
      </div>

      {showQuickStart && (
        <div className="mb-8 rounded-lg border border-blue-200 bg-blue-50 p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-2xl">🚀</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-blue-900">Quick Start Guide</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>Welcome to RegimenIQ! Follow these steps to get started:</p>
                  <ul className="mt-3 list-inside list-disc space-y-1">
                    <li>
                      <Link href="/dashboard/patients/new" className="font-semibold underline">Create a patient profile</Link> for yourself or a loved one.
                    </li>
                    <li>Add medications and treatments to your regimen.</li>
                    <li>Check for potential drug interactions.</li>
                    <li>Save research notes and prepare for appointments.</li>
                  </ul>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setShowQuickStart(false);
                localStorage.setItem("regimeniq_quickstart_dismissed", "true");
              }}
              className="ml-4 flex-shrink-0 text-blue-400 hover:text-blue-500"
            >
              <span className="sr-only">Dismiss</span>
              <span className="text-xl">×</span>
            </button>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md bg-blue-100 p-3">
              <span className="text-2xl">👤</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Patients</p>
              <p className="text-2xl font-semibold text-gray-900">
                {patients.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md bg-green-100 p-3">
              <span className="text-2xl">💊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Active Regimens
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.activeRegimens}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md bg-yellow-100 p-3">
              <span className="text-2xl">⚠️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Interactions</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.interactions}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md bg-purple-100 p-3">
              <span className="text-2xl">📋</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Saved Briefs
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.briefs}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Quick Actions
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/dashboard/patients/new"
            className="flex items-center rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
          >
            <div className="flex-shrink-0 rounded-md bg-blue-100 p-3">
              <span className="text-xl">➕</span>
            </div>
            <div className="ml-4">
              <p className="font-medium text-gray-900">Add Patient</p>
              <p className="text-sm text-gray-600">
                Create a new patient profile
              </p>
            </div>
          </Link>

          <Link
            href="/dashboard/interactions"
            className="flex items-center rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
          >
            <div className="flex-shrink-0 rounded-md bg-yellow-100 p-3">
              <span className="text-xl">🔍</span>
            </div>
            <div className="ml-4">
              <p className="font-medium text-gray-900">Check Interactions</p>
              <p className="text-sm text-gray-600">
                Review potential drug interactions
              </p>
            </div>
          </Link>

          <Link
            href="/dashboard/research"
            className="flex items-center rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
          >
            <div className="flex-shrink-0 rounded-md bg-purple-100 p-3">
              <span className="text-xl">📚</span>
            </div>
            <div className="ml-4">
              <p className="font-medium text-gray-900">Research Topics</p>
              <p className="text-sm text-gray-600">
                Save treatment research notes
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Patients */}
      {patients.length > 0 ? (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Your Patients
            </h2>
            <Link
              href="/dashboard/patients"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View all →
            </Link>
          </div>
          <div className="space-y-4">
            {patients.slice(0, 3).map((patient) => (
              <Link
                key={patient.$id}
                href={`/dashboard/patients/${patient.$id}`}
                className="block rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {patient.name}
                    </h3>
                    {patient.diagnosis && (
                      <p className="mt-1 text-sm text-gray-600">
                        {patient.diagnosis}
                      </p>
                    )}
                    {patient.relationship && (
                      <span className="mt-2 inline-block rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                        {patient.relationship}
                      </span>
                    )}
                  </div>
                  <span className="text-gray-400">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
          <span className="mb-4 inline-block text-4xl">👤</span>
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            No patients yet
          </h3>
          <p className="mb-4 text-gray-600">
            Get started by adding your first patient profile
          </p>
          <Link
            href="/dashboard/patients/new"
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Add Patient
          </Link>
        </div>
      )}

      {/* Important Notice */}
      <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-6">
        <h3 className="mb-2 flex items-center text-lg font-semibold text-blue-900">
          <span className="mr-2">ℹ️</span>
          Important Information
        </h3>
        <ul className="list-inside list-disc space-y-2 text-sm text-blue-800">
          <li>
            All interaction warnings are informational and should be discussed
            with your healthcare team
          </li>
          <li>
            This app does not store sensitive medical data like SSN or full date
            of birth
          </li>
          <li>
            Research notes and appointment briefs are tools to facilitate
            communication with your care team
          </li>
          <li>
            Always verify any information with qualified medical professionals
          </li>
        </ul>
      </div>
    </div>
  );
}
