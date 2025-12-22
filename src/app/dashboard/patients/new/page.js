"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createPatient } from "@/lib/data";
import Link from "next/link";

export default function NewPatientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    relationship: "self",
    diagnosis: "",
    diagnosisTags: "",
    notes: "",
    careTeam: [{ name: "", role: "", phone: "", email: "" }],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCareTeamChange = (index, field, value) => {
    const newCareTeam = [...formData.careTeam];
    newCareTeam[index][field] = value;
    setFormData((prev) => ({ ...prev, careTeam: newCareTeam }));
  };

  const addCareTeamMember = () => {
    setFormData((prev) => ({
      ...prev,
      careTeam: [
        ...prev.careTeam,
        { name: "", role: "", phone: "", email: "" },
      ],
    }));
  };

  const removeCareTeamMember = (index) => {
    if (formData.careTeam.length > 1) {
      const newCareTeam = formData.careTeam.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, careTeam: newCareTeam }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const user = await getCurrentUser();
    if (!user) {
      router.push("/login");
      return;
    }

    // Parse tags (comma-separated)
    const tags = formData.diagnosisTags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    // Filter out empty care team members
    const careTeam = formData.careTeam.filter(
      (member) => member.name.trim().length > 0
    );

    const result = await createPatient(user.$id, {
      name: formData.name,
      relationship: formData.relationship,
      diagnosis: formData.diagnosis,
      diagnosisTags: tags,
      notes: formData.notes,
      careTeam: careTeam,
    });

    if (result.success) {
      router.push(`/dashboard/patients/${result.data.$id}`);
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <Link
          href="/dashboard/patients"
          className="text-sm text-blue-600 hover:text-blue-500"
        >
          ← Back to Patients
        </Link>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          Add New Patient
        </h1>
        <p className="mb-6 text-sm text-gray-600">
          Create a patient profile to manage their treatment regimen
        </p>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Basic Information
            </h2>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Patient Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label
                  htmlFor="relationship"
                  className="block text-sm font-medium text-gray-700"
                >
                  Relationship
                </label>
                <select
                  id="relationship"
                  name="relationship"
                  value={formData.relationship}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="self">Self</option>
                  <option value="spouse">Spouse/Partner</option>
                  <option value="parent">Parent</option>
                  <option value="child">Child</option>
                  <option value="sibling">Sibling</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Diagnosis */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Diagnosis Information
            </h2>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="diagnosis"
                  className="block text-sm font-medium text-gray-700"
                >
                  Primary Diagnosis
                </label>
                <textarea
                  id="diagnosis"
                  name="diagnosis"
                  rows={3}
                  value={formData.diagnosis}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g., Stage 3 Non-Small Cell Lung Cancer"
                />
              </div>

              <div>
                <label
                  htmlFor="diagnosisTags"
                  className="block text-sm font-medium text-gray-700"
                >
                  Tags (comma-separated)
                </label>
                <input
                  id="diagnosisTags"
                  name="diagnosisTags"
                  type="text"
                  value={formData.diagnosisTags}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g., lung-cancer, stage-3, nsclc"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Helps organize and search patient records
                </p>
              </div>

              <div>
                <label
                  htmlFor="notes"
                  className="block text-sm font-medium text-gray-700"
                >
                  General Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  value={formData.notes}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Additional information, allergies, preferences, etc."
                />
              </div>
            </div>
          </div>

          {/* Care Team */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Care Team Contacts
            </h2>

            <div className="space-y-4">
              {formData.careTeam.map((member, index) => (
                <div
                  key={index}
                  className="rounded-md border border-gray-200 bg-gray-50 p-4"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Contact {index + 1}
                    </span>
                    {formData.careTeam.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCareTeamMember(index)}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      type="text"
                      placeholder="Name"
                      value={member.name}
                      onChange={(e) =>
                        handleCareTeamChange(index, "name", e.target.value)
                      }
                      className="rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Role (e.g., Oncologist)"
                      value={member.role}
                      onChange={(e) =>
                        handleCareTeamChange(index, "role", e.target.value)
                      }
                      className="rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={member.phone}
                      onChange={(e) =>
                        handleCareTeamChange(index, "phone", e.target.value)
                      }
                      className="rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={member.email}
                      onChange={(e) =>
                        handleCareTeamChange(index, "email", e.target.value)
                      }
                      className="rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addCareTeamMember}
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                + Add Another Contact
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 border-t border-gray-200 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Patient"}
            </button>
            <Link
              href="/dashboard/patients"
              className="rounded-md border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
