export type Vendor = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  phone: string | null;
  address: string | null;
  photo_url: string | null;
  is_active: boolean;
};

export type Product = {
  id: string;
  vendor_id: string;
  name: string;
  description: string | null;
  price_cents: number;
  photo_url: string | null;
  is_available: boolean;
};

export type VendorOrder = {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  notes: string | null;
  status: "pending" | "confirmed" | "delivered" | "cancelled";
  total_cents: number;
  created_at: string;
  items: { product_name: string; quantity: number; unit_price_cents: number }[];
};
