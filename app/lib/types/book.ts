export interface Book {
  id: number;

  slug: string;

  title: string;

  subtitle: string | null;

  author: string;

  publisher: string | null;

  language: string;

  pages: number | null;

  description: string | null;

  price: number;

  discount_price: number | null;

  cover_image: string | null;

  sample_pdf: string | null;

  full_pdf: string | null;

  featured: boolean;

  published: boolean;

  created_at?: Date;

  updated_at?: Date;
}
