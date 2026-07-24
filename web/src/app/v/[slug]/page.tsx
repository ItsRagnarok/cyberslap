import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Product, Vendor } from "@/types/db";
import { VendorShop } from "@/components/vendor-shop";

export const dynamic = "force-dynamic";

export default async function VendorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data: vendor } = await supabase
    .from("vendors")
    .select("id, slug, name, description, phone, address, photo_url, is_active")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (!vendor) notFound();

  const { data: products } = await supabase
    .from("products")
    .select("id, vendor_id, name, description, price_cents, photo_url, is_available")
    .eq("vendor_id", vendor.id)
    .eq("is_available", true)
    .order("name");

  return (
    <VendorShop
      vendor={vendor as Vendor}
      products={(products ?? []) as Product[]}
    />
  );
}
