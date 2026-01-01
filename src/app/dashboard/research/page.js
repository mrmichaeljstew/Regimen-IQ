"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/auth";
import { getPatients, getResearchNotes, createResearchNote, deleteResearchNote } from "@/lib/data";
import Link from "next/link";

export default function ResearchPage() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [researchNotes, setResearchNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    topic: "",
    tags: "",
    content: "",
    importance: "Medium",
    sources: [{ title: "", url: "" }],
  });

  useEffect(() => {
    async function loadData() {
      const user = await getCurrentUser();
      if (user) {
        const result = await getPatients(user.$id);
        if (result.success) {
          setPatients(result.data);
          if (result.data.length > 0) {
            setSelectedPatient(result.data[0].$id);
            await loadResearch(user.$id, result.data[0].$id);
          }
        }
      }
      setLoading(false);
    }
    loadData();
  }, []);

  async function loadResearch(userId, patientId) {
    const result = await getResearchNotes(userId, patientId);
    if (result.success) {
      setResearchNotes(result.data);
    }
  }

  const handlePatientChange = async (patientId) => {
    setSelectedPatient(patientId);
    setLoading(true);
    const user = await getCurrentUser();
    await loadResearch(user.$id, patientId);
    setLoading(false);
    setShowForm(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSourceChange = (index, field, value) => {
    const newSources = [...formData.sources];
    newSources[index][field] = value;
    setFormData((prev) => ({ ...prev, sources: newSources }));
  };

  const addSource = () => {
    setFormData((prev) => ({
      ...prev,
      sources: [...prev.sources, { title: "", url: "" }],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
        console.log("Form submit started", { selectedPatient, formData });
    const user = await getCurrentUser();

    const tags = formData.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    const sources = formData.sources.filter(
      (source) => source.url.trim().length > 0
    );

    const result = await createResearchNote(user.$id, selectedPatient, {
      topic: formData.topic,
      tags,
      content: formData.content,
      importance: formData.importance,
      sources,
    });
        console.log("Create result:", result);

    if (result.success) {
      setFormData({
        topic: "",
        tags: "",
        content: "",
        importance: "Medium",
        sources: [{ title: "", url: "" }],
      });
      setShowForm(false);
      await loadResearch(user.$id, selectedPatient);
    }
     else {
      console.error("Failed to create note:", result.error);
      alert("Error creating research note: " + (result.error || "Unknown error"));
    }
  };

  const handleDelete = async (noteId) => {
    if (confirm("Are you sure you want to delete this research note?")) {
      const result = await deleteResearchNote(noteId);
      if (result.success) {
        const user = await getCurrentUser();
        await loadResearch(user.$id, selectedPatient);
      }
    }
  };

  if (loading && patients.length === 0) {
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
            Research Workspace
          </h1>
          <p className="mt-2 text-gray-600">
            Save and organize treatment research notes
          </p>
        </div>
        {selectedPatient && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            {showForm ? "Cancel" : "New Note"}
          </button>
        )}
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

          {/* New Note Form */}
          {showForm && (
            <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                New Research Note
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Topic *
                  </label>
                  <input
                    name="topic"
                    type="text"
                    required
                    value={formData.topic}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g., Side effects of immunotherapy"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Importance
                    </label>
                    <select
                      name="importance"
                      value={formData.importance}
                      onChange={handleChange}
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Tags (comma-separated)
                    </label>
                    <input
                      name="tags"
                      type="text"
                      value={formData.tags}
                      onChange={handleChange}
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="e.g., immunotherapy, side-effects"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Notes *
                  </label>
                  <textarea
                    name="content"
                    rows={6}
                    required
                    value={formData.content}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Your research findings and notes..."
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Sources
                  </label>
                  {formData.sources.map((source, idx) => (
                    <div key={idx} className="mb-2 grid gap-2 sm:grid-cols-2">
                      <input
                        type="text"
                        placeholder="Source title"
                        value={source.title}
                        onChange={(e) =>
                          handleSourceChange(idx, "title", e.target.value)
                        }
                        className="rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <input
                        type="url"
                        placeholder="URL"
                        value={source.url}
                        onChange={(e) =>
                          handleSourceChange(idx, "url", e.target.value)
                        }
                        className="rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addSource}
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    + Add Source
                  </button>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Save Note
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Research Notes List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
            </div>
          ) : researchNotes.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {researchNotes.map((note) => (
                <div
                  key={note.$id}
                  className="flex flex-col rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                            note.importance === "High"
                              ? "bg-red-100 text-red-700"
                              : note.importance === "Medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {note.importance}
                        </span>
                        <span className="text-[10px] text-gray-500">
                          {new Date(note.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                        {note.topic}
                      </h3>
                    </div>
                  </div>

                  <p className="mb-4 flex-grow text-sm text-gray-600 line-clamp-3">
                    {note.content}
                  </p>

                  {note.tags && note.tags.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-1">
                      {note.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600"
                        >
                          {tag}
                        </span>
                      ))}
                      {note.tags.length > 3 && (
                        <span className="text-[10px] text-gray-400">
                          +{note.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => alert(note.content)} // Simple view for now
                        className="text-xs font-medium text-blue-600 hover:text-blue-500"
                      >
                        View Full
                      </button>
                    </div>
                    <button
                      onClick={() => handleDelete(note.$id)}
                      className="text-xs font-medium text-red-600 hover:text-red-500"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
              <span className="mb-4 inline-block text-5xl">📚</span>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">
                No research notes yet
              </h3>
              <p className="text-gray-600">
                Start saving research findings and treatment information
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
          <span className="mb-4 inline-block text-5xl">👤</span>
          <h3 className="mb-2 text-xl font-semibold text-gray-900">
            No patients yet
          </h3>
          <p className="mb-6 text-gray-600">
            Add a patient profile to start saving research notes
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
