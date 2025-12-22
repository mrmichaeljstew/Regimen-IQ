"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getPatient, getRegimenItems, deletePatient } from "@/lib/data";
import { checkInteractions } from "@/lib/interactions";
import Link from "next/link";
import RegimenList from "@/components/RegimenList";
import InteractionAlerts from "@/components/InteractionAlerts";

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [patient, setPatient] = useState(null);
  const [regimenItems, setRegimenItems] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    async function loadData() {
      const patientResult = await getPatient(params.id);
      if (patientResult.success) {
        setPatient(patientResult.data);

        // Load regimen items
        const regimenResult = await getRegimenItems(
          patientResult.data.userId,
          params.id
        );
        if (regimenResult.success) {
          setRegimenItems(regimenResult.data);
        }

        // Check interactions
        const interactionResult = await checkInteractions(
          patientResult.data.userId,
          params.id
        );
        if (interactionResult.success) {
          setInteractions(interactionResult.data);
        }
      }
      setLoading(false);
    }
    loadData();
  }, [params.id]);

  const handleDelete = async () => {
    const result = await deletePatient(params.id);
    if (result.success) {
      router.push("/dashboard/patients");
    }
  };

  const refreshRegimen = async () => {
    if (patient) {
      const result = await getRegimenItems(patient.userId, params.id);
      if (result.success) {
        setRegimenItems(result.data);
      }
      
      // Re-check interactions
      const interactionResult = await checkInteractions(patient.userId, params.id);
      if (interactionResult.success) {
        setInteractions(interactionResult.data);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Patient not found</h1>
        <Link
          href="/dashboard/patients"
          className="mt-4 inline-block text-blue-600 hover:text-blue-500"
        >
          ← Back to Patients
        </Link>
      </div>
    );
  }

  const activeItems = regimenItems.filter((item) => item.isActive);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard/patients"
          className="text-sm text-blue-600 hover:text-blue-500"
        >
          ← Back to Patients
        </Link>
      </div>

      <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-start">
            <div className="mr-4 flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
              <span className="text-3xl">👤</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {patient.name}
              </h1>
              {patient.relationship && (
                <span className="mt-1 inline-block rounded-full bg-gray-100 px-2.5 py-0.5 text-sm text-gray-700">
                  {patient.relationship}
                </span>
              )}
              {patient.diagnosis && (
                <p className="mt-2 text-gray-600">{patient.diagnosis}</p>
              )}
              {patient.diagnosisTags && patient.diagnosisTags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {patient.diagnosisTags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/dashboard/patients/${params.id}/edit`}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Edit
            </Link>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Interaction Alerts */}
      {interactions.length > 0 && (
        <InteractionAlerts interactions={interactions} patientId={params.id} />
      )}

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("overview")}
            className={`border-b-2 px-1 py-4 text-sm font-medium ${
              activeTab === "overview"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("regimen")}
            className={`border-b-2 px-1 py-4 text-sm font-medium ${
              activeTab === "regimen"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            Regimen ({activeItems.length})
          </button>
          <button
            onClick={() => setActiveTab("care-team")}
            className={`border-b-2 px-1 py-4 text-sm font-medium ${
              activeTab === "care-team"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            Care Team
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Quick Stats
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-sm text-gray-600">Active Items</p>
                <p className="text-2xl font-bold text-gray-900">
                  {activeItems.length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Flagged Interactions</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {interactions.length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Care Team Members</p>
                <p className="text-2xl font-bold text-gray-900">
                  {patient.careTeam?.length || 0}
                </p>
              </div>
            </div>
          </div>

          {patient.notes && (
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="mb-2 text-lg font-semibold text-gray-900">
                Notes
              </h2>
              <p className="whitespace-pre-wrap text-gray-700">
                {patient.notes}
              </p>
            </div>
          )}

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Quick Actions
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Link
                href={`/dashboard/patients/${params.id}/regimen/new`}
                className="flex items-center rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md"
              >
                <span className="mr-3 text-2xl">➕</span>
                <span className="font-medium">Add Regimen Item</span>
              </Link>
              <Link
                href={`/dashboard/research?patient=${params.id}`}
                className="flex items-center rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md"
              >
                <span className="mr-3 text-2xl">📚</span>
                <span className="font-medium">Research Topics</span>
              </Link>
              <Link
                href={`/dashboard/appointments/new?patient=${params.id}`}
                className="flex items-center rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md"
              >
                <span className="mr-3 text-2xl">📋</span>
                <span className="font-medium">Create Brief</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {activeTab === "regimen" && (
        <RegimenList
          items={regimenItems}
          patientId={params.id}
          onUpdate={refreshRegimen}
        />
      )}

      {activeTab === "care-team" && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Care Team Contacts
          </h2>
          {patient.careTeam && patient.careTeam.length > 0 ? (
            <div className="space-y-4">
              {patient.careTeam.map((member, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {member.name}
                      </h3>
                      {member.role && (
                        <p className="text-sm text-gray-600">{member.role}</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 space-y-1 text-sm">
                    {member.phone && (
                      <p className="text-gray-700">
                        📞 <a href={`tel:${member.phone}`}>{member.phone}</a>
                      </p>
                    )}
                    {member.email && (
                      <p className="text-gray-700">
                        ✉️{" "}
                        <a
                          href={`mailto:${member.email}`}
                          className="text-blue-600 hover:text-blue-500"
                        >
                          {member.email}
                        </a>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No care team contacts added yet.</p>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Delete Patient
            </h3>
            <p className="mb-6 text-gray-600">
              Are you sure you want to delete this patient? This will also
              delete all associated regimen items, interactions, and research
              notes. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                className="flex-1 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
