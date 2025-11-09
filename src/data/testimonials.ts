export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company?: string;
  rating: number;
  content: string;
  avatar?: string;
  type: 'text' | 'video' | 'image';
  video_url?: string;
  image_url?: string;
  product_slug: string;
  date: string;
  verified: boolean;
  created_at?: string;
  testimonial_content_photo_url?: string;
  testimonial_content_photo_path?: string;
  customer_photo_url?: string;
  customer_photo_path?: string;
}

export interface ProductTestimonials {
  [key: string]: Testimonial[];
}

export const productTestimonials: ProductTestimonials = {
  // All testimonials now come from the database
};
