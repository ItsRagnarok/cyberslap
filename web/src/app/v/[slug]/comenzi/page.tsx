"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatLei } from "@/lib/format";
import type { VendorOrder } from "@/types/db";

const STATUS_LABELS: Record<VendorOrder["status"], string> = {
  pending: "În așteptare",
  confirmed: "Confirmată",
  delivered: "Livrată",
  cancelled: "Anulată",
};

export default function VendorOrdersPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [code, setCode] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadOrders(accessCode: string) {
    setLoading(true);
    setError(null);
    const { data, error: rpcError } = await supabase.rpc("get_vendor_orders", {
      p_slug: slug,
      p_code: accessCode,
    });

    setLoading(false);

    if (rpcError) {
      setError("Nu am putut încărca comenzile.");
      return;
    }

    setOrders((data ?? []) as VendorOrder[]);
    setUnlocked(true);
  }

  async function updateStatus(orderId: string, status: VendorOrder["status"]) {
    const { error: rpcError } = await supabase.rpc("update_order_status", {
      p_slug: slug,
      p_code: code,
      p_order_id: orderId,
      p_status: status,
    });

    if (!rpcError) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
    }
  }

  if (!unlocked) {
    return (
      <div className="mx-auto flex max-w-sm flex-1 flex-col justify-center px-6 py-20">
        <h1 className="text-xl font-semibold text-zinc-900">
          Comenzile tale
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Introdu codul de acces primit la înregistrare.
        </p>
        <form
          className="mt-4 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            loadOrders(code);
          }}
        >
          <input
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Cod de acces"
            className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
          >
            {loading ? "..." : "Intră"}
          </button>
        </form>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
      <h1 className="text-xl font-semibold text-zinc-900">Comenzile tale</h1>

      {orders.length === 0 ? (
        <p className="mt-4 text-zinc-500">
          Nu există comenzi încă (sau codul introdus nu e valid).
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {orders.map((order) => (
            <li
              key={order.id}
              className="rounded-xl border border-zinc-200 bg-white p-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-zinc-900">
                  {order.customer_name}
                </span>
                <span className="text-xs text-zinc-400">
                  {new Date(order.created_at).toLocaleString("ro-RO")}
                </span>
              </div>
              <p className="mt-1 text-sm text-zinc-600">
                {order.customer_phone} · {order.customer_address}
              </p>
              {order.notes && (
                <p className="mt-1 text-sm italic text-zinc-500">
                  {order.notes}
                </p>
              )}
              <ul className="mt-3 space-y-1 text-sm text-zinc-700">
                {order.items.map((item, idx) => (
                  <li key={idx} className="flex justify-between">
                    <span>
                      {item.quantity}× {item.product_name}
                    </span>
                    <span>
                      {formatLei(item.unit_price_cents * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-2 flex justify-between border-t border-zinc-200 pt-2 font-medium text-zinc-900">
                <span>Total</span>
                <span>{formatLei(order.total_cents)}</span>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <select
                  value={order.status}
                  onChange={(e) =>
                    updateStatus(order.id, e.target.value as VendorOrder["status"])
                  }
                  className="rounded-lg border border-zinc-300 px-2 py-1 text-sm"
                >
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
