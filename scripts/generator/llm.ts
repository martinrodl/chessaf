export async function generateFromMCP(mcpJson: string): Promise<{ markdown: string }> {
  // Placeholder implementation – ignores MCP and returns static-ish MDX
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');

  const mdx = `---\ntitle: "Dočasný generovaný článek"\ndescription: "Placeholder obsah – nahraď voláním LLM."\npublishedAt: "${yyyy}-${mm}-${dd}"\naffiliate:\n  chesscom: "https://www.chess.com/register?ref_id=TVUJ_KOD"\nkeywords: ["placeholder","šachy"]\n---\n\n<CTA href="https://www.chess.com/register?ref_id=TVUJ_KOD">Trénuj na Chess.com</CTA>\n\n## Úvod\nTento obsah je pouze dočasný. MCP JSON délka: ${mcpJson.length} znaků.\n\n<Tip>Příklad tipu – nahraď reálnými radami.</Tip>\n\n## Sekce 1\nStručný text sekce.\n\n## Sekce 2\nDalší odstavec.\n\n## Závěr\nShrnutí a výzva k tréninku.\n`;

  return { markdown: mdx };
}
