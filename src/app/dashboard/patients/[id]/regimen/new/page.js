"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createRegimenItem } from "@/lib/data";
import Link from "next/link";

export default function NewRegimenItemPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    category: "medication",
    dosage: "",
    frequency: "",
    startDate: "",
    endDate: "",
    source: "",
    notes: "",
    isActive: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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

    const result = await createRegimenItem(user.$id, params.id, {
      ...formData,
      startDate: formData.startDate || null,
      endDate: formData.endDate || null,
    });

    if (result.success) {
      router.push(`/dashboard/patients/${params.id}`);
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <Link
          href={`/dashboard/patients/${params.id}`}
          className="text-sm text-blue-600 hover:text-blue-500"
        >
          ← Back to Patient
        </Link>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          Add Regimen Item
        </h1>
        <p className="mb-6 text-sm text-gray-600">
          Add a medication, supplement, therapy, or other treatment item
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
                  Item Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g., Pembrolizumab, Vitamin D, Physical Therapy"
                />
              </div>

              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700"
                >
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="medication">💊 Medication</option>
                  <option value="supplement">🌿 Supplement</option>
                  <option value="therapy">🏥 Therapy</option>
                  <option value="other">📝 Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Dosage & Frequency */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Dosage & Frequency
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="dosage"
                  className="block text-sm font-medium text-gray-700"
                >
                  Dosage
                </label>
                <input
                  id="dosage"
                  name="dosage"
                  type="text"
                  value={formData.dosage}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g., 200mg, 2 capsules"
                />
              </div>

              <div>
                <label
                  htmlFor="frequency"
                  className="block text-sm font-medium text-gray-700"
                >
                  Frequency
                </label>
                <input
                  id="frequency"
                  name="frequency"
                  type="text"
                  value={formData.frequency}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g., twice daily, every 3 weeks"
                />
              </div>
            </div>
          </div>

          {/* Dates */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Timeline
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="startDate"
                  className="block text-sm font-medium text-gray-700"
                >
                  Start Date
                </label>
                <input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="endDate"
                  className="block text-sm font-medium text-gray-700"
                >
                  End Date
                </label>
                <input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Leave blank for ongoing treatments
                </p>
              </div>
            </div>
          </div>

          {/* Source & Notes */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Additional Details
            </h2>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="source"
                  className="block text-sm font-medium text-gray-700"
                >
                  Prescriber / Source
                </label>
                <input
                  id="source"
                  name="source"
                  type="text"
                  value={formData.source}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g., Dr. Smith (Oncologist)"
                />
              </div>

              <div>
                <label
                  htmlFor="notes"
                  className="block text-sm font-medium text-gray-700"
                >
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  value={formData.notes}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Special instructions, side effects to watch, etc."
                />
              </div>

              <div className="flex items-center">
                <input
                  id="isActive"
                  name="isActive"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="isActive"
                  className="ml-2 text-sm text-gray-700"
                >
                  Currently active
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 border-t border-gray-200 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Item"}
            </button>
            <Link
              href={`/dashboard/patients/${params.id}`}
              className="rounded-md border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel
            </Link>
          </div>
        </form>

        <div className="mt-6 rounded-md bg-blue-50 p-4 text-sm text-blue-800">
          <p className="font-semibold">💡 Tip:</p>
          <p className="mt-1">
            After adding items, the system will automatically check for potential
            interactions and flag them for your review with your healthcare team.
          </p>
        </div>
      </div>
    </div>
  );
}
