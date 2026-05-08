// Server-side helpers for RSC: fetch lightweight slug lists for
// generateStaticParams. Uses the Firebase Web SDK (already wired) — no
// Admin SDK needed because public reads are rule-gated.

import { getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { blogPostsCol } from "./collections";
import { slugifyCategory } from "@/lib/utils/categorySlug";

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

import { studentsCol, goalsCol, categoriesCol, groupsCol } from "./collections";
import {
  mapStudentRow,
  mapGoalRow,
  mapCategoryRow,
  mapGroupRow,
} from "./mappers";
import type { Student, MasterGoal, Category, Group } from "@/types";

/**
 * Bundle for leaderboard / student RSC routes. Single round-trip on the
 * server, then handed to a thin client island as props.
 */
export interface LeaderboardBundle {
  students: Student[];
  masterGoals: MasterGoal[];
  categories: Category[];
  groups: Group[];
}

export async function getLeaderboardBundle(): Promise<LeaderboardBundle> {
  try {
    const [sSnap, gSnap, cSnap, grSnap] = await Promise.all([
      getDocs(studentsCol),
      getDocs(goalsCol),
      getDocs(categoriesCol),
      getDocs(groupsCol),
    ]);
    return {
      students: sSnap.docs.map((d: any) => mapStudentRow({ id: d.id, ...d.data() })),
      masterGoals: gSnap.docs.map((d: any) => mapGoalRow({ id: d.id, ...d.data() })),
      categories: cSnap.docs.map((d: any) => mapCategoryRow({ id: d.id, ...d.data() })),
      groups: grSnap.docs.map((d: any) => mapGroupRow({ id: d.id, ...d.data() })),
    };
  } catch {
    return { students: [], masterGoals: [], categories: [], groups: [] };
  }
}

/** Top-N student ids by total_points for `generateStaticParams`. */
export async function getTopStudentIds(n = 30): Promise<{ id: string }[]> {
  try {
    const q = query(studentsCol, orderBy("total_points", "desc"), limit(n));
    const snap = await getDocs(q);
    return snap.docs.map((d: any) => ({ id: d.id }));
  } catch {
    return [];
  }
}
