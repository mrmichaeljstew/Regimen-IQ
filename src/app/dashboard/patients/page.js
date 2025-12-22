"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/auth";
import { getPatients } from "@/lib/data";
import Link from "next/link";

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPatients() {
      const user = await getCurrentUser();
      if (user) {
        const result = await getPatients(user.$id);
        if (result.success) {
          setPatients(result.data);
        }
      }
      setLoading(false);
    }
    loadPatients();
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
          <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
          <p className="mt-2 text-gray-600">
            Manage patient profiles and their treatment regimens
          </p>
        </div>
        <Link
          href="/dashboard/patients/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Add Patient
        </Link>
      </div>

      {patients.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {patients.map((patient) => (
            <Link
              key={patient.$id}
              href={`/dashboard/patients/${patient.$id}`}
              className="rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                  <span className="text-xl">👤</span>
                </div>
                <span className="text-gray-400">→</span>
              </div>

              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                {patient.name}
              </h3>

              {patient.relationship && (
                <span className="mb-3 inline-block rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                  {patient.relationship}
                </span>
              )}

              {patient.diagnosis && (
                <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                  {patient.diagnosis}
                </p>
              )}

              {patient.diagnosisTags && patient.diagnosisTags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {patient.diagnosisTags.slice(0, 3).map((tag, idx) => (
                    <span
                      key={idx}
                      className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700"
                    >
                      {tag}
                    </span>
                  ))}
                  {patient.diagnosisTags.length > 3 && (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                      +{patient.diagnosisTags.length - 3}
                    </span>
                  )}
                </div>
              )}

              <div className="mt-4 text-xs text-gray-500">
                Added {new Date(patient.createdAt).toLocaleDateString()}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
          <span className="mb-4 inline-block text-5xl">👤</span>
          <h3 className="mb-2 text-xl font-semibold text-gray-900">
            No patients yet
          </h3>
          <p className="mb-6 text-gray-600">
            Get started by adding your first patient profile. You can manage
            yourself or family members.
          </p>
          <Link
            href="/dashboard/patients/new"
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Add Your First Patient
          </Link>
        </div>
      )}
    </div>
  );
}
