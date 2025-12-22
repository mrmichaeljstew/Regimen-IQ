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
                <div className="rounded-lg border-2 border-dashed border-green-300 bg-green-50 p-12 text-center">
                  <span className="mb-4 inline-block text-5xl">✅</span>
                  <h3 className="mb-2 text-xl font-semibold text-green-900">
                    No interactions detected
                  </h3>
                  <p className="text-green-700">
                    {selectedPatientData?.name}'s current regimen has no known
                    interactions in our database.
                  </p>
                  <p className="mt-4 text-sm text-green-600">
                    This doesn't mean interactions are impossible. Always
                    discuss all medications and supplements with your healthcare
                    team.
                  </p>
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
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
          <span className="mb-4 inline-block text-5xl">👤</span>
          <h3 className="mb-2 text-xl font-semibold text-gray-900">
            No patients yet
          </h3>
          <p className="mb-6 text-gray-600">
            Add a patient profile to start checking for interactions
          </p>
          <a
            href="/dashboard/patients/new"
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Add Patient
          </a>
        </div>
      )}
    </div>
  );
}
