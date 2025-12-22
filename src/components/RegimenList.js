"use client";

import { useState } from "react";
import { deleteRegimenItem, updateRegimenItem } from "@/lib/data";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function RegimenList({ items, patientId, onUpdate }) {
  const params = useParams();
  const [editingId, setEditingId] = useState(null);

  const handleDelete = async (itemId) => {
    if (confirm("Are you sure you want to delete this regimen item?")) {
      const result = await deleteRegimenItem(itemId);
      if (result.success && onUpdate) {
        onUpdate();
      }
    }
  };

  const handleToggleActive = async (item) => {
    const result = await updateRegimenItem(item.$id, {
      isActive: !item.isActive,
    });
    if (result.success && onUpdate) {
      onUpdate();
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      medication: "bg-blue-100 text-blue-800",
      supplement: "bg-green-100 text-green-800",
      therapy: "bg-purple-100 text-purple-800",
      other: "bg-gray-100 text-gray-800",
    };
    return colors[category] || colors.other;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      medication: "💊",
      supplement: "🌿",
      therapy: "🏥",
      other: "📝",
    };
    return icons[category] || icons.other;
  };

  const activeItems = items.filter((item) => item.isActive);
  const inactiveItems = items.filter((item) => !item.isActive);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Treatment Regimen
        </h2>
        <Link
          href={`/dashboard/patients/${patientId}/regimen/new`}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Add Item
        </Link>
      </div>

      {/* Active Items */}
      {activeItems.length > 0 ? (
        <div className="mb-8 space-y-4">
          <h3 className="text-lg font-medium text-gray-900">
            Active ({activeItems.length})
          </h3>
          {activeItems.map((item) => (
            <div
              key={item.$id}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {getCategoryIcon(item.category)}
                    </span>
                    <h4 className="text-lg font-semibold text-gray-900">
                      {item.name}
                    </h4>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getCategoryColor(item.category)}`}
                    >
                      {item.category}
                    </span>
                  </div>

                  <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                    {item.dosage && (
                      <div>
                        <span className="font-medium text-gray-700">
                          Dosage:
                        </span>
                        <span className="ml-2 text-gray-600">
                          {item.dosage}
                        </span>
                      </div>
                    )}
                    {item.frequency && (
                      <div>
                        <span className="font-medium text-gray-700">
                          Frequency:
                        </span>
                        <span className="ml-2 text-gray-600">
                          {item.frequency}
                        </span>
                      </div>
                    )}
                    {item.source && (
                      <div>
                        <span className="font-medium text-gray-700">
                          Source:
                        </span>
                        <span className="ml-2 text-gray-600">
                          {item.source}
                        </span>
                      </div>
                    )}
                    {item.startDate && (
                      <div>
                        <span className="font-medium text-gray-700">
                          Start Date:
                        </span>
                        <span className="ml-2 text-gray-600">
                          {new Date(item.startDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {item.notes && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600">{item.notes}</p>
                    </div>
                  )}
                </div>

                <div className="ml-4 flex flex-col gap-2">
                  <button
                    onClick={() => handleToggleActive(item)}
                    className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Mark Inactive
                  </button>
                  <Link
                    href={`/dashboard/patients/${patientId}/regimen/${item.$id}/edit`}
                    className="rounded-md border border-gray-300 px-3 py-1 text-center text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(item.$id)}
                    className="rounded-md border border-red-300 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mb-8 rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
          <span className="mb-4 inline-block text-4xl">💊</span>
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            No active regimen items
          </h3>
          <p className="mb-4 text-gray-600">
            Add medications, supplements, or therapies to track the treatment
            plan
          </p>
          <Link
            href={`/dashboard/patients/${patientId}/regimen/new`}
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Add First Item
          </Link>
        </div>
      )}

      {/* Inactive Items */}
      {inactiveItems.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-600">
            Inactive ({inactiveItems.length})
          </h3>
          {inactiveItems.map((item) => (
            <div
              key={item.$id}
              className="rounded-lg border border-gray-200 bg-gray-50 p-4 opacity-75"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">
                      {getCategoryIcon(item.category)}
                    </span>
                    <h4 className="font-medium text-gray-700">{item.name}</h4>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${getCategoryColor(item.category)}`}
                    >
                      {item.category}
                    </span>
                  </div>
                  {item.endDate && (
                    <p className="mt-1 text-xs text-gray-600">
                      Ended: {new Date(item.endDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleActive(item)}
                    className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-white"
                  >
                    Reactivate
                  </button>
                  <button
                    onClick={() => handleDelete(item.$id)}
                    className="rounded-md border border-red-300 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
