import NavBar from "@/components/NavBar";
import { getDailySummaries, getProfile } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [profile, summaries] = await Promise.all([getProfile(), getDailySummaries(30)]);

  return (
    <main className="min-h-screen">
      <NavBar />
      <div className="mx-auto max-w-2xl px-4 py-8 space-y-8">
        <section>
          <h1 className="text-lg font-semibold mb-2">Cine ești, conform sistemului</h1>
          <p className="rounded-xl bg-white/5 p-4 text-sm leading-relaxed opacity-90">
            {profile.narrative || "Încă nu am destule conversații ca să-mi formez o imagine. Mergi la Check-in."}
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">Istoric zilnic</h2>
          {summaries.length === 0 && <p className="text-sm opacity-50">Niciun rezumat încă.</p>}
          <div className="space-y-3">
            {(summaries as any[]).map((s) => (
              <div key={s.entry_date} className="rounded-xl border border-white/10 p-4">
                <div className="flex items-center justify-between text-xs opacity-50 mb-1">
                  <span>{s.entry_date}</span>
                  <span>{s.mood}</span>
                </div>
                <p className="text-sm">{s.summary}</p>
                {s.learned && (
                  <p className="text-xs mt-2 opacity-70 italic">Am învățat: {s.learned}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
