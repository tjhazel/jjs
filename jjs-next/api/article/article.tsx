export interface ArticleSummary {
  id: number | string;
  title: string;
  date: string; // ISO string or date-like
  excerpt: string;
  href: string;
  imageSrc?: string;
}