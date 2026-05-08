// Server-side helpers for RSC: fetch lightweight slug lists for
// generateStaticParams. Uses the Firebase Web SDK (already wired) — no
// Admin SDK needed because public reads are rule-gated.

import { getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { blogPostsCol } from "./collections";
import { slugifyCategory } from "@/lib/categorySlug";

export interface SlugRow {
  slug: string;
}

/**
 * Top-N most recently published blog post slugs for ISR pre-render.
 * Falls back to empty list on failure (Next will still render on demand).
 */
export async function getTopBlogSlugs(n = 30): Promise<SlugRow[]> {
  try {
    const q = query(
      blogPostsCol,
      where("status", "==", "published"),
      orderBy("created_at", "desc"),
      limit(n),
    );
    const snap = await getDocs(q);
    const out: SlugRow[] = [];
    for (const d of snap.docs) {
      const data: any = d.data();
      const slug = (data.slug || d.id || "").toString();
      if (slug) out.push({ slug });
    }
    return out;
  } catch {
    return [];
  }
}

/**
 * Top-N category slugs derived from published posts.
 */
export async function getTopCategorySlugs(n = 30): Promise<SlugRow[]> {
  try {
    const q = query(
      blogPostsCol,
      where("status", "==", "published"),
      orderBy("created_at", "desc"),
      limit(200),
    );
    const snap = await getDocs(q);
    const counts = new Map<string, number>();
    for (const d of snap.docs) {
      const data: any = d.data();
      const cat = (data.category || "").toString().trim();
      if (!cat) continue;
      const slug = slugifyCategory(cat);
      counts.set(slug, (counts.get(slug) || 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([slug]) => ({ slug }));
  } catch {
    return [];
  }
}
