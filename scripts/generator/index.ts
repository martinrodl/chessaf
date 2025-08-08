import fs from "node:fs";
import path from "node:path";

// Input shape interface
interface GeneratorInput {
  siteId: string;
  locale: string;
  title: string;
  topic?: string;
  affiliate?: { chesscom?: string };
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

async function main() {
  // Accept: --input=path OR stdin JSON OR env GENERATOR_JSON
  const argInput = process.argv
    .find((a) => a.startsWith("--input="))
    ?.split("=")[1];
  let dataRaw: string | undefined;
  if (argInput) dataRaw = fs.readFileSync(argInput, "utf8");
  else if (process.env.GENERATOR_JSON) dataRaw = process.env.GENERATOR_JSON;
  else {
    // read stdin if piped
    if (!process.stdin.isTTY) {
      dataRaw = await new Promise<string>((resolve) => {
        let buf = "";
        process.stdin.setEncoding("utf8");
        process.stdin.on("data", (c) => (buf += c));
        process.stdin.on("end", () => resolve(buf));
      });
    }
  }
  if (!dataRaw) {
    console.error("No input JSON provided");
    process.exit(1);
  }

  let input: GeneratorInput;
  try {
    input = JSON.parse(dataRaw);
  } catch (e) {
    console.error("Invalid JSON", e);
    process.exit(1);
    return;
  }

  const { siteId, locale, title } = input;
  if (!siteId || !locale || !title) {
    console.error("Missing required fields siteId, locale, title");
    process.exit(1);
  }

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");

  const baseSlug = slugify(title) || `${yyyy}-${mm}-${dd}`;
  const datedPath = `${yyyy}/${mm}`;
  const relDir = path.join("content", siteId, locale, "blog", datedPath);
  const absDir = path.join(process.cwd(), relDir);
  fs.mkdirSync(absDir, { recursive: true });

  let finalSlug = baseSlug;
  let counter = 1;
  while (fs.existsSync(path.join(absDir, `${finalSlug}.mdx`))) {
    finalSlug = `${baseSlug}-${counter++}`;
  }

  const frontMatter = {
    title,
    description: input.topic?.slice(0, 200) || "",
    publishedAt: `${yyyy}-${mm}-${dd}`,
    affiliate: input.affiliate || {},
  };

  const mdxBody = `---\n${Object.entries(frontMatter)
    .map(([k, v]) => {
      if (typeof v === "object" && v)
        return `${k}:\n${Object.entries(v)
          .map(([sk, sv]) => `  ${sk}: "${sv}"`)
          .join("\n")}`;
      return `${k}: "${String(v).replace(/"/g, '\\"')}"`;
    })
    .join("\n")}\n---\n\n<CTA href="${
    frontMatter.affiliate?.chesscom || "#"
  }">Trénuj na Chess.com</CTA>\n\n## Úvod\n${
    input.topic || "Krátký úvod."
  }\n\n<Tip>První tip – zaměř se na centrum.</Tip>\n\n## Další sekce\nObsah vygenerovaný placeholderem.\n`;

  const absFile = path.join(absDir, `${finalSlug}.mdx`);
  fs.writeFileSync(absFile, mdxBody, "utf8");
  console.log("Written", absFile);

  // Call revalidate endpoint
  const siteUrl = process.env.SITE_URL || "http://localhost:3000";
  const token = process.env.REVALIDATE_SECRET;
  if (!token) {
    console.warn("REVALIDATE_SECRET not set, skipping revalidate call");
    return;
  }
  const slugPath = `${yyyy}/${mm}/${finalSlug}`;
  const res = await fetch(`${siteUrl}/api/revalidate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-revalidate-token": token,
    },
    body: JSON.stringify({ siteId, locale, slug: slugPath }),
  });
  console.log("Revalidate status", res.status);
  try {
    console.log(await res.json());
  } catch {}
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
