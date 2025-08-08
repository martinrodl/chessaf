import { getArticle } from "@/lib/content";
import CTA from "@/components/CTA";
import Tip from "@/components/Tip";
import { MDXRemote } from "next-mdx-remote/rsc";

export const revalidate = 86400;

const components = { CTA, Tip };

export default function ArticleCatchAll({ params }: { params: { siteId: string; locale: string; slug: string[] } }) {
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
