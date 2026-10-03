import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name.').max(120),
  email: z.string().trim().email('Please enter a valid email address.').max(200),
  subject: z.string().trim().min(3, 'Please add a subject.').max(200),
  inquiryType: z.enum(['general', 'purchase', 'press', 'visit', 'other']),
  message: z.string().trim().min(20, 'Please tell us a little more (20+ characters).').max(5000),
  preferredDate: z.string().optional(),
});

export const commissionSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name.').max(120),
  email: z.string().trim().email('Please enter a valid email address.').max(200),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  commissionType: z.enum(['painting', 'ceramics', 'sculpture', 'textile', 'decor', 'other']),
  budgetRange: z.enum(['under_500', '500_1500', '1500_5000', '5000_plus']),
  timeline: z.enum(['flexible', '1_2_months', '3_6_months', '6_plus_months']),
  description: z
    .string()
    .trim()
    .min(40, 'Describe your vision in at least 40 characters so we can respond thoughtfully.')
    .max(5000),
  referenceImages: z.array(z.string().url()).max(5).optional().default([]),
});

export const newsletterSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address.').max(200),
});

export const cartLineSchema = z.object({
  artworkId: z.string().uuid(),
  title: z.string().min(1).max(200),
  unitPriceCents: z.number().int().positive(),
  quantity: z.number().int().min(1).max(10),
  image: z.string().max(500).optional(),
});

export const checkoutSchema = z.object({
  email: z.string().trim().email().max(200),
  name: z.string().trim().min(2).max(120),
  lines: z.array(cartLineSchema).min(1).max(25),
  notes: z.string().max(1000).optional(),
});

export const artworkInputSchema = z.object({
  title: z.string().trim().min(2).max(200),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/, 'Slug may only contain lowercase letters, numbers and hyphens.')
    .min(2)
    .max(200),
  description: z.string().trim().min(10).max(4000),
  story: z.string().trim().max(8000).optional().or(z.literal('')),
  categoryId: z.string().min(1),
  collectionId: z.string().optional().nullable(),
  priceCents: z.number().int().min(0),
  currency: z.string().default('USD'),
  editionType: z.enum(['one_of_one', 'limited', 'open']),
  editionTotal: z.number().int().positive().optional().nullable(),
  stock: z.number().int().min(0),
  status: z.enum(['available', 'reserved', 'sold', 'archived']),
  materials: z.array(z.string().trim().min(1)).max(12),
  width: z.number().positive().optional().nullable(),
  height: z.number().positive().optional().nullable(),
  depth: z.number().positive().optional().nullable(),
  dimensionUnit: z.enum(['cm', 'in']).default('cm'),
  year: z.number().int().min(1900).max(2100),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  imageUrls: z.array(z.string().min(1).max(600)).max(8).default([]),
});

export const journalInputSchema = z.object({
  title: z.string().trim().min(3).max(220),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/)
    .min(2)
    .max(220),
  excerpt: z.string().trim().min(10).max(500),
  content: z.string().trim().min(20),
  coverImage: z.string().max(600).optional().or(z.literal('')),
  tags: z.array(z.string().trim().min(1)).max(10).default([]),
  published: z.boolean().default(false),
});

export const orderStatusSchema = z.enum([
  'pending',
  'paid',
  'preparing',
  'shipped',
  'delivered',
  'cancelled',
]);

export const enquiryStatusSchema = z.enum(['new', 'in_discussion', 'accepted', 'in_progress', 'completed', 'declined']);
export const inquiryStatusSchema = z.enum(['new', 'replied', 'archived']);
