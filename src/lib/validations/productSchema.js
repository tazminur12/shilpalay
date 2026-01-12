import { z } from 'zod';

export const variationSchema = z.object({
  color: z.string().min(1, 'Color is required'),
  colorCode: z.string().optional(),
  size: z.string().min(1, 'Size is required'),
  material: z.string().optional(),
  stock: z.number().min(0, 'Stock must be 0 or greater'),
  priceOverride: z.number().min(0).optional().nullable(),
  sku: z.string().min(1, 'Variation SKU is required'),
});

export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200, 'Name too long'),
  slug: z.string().optional(),
  sku: z.string().min(1, 'SKU is required').max(50, 'SKU too long'),
  category: z.string().min(1, 'Category is required'),
  subCategory: z.string().optional().nullable(),
  childCategory: z.string().optional().nullable(),
  collection: z.string().optional(),
  brand: z.string().optional(),
  price: z.object({
    regularPrice: z.number().min(0, 'Regular price must be 0 or greater'),
    salePrice: z.number().min(0).optional().nullable(),
    discountType: z.enum(['flat', 'percent']).optional(),
  }),
  variations: z.array(variationSchema).optional(),
  inventory: z.object({
    totalStock: z.number().min(0).optional(),
    lowStockAlert: z.number().min(0).optional(),
    availability: z.enum(['in_stock', 'out_of_stock', 'preorder']).optional(),
  }).optional(),
  images: z.object({
    thumbnail: z.string().min(1, 'Thumbnail image is required'),
    gallery: z.array(z.string()).optional(),
    video: z.string().optional(),
  }),
  description: z.object({
    shortDescription: z.string().optional(),
    fullDescription: z.string().optional(),
    fabric: z.string().optional(),
    workType: z.string().optional(),
    fit: z.string().optional(),
    washCare: z.string().optional(),
    origin: z.string().optional(),
  }).optional(),
  shipping: z.object({
    weight: z.number().min(0).optional(),
    shippingClass: z.string().optional(),
    estimatedDelivery: z.number().min(1).optional(),
  }).optional(),
  seo: z.object({
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    keywords: z.array(z.string()).optional(),
  }).optional(),
  tags: z.array(z.enum(['Eid', 'New', 'Limited Edition', 'Sale', 'Featured'])).optional(),
  flags: z.object({
    featured: z.boolean().optional(),
    showOnHomepage: z.boolean().optional(),
    trending: z.boolean().optional(),
    recommended: z.boolean().optional(),
    whatsNew: z.boolean().optional(),
  }).optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
});
