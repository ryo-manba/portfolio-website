import GithubSlugger from "github-slugger";

export type TocItem = {
  id: string;
  text: string;
  level: number;
};

export function extractHeadings(content: string): TocItem[] {
  const headingRegex = /^(#{2,4})\s+(.+)$/gm;
  const headings: TocItem[] = [];
  const slugger = new GithubSlugger();

  for (const match of content.matchAll(headingRegex)) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = slugger.slug(text);
    headings.push({ id, text, level });
  }

  return headings;
}
