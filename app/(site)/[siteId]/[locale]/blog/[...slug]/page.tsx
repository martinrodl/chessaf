import { getArticle } from "@/lib/content";
import CTA from "@/components/CTA";
import Tip from "@/components/Tip";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { Metadata } from 'next';

export const revalidate = 86400;

const components = { CTA, Tip };

export async function generateMetadata({ params }: { params: { siteId: string; locale: string; slug: string[] } }): Promise<Metadata> {
  const slugPath = params.slug.join('/');
  const art = getArticle(params.siteId, params.locale, slugPath);
  if (!art) return { title: 'Not found' };
  const baseUrl = process.env.SITE_URL || 'http://localhost:3000';
  const og = art.ogImage || `${baseUrl}/og?title=${encodeURIComponent(art.title)}&subtitle=${encodeURIComponent(art.description || '')}`;
  return {
    title: art.title,
    description: art.description,
    openGraph: {
      title: art.title,
      description: art.description || undefined,
      images: [og]
    },
    twitter: {
      card: 'summary_large_image',
      title: art.title,
      description: art.description || undefined,
      images: [og]
    }
  };
}

export default function ArticleCatchAll({
  params,
}: {
  params: { siteId: string; locale: string; slug: string[] };
}) {
  const slugPath = params.slug.join("/");
  const art = getArticle(params.siteId, params.locale, slugPath);
  if (!art) return <div>Not found</div>;
  return (
    <article className="p-6">
      <h1>{art.title}</h1>
      <MDXRemote source={art.body!} components={components} />
    </article>
  );
}
