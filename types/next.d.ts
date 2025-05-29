export interface PageProps {
  params: {
    slug: string; // or any route param used
  };
  searchParams?: Record<string, string | string[]>;
}
