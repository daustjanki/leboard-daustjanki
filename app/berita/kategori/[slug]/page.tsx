import { CategoryPage } from "@/components/pages/CategoryPage";
import { getTopCategorySlugs } from "@/lib/firebase/serverFetch";

// Phase D: ISR — revalidate category pages every 10 minutes.
export const revalidate = 600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const rows = await getTopCategorySlugs(30);
  return rows.map((r) => ({ slug: r.slug }));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!slug) return null;
  return <CategoryPage slug={slug} />;
}
