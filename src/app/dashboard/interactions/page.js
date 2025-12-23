"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/auth";
import { getPatients, getRegimenItems } from "@/lib/data";
import { checkInteractions } from "@/lib/interactions";
import InteractionAlerts from "@/components/InteractionAlerts";

export default function InteractionsPage() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tempMed, setTempMed] = useState("");
  const [checkingTemp, setCheckingTemp] = useState(false);

  useEffect(() => {
    async function loadData() {
      const user = await getCurrentUser();
      if (user) {
        const result = await getPatients(user.$id);
        if (result.success) {
          setPatients(result.data);
          if (result.data.length > 0) {
            setSelectedPatient(result.data[0].$id);
            await loadInteractions(user.$id, result.data[0].$id);
          }
        }
      }
      setLoading(false);
    }
    loadData();
  }, []);

  async function loadInteractions(userId, patientId) {
    const result = await checkInteractions(userId, patientId);
    if (result.success) {
      setInteractions(result.data);
    }
  }

  const handlePatientChange = async (patientId) => {
    setSelectedPatient(patientId);
    setLoading(true);
    const user = await getCurrentUser();
    await loadInteractions(user.$id, patientId);
    setLoading(false);
  };

  const selectedPatientData = patients.find((p) => p.$id === selectedPatient);

  if (loading && patients.length === 0) {
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
          Interaction Checking
        </h1>
        <p className="mt-2 text-gray-600">
          Review potential drug and supplement interactions
        </p>
      </div>

      {patients.length > 0 ? (
        <>
          {/* Patient Selector */}
          <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
            <label className="block text-sm font-medium text-gray-700">
              Select Patient
            </label>
            <select
              value={selectedPatient || ""}
              onChange={(e) => handlePatientChange(e.target.value)}
              className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:w-auto"
            >
              {patients.map((patient) => (
                <option key={patient.$id} value={patient.$id}>
                  {patient.name}
                </option>
              ))}
            </select>
          </div>

          {/* Temporary Medication Check */}
          <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50 p-4">
            <h3 className="text-sm font-semibold text-blue-900">Check a new medication or supplement</h3>
            <p className="text-xs text-blue-700 mb-3">See if a new item interacts with {selectedPatientData?.name}'s current regimen.</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={tempMed}
                onChange={(e) => setTempMed(e.target.value)}
                placeholder="e.g., Ibuprofen, St. John's Wort"
                className="flex-1 rounded-md border border-blue-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                onClick={() => {
                  if (tempMed.trim()) {
                    alert(`Checking interactions for ${tempMed}... (Feature coming soon)`);
                    setTempMed("");
                  }
                }}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Check
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Interaction Alerts */}
              {interactions.length > 0 ? (
                <InteractionAlerts
                  interactions={interactions}
                  patientId={selectedPatient}
                />
              ) : (
                <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <span className="text-3xl">✅</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">No interactions detected</h3>
                  <p className="mt-2 text-gray-600">
                    We haven't found any potential interactions between the medications in {selectedPatientData?.name}'s regimen.
                  </p>
                  <div className="mt-6">
                    <Link
                      href={`/dashboard/patients/${selectedPatient}/regimen/new`}
                      className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      Add More Medications
                    </Link>
                  </div>
                </div>
              )}

              {/* Information Box */}
              <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-6">
                <h3 className="mb-3 text-lg font-semibold text-blue-900">
                  How Interaction Checking Works
                </h3>
                <div className="space-y-2 text-sm text-blue-800">
                  <p>
                    <strong>Current System:</strong> RegimenIQ uses a local
                    knowledge base of common drug and supplement interactions,
                    particularly those relevant to cancer treatment.
                  </p>
                  <p>
                    <strong>Future Integration:</strong> We plan to integrate
                    with external medical databases like DrugBank, RxNorm, and
                    Memorial Sloan Kettering's About Herbs database for more
                    comprehensive checking.
                  </p>
                  <p>
                    <strong>Important:</strong> This tool is educational only.
                    It cannot replace professional medical advice. All
                    interactions should be reviewed with your healthcare team.
                  </p>
                </div>
              </div>
            </>
          )}
        </>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
            <span className="text-3xl">💊</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900">Why check for interactions?</h3>
          <p className="mx-auto mt-2 max-w-md text-gray-600">
            Drug interactions can happen when two or more drugs react with each other. This can cause unexpected side effects or make your medications less effective.
          </p>
          <div className="mt-8 grid gap-6 text-left sm:grid-cols-3">
            <div className="rounded-lg border border-gray-100 p-4">
              <p className="font-semibold text-red-600">🔴 Serious</p>
              <p className="mt-1 text-xs text-gray-500">Consult doctor immediately. High risk of harm.</p>
            </div>
            <div className="rounded-lg border border-gray-100 p-4">
              <p className="font-semibold text-yellow-600">🟡 Moderate</p>
              <p className="mt-1 text-xs text-gray-500">Discuss with pharmacist. May need monitoring.</p>
            </div>
            <div className="rounded-lg border border-gray-100 p-4">
              <p className="font-semibold text-green-600">🟢 Minor</p>
              <p className="mt-1 text-xs text-gray-500">Low risk. Be aware of potential mild effects.</p>
            </div>
          </div>
          <div className="mt-10">
            <Link
              href="/dashboard/patients/new"
              className="inline-flex items-center rounded-md bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700"
            >
              Add Your First Patient to Start
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
