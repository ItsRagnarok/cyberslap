"use client";

import { useState } from "react";

type Prediction = {
  horizon: string;
  narrative: string;
  confidence: string;
  focus_areas: string[] | string;
  created_at: string;
};

const HORIZONS = ["3 luni", "1 an", "5 ani"];

export default function PredictionsClient({ initial }: { initial: Prediction[] }) {
  const [predictions, setPredictions] = useState(initial);
  const [loading, setLoading] = useState<string | null>(null);

  async function generate(horizon: string) {
    setLoading(horizon);
    const res = await fetch("/api/predictions/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ horizon }),
    });
    const data = await res.json();
    setLoading(null);
    if (res.ok) {
      setPredictions((prev) => [
        { horizon, ...data, created_at: new Date().toISOString() },
        ...prev.filter((p) => p.horizon !== horizon),
      ]);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {HORIZONS.map((h) => (
          <button
            key={h}
            onClick={() => generate(h)}
            disabled={loading === h}
            className="rounded-full border border-white/20 px-4 py-2 text-sm hover:border-accent disabled:opacity-50"
          >
            {loading === h ? "Analizez..." : `Regenerează: ${h}`}
          </button>
        ))}
      </div>

      {predictions.length === 0 && (
        <p className="text-sm opacity-50">
          Nicio predicție încă — apasă un buton de mai sus sau așteaptă rulările automate de duminică.
        </p>
      )}

      <div className="space-y-4">
        {predictions.map((p) => (
          <div key={p.horizon} className="rounded-xl border border-white/10 p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{p.horizon}</h3>
              <span className="text-xs uppercase tracking-wide opacity-60">
                încredere: {p.confidence}
              </span>
            </div>
            <p className="text-sm leading-relaxed opacity-90">{p.narrative}</p>
            {p.focus_areas && (
              <ul className="mt-3 flex flex-wrap gap-2">
                {(Array.isArray(p.focus_areas) ? p.focus_areas : JSON.parse(p.focus_areas as string)).map(
                  (f: string) => (
                    <li key={f} className="rounded-full bg-accent/20 px-3 py-1 text-xs">
                      {f}
                    </li>
                  )
                )}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
