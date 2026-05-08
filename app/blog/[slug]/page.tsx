import { Metadata } from 'next';
import { BlogPostPage } from '@/components/pages/BlogPostPage';
import { getTopBlogSlugs } from '@/lib/firebase/serverFetch';

// Phase D: ISR — revalidate blog posts every 10 minutes.
export const revalidate = 600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const rows = await getTopBlogSlugs(30);
  return rows.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Blog Post`,
    description: `Read our latest insights`,
    openGraph: { type: 'article' },
    twitter: { card: 'summary_large_image' },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!slug) return null;
  return <BlogPostPage slug={slug} />;
}
