/** Hand-written types matching supabase/schema.sql */

export type Role = 'customer' | 'admin';
export type EditionType = 'one_of_one' | 'limited' | 'open';
export type ArtworkStatus = 'available' | 'reserved' | 'sold' | 'archived';
export type OrderStatus = 'pending' | 'paid' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';
export type CommissionStatus =
  | 'new'
  | 'in_discussion'
  | 'accepted'
  | 'in_progress'
  | 'completed'
  | 'declined';
export type InquiryStatus = 'new' | 'replied' | 'archived';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: Role;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  cover_image: string | null;
  featured: boolean;
  sort_order: number;
}

export interface Dimensions {
  width?: number;
  height?: number;
  depth?: number;
  unit: 'cm' | 'in';
}

export interface Artwork {
  id: string;
  slug: string;
  title: string;
  description: string;
  story: string | null;
  category_id: string;
  collection_id: string | null;
  price_cents: number;
  currency: string;
  edition_type: EditionType;
  edition_total: number | null;
  edition_available: number | null;
  stock: number;
  status: ArtworkStatus;
  materials: string[];
  dimensions: Dimensions | null;
  weight_grams: number | null;
  year: number;
  featured: boolean;
  published: boolean;
  created_at: string;
  updated_at: string;
  /** joined */
  category?: Category | null;
  collection?: Collection | null;
  images?: ArtworkImage[];
}

export interface ArtworkImage {
  id: string;
  artwork_id: string;
  url: string;
  alt: string | null;
  position: number;
  is_primary: boolean;
}

export interface OrderItem {
  id: string;
  order_id: string;
  artwork_id: string | null;
  title: string;
  unit_price_cents: number;
  quantity: number;
}

export interface Order {
  id: string;
  user_id: string | null;
  email: string;
  status: OrderStatus;
  subtotal_cents: number;
  shipping_cents: number;
  total_cents: number;
  currency: string;
  stripe_session_id: string | null;
  stripe_payment_intent: string | null;
  payment_provider: string | null;
  payment_reference: string | null;
  shipping_address: Record<string, unknown> | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface Commission {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  commission_type: string;
  budget_range: string;
  timeline: string;
  description: string;
  reference_images: string[];
  status: CommissionStatus;
  created_at: string;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  inquiry_type: string;
  status: InquiryStatus;
  created_at: string;
}

export interface JournalPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image: string | null;
  published: boolean;
  published_at: string | null;
  tags: string[];
  created_at: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  quote: string;
  featured: boolean;
  sort_order: number;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribed_at: string;
}
