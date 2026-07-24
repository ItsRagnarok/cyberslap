import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Vendor } from "@/types/db";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { data: vendors } = await supabase
    .from("vendors")
    .select("id, slug, name, description, phone, address, photo_url, is_active")
    .eq("is_active", true)
    .order("name");

  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white px-6 py-10 text-center sm:py-16">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          Acasă la Tine
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-zinc-600">
          Comandă mâncare și dulciuri făcute în casă, direct de la oameni din
          zona ta.
        </p>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
        <h2 className="mb-5 text-lg font-medium text-zinc-900">
          Vânzători disponibili
        </h2>

        {!vendors || vendors.length === 0 ? (
          <p className="text-zinc-500">
            Momentan nu există vânzători activi. Revino puțin mai târziu.
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {(vendors as Vendor[]).map((vendor) => (
              <li key={vendor.id}>
                <Link
                  href={`/v/${vendor.slug}`}
                  className="block rounded-xl border border-zinc-200 bg-white p-5 transition hover:border-zinc-400 hover:shadow-sm"
                >
                  <h3 className="text-lg font-semibold text-zinc-900">
                    {vendor.name}
                  </h3>
                  {vendor.description && (
                    <p className="mt-1 text-sm text-zinc-600">
                      {vendor.description}
                    </p>
                  )}
                  {vendor.address && (
                    <p className="mt-2 text-xs text-zinc-400">
                      {vendor.address}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
