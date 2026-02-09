"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getPatients, getRegimenItems, getResearchNotes } from "@/lib/data";
import Link from "next/link";

const PAGE_SIZE = 10;

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "name-asc", label: "Name (A-Z)" },
  { value: "name-desc", label: "Name (Z-A)" },
  { value: "date-newest", label: "Date (Newest)" },
  { value: "date-oldest", label: "Date (Oldest)" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read filters from URL params
  const urlQuery = searchParams.get("q") || "";
  const urlCategories = searchParams.get("categories") || "patients,medications,research";
  const urlSort = searchParams.get("sort") || "relevance";
  const urlStatus = searchParams.get("status") || "all";
  const urlDateFrom = searchParams.get("dateFrom") || "";
  const urlDateTo = searchParams.get("dateTo") || "";

  // Local state for the search input (debounced)
  const [inputValue, setInputValue] = useState(urlQuery);
  const debounceRef = useRef(null);

  // Filter/sort state derived from URL
  const [categories, setCategories] = useState(() => {
    const cats = urlCategories.split(",").filter(Boolean);
    return {
      patients: cats.includes("patients"),
      medications: cats.includes("medications"),
      research: cats.includes("research"),
    };
  });
  const [sort, setSort] = useState(urlSort);
  const [statusFilter, setStatusFilter] = useState(urlStatus);
  const [dateFrom, setDateFrom] = useState(urlDateFrom);
  const [dateTo, setDateTo] = useState(urlDateTo);

  // Pagination: track how many items to show per category
  const [visibleCounts, setVisibleCounts] = useState({
    patients: PAGE_SIZE,
    medications: PAGE_SIZE,
    research: PAGE_SIZE,
  });

  // Data state
  const [allResults, setAllResults] = useState({
    patients: [],
    medications: [],
    research: [],
  });
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Build URL params from current filter state
  const buildParams = useCallback(
    (overrides = {}) => {
      const params = new URLSearchParams();
      const q = overrides.q !== undefined ? overrides.q : urlQuery;
      if (q) params.set("q", q);

      const cats = overrides.categories !== undefined ? overrides.categories : categories;
      const activeCats = Object.entries(cats)
        .filter(([, v]) => v)
        .map(([k]) => k);
      if (activeCats.length > 0 && activeCats.length < 3) {
        params.set("categories", activeCats.join(","));
      }

      const s = overrides.sort !== undefined ? overrides.sort : sort;
      if (s && s !== "relevance") params.set("sort", s);

      const st = overrides.status !== undefined ? overrides.status : statusFilter;
      if (st && st !== "all") params.set("status", st);

      const df = overrides.dateFrom !== undefined ? overrides.dateFrom : dateFrom;
      if (df) params.set("dateFrom", df);

      const dt = overrides.dateTo !== undefined ? overrides.dateTo : dateTo;
      if (dt) params.set("dateTo", dt);

      return params;
    },
    [urlQuery, categories, sort, statusFilter, dateFrom, dateTo]
  );

  const pushParams = useCallback(
    (overrides = {}) => {
      const params = buildParams(overrides);
      const qs = params.toString();
      router.replace(`/dashboard/search${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [buildParams, router]
  );

  // Debounced search input -> URL update
  const handleInputChange = useCallback(
    (value) => {
      setInputValue(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        pushParams({ q: value });
      }, 300);
    },
    [pushParams]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Sync inputValue when URL query changes externally (e.g. from layout search bar)
  useEffect(() => {
    setInputValue(urlQuery);
  }, [urlQuery]);

  // Category toggle
  const toggleCategory = useCallback(
    (cat) => {
      const updated = { ...categories, [cat]: !categories[cat] };
      // Ensure at least one category is selected
      if (!updated.patients && !updated.medications && !updated.research) return;
      setCategories(updated);
      setVisibleCounts({ patients: PAGE_SIZE, medications: PAGE_SIZE, research: PAGE_SIZE });
      pushParams({ categories: updated });
    },
    [categories, pushParams]
  );

  // Sort change
  const handleSortChange = useCallback(
    (value) => {
      setSort(value);
      pushParams({ sort: value });
    },
    [pushParams]
  );

  // Status filter change
  const handleStatusChange = useCallback(
    (value) => {
      setStatusFilter(value);
      pushParams({ status: value });
    },
    [pushParams]
  );

  // Date filter changes
  const handleDateFromChange = useCallback(
    (value) => {
      setDateFrom(value);
      pushParams({ dateFrom: value });
    },
    [pushParams]
  );

  const handleDateToChange = useCallback(
    (value) => {
      setDateTo(value);
      pushParams({ dateTo: value });
    },
    [pushParams]
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    const resetCats = { patients: true, medications: true, research: true };
    setCategories(resetCats);
    setSort("relevance");
    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
    setVisibleCounts({ patients: PAGE_SIZE, medications: PAGE_SIZE, research: PAGE_SIZE });
    // Keep the search query, just reset filters
    const params = new URLSearchParams();
    if (urlQuery) params.set("q", urlQuery);
    const qs = params.toString();
    router.replace(`/dashboard/search${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [urlQuery, router]);

  const hasActiveFilters =
    sort !== "relevance" ||
    statusFilter !== "all" ||
    dateFrom ||
    dateTo ||
    !categories.patients ||
    !categories.medications ||
    !categories.research;

  // Fetch data when query changes
  useEffect(() => {
    let cancelled = false;

    async function performSearch() {
      const query = urlQuery.toLowerCase().trim();
      if (!query) {
        setAllResults({ patients: [], medications: [], research: [] });
        setSearched(false);
        setLoading(false);
        return;
      }

      setLoading(true);
      setSearched(true);

      const user = await getCurrentUser();
      if (!user || cancelled) return;

      const patientsRes = await getPatients(user.$id);
      if (cancelled) return;

      let foundPatients = [];
      let foundMeds = [];
      let foundResearch = [];

      if (patientsRes.success) {
        foundPatients = patientsRes.data.filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            p.diagnosis?.toLowerCase().includes(query) ||
            p.diagnosisTags?.some((t) => t.toLowerCase().includes(query))
        );

        for (const patient of patientsRes.data) {
          const medsRes = await getRegimenItems(user.$id, patient.$id);
          if (cancelled) return;
          if (medsRes.success) {
            const matchingMeds = medsRes.data
              .filter(
                (m) =>
                  m.name.toLowerCase().includes(query) ||
                  m.notes?.toLowerCase().includes(query)
              )
              .map((m) => ({ ...m, patientName: patient.name }));
            foundMeds.push(...matchingMeds);
          }

          const researchRes = await getResearchNotes(user.$id, patient.$id);
          if (cancelled) return;
          if (researchRes.success) {
            const matchingResearch = researchRes.data
              .filter(
                (r) =>
                  r.topic.toLowerCase().includes(query) ||
                  r.content.toLowerCase().includes(query) ||
                  r.tags?.some((t) => t.toLowerCase().includes(query))
              )
              .map((r) => ({ ...r, patientName: patient.name }));
            foundResearch.push(...matchingResearch);
          }
        }
      }

      if (!cancelled) {
        setAllResults({
          patients: foundPatients,
          medications: foundMeds,
          research: foundResearch,
        });
        setVisibleCounts({
          patients: PAGE_SIZE,
          medications: PAGE_SIZE,
          research: PAGE_SIZE,
        });
        setLoading(false);
      }
    }

    performSearch();
    return () => {
      cancelled = true;
    };
  }, [urlQuery]);

  // Apply client-side filters and sorting to raw results
  const getFilteredResults = useCallback(() => {
    let patients = [...allResults.patients];
    let medications = [...allResults.medications];
    let research = [...allResults.research];

    // Date range filter
    if (dateFrom) {
      const from = new Date(dateFrom);
      patients = patients.filter((p) => new Date(p.createdAt || p.$createdAt) >= from);
      medications = medications.filter((m) => new Date(m.createdAt || m.$createdAt) >= from);
      research = research.filter((r) => new Date(r.createdAt || r.$createdAt) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo + "T23:59:59");
      patients = patients.filter((p) => new Date(p.createdAt || p.$createdAt) <= to);
      medications = medications.filter((m) => new Date(m.createdAt || m.$createdAt) <= to);
      research = research.filter((r) => new Date(r.createdAt || r.$createdAt) <= to);
    }

    // Status filter for medications
    if (statusFilter === "active") {
      medications = medications.filter((m) => m.isActive === true);
    } else if (statusFilter === "inactive") {
      medications = medications.filter((m) => m.isActive === false);
    }

    // Sorting
    const sortItems = (arr, nameKey) => {
      switch (sort) {
        case "name-asc":
          return arr.sort((a, b) =>
            (a[nameKey] || "").localeCompare(b[nameKey] || "")
          );
        case "name-desc":
          return arr.sort((a, b) =>
            (b[nameKey] || "").localeCompare(a[nameKey] || "")
          );
        case "date-newest":
          return arr.sort(
            (a, b) =>
              new Date(b.createdAt || b.$createdAt) -
              new Date(a.createdAt || a.$createdAt)
          );
        case "date-oldest":
          return arr.sort(
            (a, b) =>
              new Date(a.createdAt || a.$createdAt) -
              new Date(b.createdAt || b.$createdAt)
          );
        default:
          return arr; // relevance = original order from search
      }
    };

    return {
      patients: sortItems(patients, "name"),
      medications: sortItems(medications, "name"),
      research: sortItems(research, "topic"),
    };
  }, [allResults, dateFrom, dateTo, statusFilter, sort]);

  const filtered = getFilteredResults();

  const totalFiltered =
    (categories.patients ? filtered.patients.length : 0) +
    (categories.medications ? filtered.medications.length : 0) +
    (categories.research ? filtered.research.length : 0);

  const loadMore = (category) => {
    setVisibleCounts((prev) => ({
      ...prev,
      [category]: prev[category] + PAGE_SIZE,
    }));
  };

  // Render
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header with search input */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Search</h1>
        <div className="mt-4">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-400 text-lg">&#128269;</span>
            </div>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Search patients, medications, research notes..."
              autoFocus
            />
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex flex-wrap items-start gap-6">
          {/* Category Toggles */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Categories
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { key: "patients", label: "Patients" },
                { key: "medications", label: "Medications" },
                { key: "research", label: "Research" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => toggleCategory(key)}
                  className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                    categories[key]
                      ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                      : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                  }`}
                >
                  {label}
                  {searched && (
                    <span className="ml-1 text-xs">
                      ({filtered[key]?.length || 0})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Sort by
            </label>
            <select
              value={sort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter (medications) */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Med Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Date Range
            </label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => handleDateFromChange(e.target.value)}
                className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <span className="text-gray-400 text-sm">to</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => handleDateToChange(e.target.value)}
                className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Results Summary */}
      {searched && (
        <p className="mb-4 text-sm text-gray-600">
          {totalFiltered} result{totalFiltered !== 1 ? "s" : ""} found
          {urlQuery ? ` for "${urlQuery}"` : ""}
          {hasActiveFilters ? " (filtered)" : ""}
        </p>
      )}

      {/* No query state */}
      {!searched && !urlQuery && (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
          <span className="mb-4 inline-block text-5xl">&#128269;</span>
          <h3 className="text-lg font-medium text-gray-900">
            Search across your data
          </h3>
          <p className="mt-2 text-gray-600">
            Enter a search term to find patients, medications, and research
            notes.
          </p>
        </div>
      )}

      {/* No results state */}
      {searched && totalFiltered === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
          <span className="mb-4 inline-block text-5xl">&#128683;</span>
          <h3 className="text-lg font-medium text-gray-900">No results found</h3>
          <p className="mt-2 text-gray-600">
            {hasActiveFilters
              ? "Try adjusting your filters or search for something else."
              : "Try searching for something else or check your spelling."}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}

      {/* Results */}
      {searched && totalFiltered > 0 && (
        <div className="space-y-8">
          {/* Patients */}
          {categories.patients && filtered.patients.length > 0 && (
            <section>
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Patients ({filtered.patients.length})
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.patients
                  .slice(0, visibleCounts.patients)
                  .map((patient) => (
                    <Link
                      key={patient.$id}
                      href={`/dashboard/patients/${patient.$id}`}
                      className="rounded-lg border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow"
                    >
                      <h3 className="font-bold text-blue-600">
                        {patient.name}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-1">
                        {patient.diagnosis}
                      </p>
                      {patient.createdAt && (
                        <p className="mt-1 text-xs text-gray-400">
                          {new Date(patient.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </Link>
                  ))}
              </div>
              {filtered.patients.length > visibleCounts.patients && (
                <button
                  onClick={() => loadMore("patients")}
                  className="mt-3 w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Load more patients (
                  {filtered.patients.length - visibleCounts.patients} remaining)
                </button>
              )}
            </section>
          )}

          {/* Medications */}
          {categories.medications && filtered.medications.length > 0 && (
            <section>
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Medications ({filtered.medications.length})
              </h2>
              <div className="space-y-3">
                {filtered.medications
                  .slice(0, visibleCounts.medications)
                  .map((med) => (
                    <Link
                      key={med.$id}
                      href={`/dashboard/patients/${med.patientId}?tab=regimen`}
                      className="block rounded-lg border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-gray-900">
                            {med.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {med.dosage} - {med.frequency}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                              med.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {med.isActive ? "Active" : "Inactive"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {med.patientName}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
              {filtered.medications.length > visibleCounts.medications && (
                <button
                  onClick={() => loadMore("medications")}
                  className="mt-3 w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Load more medications (
                  {filtered.medications.length - visibleCounts.medications}{" "}
                  remaining)
                </button>
              )}
            </section>
          )}

          {/* Research Notes */}
          {categories.research && filtered.research.length > 0 && (
            <section>
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Research Notes ({filtered.research.length})
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {filtered.research
                  .slice(0, visibleCounts.research)
                  .map((note) => (
                    <Link
                      key={note.$id}
                      href={`/dashboard/research?patient=${note.patientId}`}
                      className="rounded-lg border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="mb-2 flex justify-between">
                        <h3 className="font-bold text-gray-900">
                          {note.topic}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {note.patientName}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {note.content}
                      </p>
                      {note.tags && note.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {note.tags.slice(0, 3).map((tag, i) => (
                            <span
                              key={i}
                              className="rounded-full bg-purple-50 px-2 py-0.5 text-xs text-purple-600"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      {note.createdAt && (
                        <p className="mt-1 text-xs text-gray-400">
                          {new Date(note.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </Link>
                  ))}
              </div>
              {filtered.research.length > visibleCounts.research && (
                <button
                  onClick={() => loadMore("research")}
                  className="mt-3 w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Load more research notes (
                  {filtered.research.length - visibleCounts.research} remaining)
                </button>
              )}
            </section>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
        </div>
      }
    >
      <SearchResults />
    </Suspense>
  );
}
