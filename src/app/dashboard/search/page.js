"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getPatients, getRegimenItems, getResearchNotes } from "@/lib/data";
import Link from "next/link";

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.toLowerCase() || "";
  
  const [results, setResults] = useState({
    patients: [],
    medications: [],
    research: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function performSearch() {
      if (!query) {
        setLoading(false);
        return;
      }

      const user = await getCurrentUser();
      if (!user) return;

      const patientsRes = await getPatients(user.$id);
      let foundPatients = [];
      let foundMeds = [];
      let foundResearch = [];

      if (patientsRes.success) {
        // Search patients
        foundPatients = patientsRes.data.filter(p => 
          p.name.toLowerCase().includes(query) || 
          p.diagnosis?.toLowerCase().includes(query) ||
          p.diagnosisTags?.some(t => t.toLowerCase().includes(query))
        );

        // Search medications and research for each patient
        for (const patient of patientsRes.data) {
          const medsRes = await getRegimenItems(user.$id, patient.$id);
          if (medsRes.success) {
            const matchingMeds = medsRes.data.filter(m => 
              m.name.toLowerCase().includes(query) || 
              m.notes?.toLowerCase().includes(query)
            ).map(m => ({ ...m, patientName: patient.name }));
            foundMeds.push(...matchingMeds);
          }

          const researchRes = await getResearchNotes(user.$id, patient.$id);
          if (researchRes.success) {
            const matchingResearch = researchRes.data.filter(r => 
              r.topic.toLowerCase().includes(query) || 
              r.content.toLowerCase().includes(query) ||
              r.tags?.some(t => t.toLowerCase().includes(query))
            ).map(r => ({ ...r, patientName: patient.name }));
            foundResearch.push(...matchingResearch);
          }
        }
      }

      setResults({
        patients: foundPatients,
        medications: foundMeds,
        research: foundResearch,
      });
      setLoading(false);
    }

    performSearch();
  }, [query]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
      </div>
    );
  }

  const totalResults = results.patients.length + results.medications.length + results.research.length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Search Results</h1>
        <p className="mt-2 text-gray-600">
          {totalResults} results found for "{query}"
        </p>
      </div>

      {totalResults === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
          <span className="mb-4 inline-block text-5xl">🔍</span>
          <h3 className="text-lg font-medium text-gray-900">No results found</h3>
          <p className="mt-2 text-gray-600">Try searching for something else or check your spelling.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Patients */}
          {results.patients.length > 0 && (
            <section>
              <h2 className="mb-4 text-xl font-semibold text-gray-900">Patients ({results.patients.length})</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {results.patients.map(patient => (
                  <Link 
                    key={patient.$id} 
                    href={`/dashboard/patients/${patient.$id}`}
                    className="rounded-lg border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow"
                  >
                    <h3 className="font-bold text-blue-600">{patient.name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-1">{patient.diagnosis}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Medications */}
          {results.medications.length > 0 && (
            <section>
              <h2 className="mb-4 text-xl font-semibold text-gray-900">Medications ({results.medications.length})</h2>
              <div className="space-y-3">
                {results.medications.map(med => (
                  <Link 
                    key={med.$id} 
                    href={`/dashboard/patients/${med.patientId}?tab=regimen`}
                    className="block rounded-lg border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between">
                      <h3 className="font-bold text-gray-900">{med.name}</h3>
                      <span className="text-xs text-gray-500">Patient: {med.patientName}</span>
                    </div>
                    <p className="text-sm text-gray-600">{med.dosage} - {med.frequency}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Research */}
          {results.research.length > 0 && (
            <section>
              <h2 className="mb-4 text-xl font-semibold text-gray-900">Research Notes ({results.research.length})</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {results.research.map(note => (
                  <Link 
                    key={note.$id} 
                    href={`/dashboard/research?patient=${note.patientId}`}
                    className="rounded-lg border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between mb-2">
                      <h3 className="font-bold text-gray-900">{note.topic}</h3>
                      <span className="text-xs text-gray-500">{note.patientName}</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{note.content}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading search...</div>}>
      <SearchResults />
    </Suspense>
  );
}
