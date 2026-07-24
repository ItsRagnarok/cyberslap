"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatLei } from "@/lib/format";
import type { Product, Vendor } from "@/types/db";

type CartLine = { product: Product; quantity: number };

export function VendorShop({
  vendor,
  products,
}: {
  vendor: Vendor;
  products: Product[];
}) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [showCheckout, setShowCheckout] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const [form, setForm] = useState({
    customer_name: "",
    customer_phone: "",
    customer_address: "",
    notes: "",
  });

  const cartLines: CartLine[] = useMemo(
    () =>
      products
        .map((product) => ({ product, quantity: quantities[product.id] ?? 0 }))
        .filter((line) => line.quantity > 0),
    [products, quantities]
  );

  const totalCents = cartLines.reduce(
    (sum, line) => sum + line.product.price_cents * line.quantity,
    0
  );

  function setQuantity(productId: string, quantity: number) {
    setQuantities((prev) => ({ ...prev, [productId]: Math.max(0, quantity) }));
  }

  async function submitOrder() {
    if (cartLines.length === 0) return;
    setSubmitting(true);
    setError(null);

    const orderId = crypto.randomUUID();

    const { error: orderError } = await supabase.from("orders").insert({
      id: orderId,
      vendor_id: vendor.id,
      customer_name: form.customer_name,
      customer_phone: form.customer_phone,
      customer_address: form.customer_address,
      notes: form.notes || null,
      total_cents: totalCents,
    });

    if (orderError) {
      setError("Nu am putut trimite comanda. Încearcă din nou.");
      setSubmitting(false);
      return;
    }

    const { error: itemsError } = await supabase.from("order_items").insert(
      cartLines.map((line) => ({
        id: crypto.randomUUID(),
        order_id: orderId,
        product_id: line.product.id,
        product_name: line.product.name,
        unit_price_cents: line.product.price_cents,
        quantity: line.quantity,
      }))
    );

    if (itemsError) {
      setError("Nu am putut trimite comanda. Încearcă din nou.");
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    setOrderPlaced(true);
  }

  if (orderPlaced) {
    return (
      <div className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <h1 className="text-2xl font-semibold text-zinc-900">
          Comandă trimisă!
        </h1>
        <p className="mt-3 text-zinc-600">
          {vendor.name} va lua legătura cu tine la {form.customer_phone} pentru
          confirmare.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
      <Link href="/" className="text-sm text-zinc-500 hover:underline">
        ← Toți vânzătorii
      </Link>
      <h1 className="mt-2 text-2xl font-semibold text-zinc-900">
        {vendor.name}
      </h1>
      {vendor.description && (
        <p className="mt-1 text-zinc-600">{vendor.description}</p>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <ul className="grid gap-4 sm:grid-cols-2">
          {products.map((product) => (
            <li
              key={product.id}
              className="rounded-xl border border-zinc-200 bg-white p-4"
            >
              <h3 className="font-semibold text-zinc-900">{product.name}</h3>
              {product.description && (
                <p className="mt-1 text-sm text-zinc-600">
                  {product.description}
                </p>
              )}
              <div className="mt-3 flex items-center justify-between">
                <span className="font-medium text-zinc-900">
                  {formatLei(product.price_cents)}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity(product.id, (quantities[product.id] ?? 0) - 1)
                    }
                    className="h-8 w-8 rounded-full border border-zinc-300 text-zinc-600 hover:bg-zinc-100"
                    aria-label="Scade cantitatea"
                  >
                    −
                  </button>
                  <span className="w-5 text-center">
                    {quantities[product.id] ?? 0}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity(product.id, (quantities[product.id] ?? 0) + 1)
                    }
                    className="h-8 w-8 rounded-full border border-zinc-300 text-zinc-600 hover:bg-zinc-100"
                    aria-label="Crește cantitatea"
                  >
                    +
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="font-semibold text-zinc-900">Coșul tău</h2>
          {cartLines.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-500">
              Adaugă produse din listă.
            </p>
          ) : (
            <>
              <ul className="mt-3 space-y-2 text-sm">
                {cartLines.map((line) => (
                  <li
                    key={line.product.id}
                    className="flex justify-between text-zinc-700"
                  >
                    <span>
                      {line.quantity}× {line.product.name}
                    </span>
                    <span>
                      {formatLei(line.product.price_cents * line.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex justify-between border-t border-zinc-200 pt-3 font-semibold text-zinc-900">
                <span>Total</span>
                <span>{formatLei(totalCents)}</span>
              </div>

              {!showCheckout ? (
                <button
                  type="button"
                  onClick={() => setShowCheckout(true)}
                  className="mt-4 w-full rounded-full bg-zinc-900 py-2.5 font-medium text-white hover:bg-zinc-700"
                >
                  Comandă acum
                </button>
              ) : (
                <form
                  className="mt-4 space-y-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    submitOrder();
                  }}
                >
                  <input
                    required
                    placeholder="Nume complet"
                    value={form.customer_name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, customer_name: e.target.value }))
                    }
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                  />
                  <input
                    required
                    type="tel"
                    placeholder="Telefon"
                    value={form.customer_phone}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, customer_phone: e.target.value }))
                    }
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                  />
                  <input
                    required
                    placeholder="Adresă de livrare"
                    value={form.customer_address}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        customer_address: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                  />
                  <textarea
                    placeholder="Observații (opțional)"
                    value={form.notes}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, notes: e.target.value }))
                    }
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                    rows={2}
                  />
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-full bg-zinc-900 py-2.5 font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
                  >
                    {submitting ? "Se trimite..." : "Trimite comanda"}
                  </button>
                </form>
              )}
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
