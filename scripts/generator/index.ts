import fs from "node:fs";
import path from "node:path";
import { buildMCP } from "./mcp";
import { generateFromMCP } from "./llm";
import { slugify, dateParts, ensureDir, hmacSignature } from "./utils";

// Input shape interface
interface GeneratorInput {
  siteId: string;
  locale: string;
  title: string;
  topic?: string;
  affiliate?: { chesscom?: string };
}

async function main() {
  const topics = await readTopics();
  const indexArg = process.argv.find((a) => a.startsWith("--i="))?.split("=")[1];
  const idx = indexArg ? parseInt(indexArg, 10) : 0;
  const topic = topics[idx];
  if (!topic) {
    console.error("No topic at index", idx);
    process.exit(1);
  }
  const envSite = process.env.GEN_DEFAULT_SITEID;
  const envLocale = process.env.GEN_DEFAULT_LOCALE;
  const siteId = envSite || topic.siteId || "default";
  const locale = envLocale || topic.locale || "en";
  console.log(
    `[topic] ${idx} -> title="${topic.title}" site=${siteId} locale=${locale}`
  );

  const mcp = buildMCP({
    siteId,
    locale,
    title: topic.title,
    keywords: topic.keywords || [],
  });
  const { markdown } = await generateFromMCP(mcp);

  const fm = extractFrontMatter(markdown);
  const title = (fm.title as string) || topic.title;
  let baseSlug = fm.slug ? String(fm.slug) : slugify(title);
  if (!baseSlug) baseSlug = slugify(topic.title) || "clanek";

  const { y, m } = dateParts();
  const relDir = path.join("content", siteId, locale, "blog", y, m);
  const absDir = path.join(process.cwd(), relDir);
  await ensureDir(absDir);

  let finalSlug = baseSlug;
  let counter = 1;
  while (fs.existsSync(path.join(absDir, `${finalSlug}.mdx`))) {
    finalSlug = `${baseSlug}-${counter++}`;
  }
  const absFile = path.join(absDir, `${finalSlug}.mdx`);
  fs.writeFileSync(absFile, markdown, "utf8");
  console.log(`[write] ${absFile}`);

  // Git commit
  try {
    const relFile = path.relative(process.cwd(), absFile);
    const { execSync } = await import("node:child_process");
    execSync(`git add ${JSON.stringify(relFile)}`);
    execSync(
      `git commit -m ${JSON.stringify(`content: ${locale}/${finalSlug}`)}`,
      { stdio: "inherit" }
    );
    console.log("[git] committed");
  } catch (e) {
    console.warn("[git] commit failed (continuing)", (e as any)?.message);
  }

  // Revalidate
  const bodyObj = { siteId, locale, slug: `${y}/${m}/${finalSlug}` };
  const body = JSON.stringify(bodyObj);
  const secret = process.env.REVALIDATE_SECRET;
  const siteUrl = process.env.SITE_URL || "http://localhost:3000";
  let revalidated = false;
  if (secret) {
    try {
      const sig = hmacSignature(secret, body);
      const res = await fetch(`${siteUrl}/api/revalidate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-revalidate-token": secret,
          "x-signature": sig,
        },
        body,
      });
      const js = await res.json().catch(() => ({}));
      revalidated = res.ok && js.ok;
      console.log(`[revalidate] status=${res.status} ok=${revalidated}`);
    } catch (e) {
      console.warn("[revalidate] failed", (e as any)?.message);
    }
  } else {
    console.warn("[revalidate] missing REVALIDATE_SECRET");
  }

  console.log(
    `[done] slug=${finalSlug} path=${bodyObj.slug} revalidated=${revalidated}`
  );
}

function extractFrontMatter(markdown: string): Record<string, any> {
  const m = markdown.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return {};
  const lines = m[1].split(/\n/);
  const fm: Record<string, any> = {};
  let currentKey: string | null = null;
  for (const line of lines) {
    if (!line.trim()) continue;
    if (/^[A-Za-z0-9_-]+:/.test(line)) {
      const [k, ...rest] = line.split(":");
      const vRaw = rest.join(":").trim();
      if (vRaw === "") {
        currentKey = k;
        fm[k] = {};
        continue;
      }
      fm[k] = vRaw.replace(/^"|"$/g, "").replace(/^'/, "").replace(/'$/, "");
      currentKey = k;
    } else if (currentKey && line.startsWith("  ")) {
      // nested (simple key: value)
      const nested = line.trim();
      const [nk, ...nrest] = nested.split(":");
      if (typeof fm[currentKey] !== "object" || fm[currentKey] === null)
        fm[currentKey] = {};
      (fm[currentKey] as any)[nk] = nrest.join(":").trim().replace(/^"|"$/g, "");
    }
  }
  return fm;
}

async function readTopics(): Promise<Topic[]> {
  const p = path.join(
    process.cwd(),
    "scripts",
    "generator",
    "topics.json"
  );
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
