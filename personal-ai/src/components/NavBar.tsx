"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/chat", label: "Check-in" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/predictions", label: "Predicții" },
];

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="flex items-center justify-between border-b border-white/10 px-6 py-4">
      <div className="flex gap-5">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`text-sm font-medium ${
              pathname === l.href ? "text-accent" : "opacity-70 hover:opacity-100"
            }`}
          >
            {l.label}
          </Link>
        ))}
      </div>
      <button onClick={logout} className="text-sm opacity-60 hover:opacity-100">
        Ieșire
      </button>
    </nav>
  );
}
