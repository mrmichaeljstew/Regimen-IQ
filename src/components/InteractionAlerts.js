"use client";

import { getSeverityDisplay } from "@/lib/interactions";
import { saveInteraction } from "@/lib/interactions";
import { useState } from "react";

export default function InteractionAlerts({ interactions, patientId }) {
  const [saving, setSaving] = useState(false);

  if (interactions.length === 0) {
    return null;
  }

  const handleSaveInteraction = async (interaction) => {
    setSaving(true);
    // This would save the detected interaction to the database
    // For now, interactions are checked on-the-fly
    setSaving(false);
  };

  return (
    <div className="mb-6 space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">
        ⚠️ Potential Interactions Detected
      </h2>
      <p className="text-sm text-gray-600">
        The following potential interactions have been detected. These are
        informational only and should be discussed with your healthcare team.
      </p>

      {interactions.map((interaction, idx) => {
        const display = getSeverityDisplay(interaction.severity);

        return (
          <div
            key={idx}
            className={`rounded-lg border-2 ${display.borderColor} ${display.bgColor} p-4`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${display.color}`}
                  >
                    {display.label}
                  </span>
                  <span className="text-xs text-gray-600">
                    {display.description}
                  </span>
                </div>

                <h3 className={`mb-2 font-semibold ${display.color}`}>
                  {interaction.items?.map((item) => item.name).join(" + ")}
                </h3>

                <p className="mb-3 text-sm text-gray-700">
                  {interaction.description}
                </p>

                {interaction.sources && interaction.sources.length > 0 && (
                  <div className="mb-3">
                    <p className="mb-1 text-xs font-medium text-gray-700">
                      Sources:
                    </p>
                    <ul className="space-y-1">
                      {interaction.sources.map((source, sidx) => (
                        <li key={sidx}>
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-500 hover:underline"
                          >
                            {source.title} ↗
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="text-gray-600">
                    Detected: {new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-md bg-white p-3 text-xs text-gray-700">
              <p className="font-semibold">⚕️ What to do:</p>
              <ul className="mt-1 list-inside list-disc space-y-1">
                <li>Do not stop any prescribed medications without consulting your doctor</li>
                <li>Bring this information to your next appointment</li>
                <li>Ask your healthcare provider if any adjustments are needed</li>
                <li>Keep a record of when you discuss this with your care team</li>
              </ul>
            </div>
          </div>
        );
      })}

      <div className="rounded-md border border-gray-200 bg-white p-4 text-sm text-gray-700">
        <p className="font-semibold">💡 About Interaction Checking:</p>
        <p className="mt-2">
          This app uses a combination of local knowledge and will integrate with
          external medical databases in the future. Interaction checking is
          provided as an educational tool and does not replace professional
          medical advice. Always consult with your healthcare team before making
          any changes to your treatment regimen.
        </p>
      </div>
    </div>
  );
}
