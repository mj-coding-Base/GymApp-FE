// next.d.ts
export interface PageProps {
  params: Record<string, string | string[]>
  searchParams?: Record<string, string | string[]>
}
