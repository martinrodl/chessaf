export interface MCPInput {
  siteId: string;
  locale: string;
  title: string;
  keywords: string[];
}

/**
 * Build an MCP (Model Context Protocol) JSON payload describing the article to generate.
 * Currently focuses on producing a single Markdown (MDX-friendly) article with front-matter.
 */
export function buildMCP(input: MCPInput): string {
  const { siteId, locale, title, keywords } = input;

  const mcp = {
    version: "1.0",
    task: {
      type: "content_generation",
      language: locale,
      siteId,
      specification: {
        article: {
          title,
          format: "mdx",
          frontMatter: {
            required: [
              "title",
              "description",
              "publishedAt",
              "affiliate",
              "keywords"
            ]
          },
          constraints: {
            wordCount: { min: 900, max: 1400 },
            seo: { keywords, primaryKeyword: keywords[0] || title }
          },
          audience: "začátečníci",
          brand: {
            voice: "stručné, přátelské",
            pov: "2nd person plural / friendly instructional"
          },
          structure: [
            "Úvod (hook, proč číst)",
            "Základní princip / koncept",
            "Kroky nebo sekce s konkrétními radami",
            "Časté chyby a jak se jim vyhnout",
            "Mini cvičení / actionable steps",
            "Shrnutí a CTA (výzva k tréninku)"
          ],
          mdxComponents: ["CTA", "Tip"],
          affiliate: {
            placeholders: [
              {
                name: "chesscom",
                example: "https://www.chess.com/register?ref_id=TVUJ_KOD"
              }
            ]
          },
          output: {
            type: "markdown_with_frontmatter",
            details: {
              includeTOC: false,
              codeBlocks: false,
              headingLevels: { min: 2, max: 3 }
            }
          }
        }
      }
    },
    instructions: [
      "Použij český jazyk (pokud není řečeno jinak).",
      "Nepřekračuj limit slov, ale raději ~5% pod horní hranicí.",
      "Klíčová slova přirozeně rozprostři, nepřeoptimalizuj.",
      "Front-matter: title, description (1 věta hook), publishedAt (YYYY-MM-DD), affiliate.chesscom (placeholder), keywords (pole).",
      "Použij <CTA> pro hlavní call-to-action na Chess.com jednou v článku (ideálně po úvodu).",
      "Tipy zvýrazni komponentou <Tip> (krátké).",
      "Nepřidávej závěrečné sekce typu 'FAQ' pokud nejsou nutné.",
      "Nevkládej žádné jiné formáty výstupu než jediný markdown s front-matter blokem."
    ],
    expectedOutput: {
      description: "MDX markdown string with YAML front-matter only.",
      format: "text/mdx"
    }
  };

  return JSON.stringify(mcp, null, 2);
}
