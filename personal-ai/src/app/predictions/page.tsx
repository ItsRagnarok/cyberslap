import NavBar from "@/components/NavBar";
import { getLatestPredictions } from "@/lib/data";
import PredictionsClient from "./PredictionsClient";

export const dynamic = "force-dynamic";

export default async function PredictionsPage() {
  const predictions = await getLatestPredictions();

  return (
    <main className="min-h-screen">
      <NavBar />
      <div className="mx-auto max-w-2xl px-4 py-8 space-y-4">
        <div>
          <h1 className="text-lg font-semibold">Traiectorie</h1>
          <p className="text-sm opacity-60">
            Estimări bazate pe pattern-uri observate, nu garanții. Se regenerează automat în fiecare
            duminică, sau manual mai jos.
          </p>
        </div>
        <PredictionsClient initial={predictions as any} />
      </div>
    </main>
  );
}
