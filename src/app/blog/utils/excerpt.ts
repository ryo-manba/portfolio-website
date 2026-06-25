import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { unified } from "unified";
import { SKIP, visit } from "unist-util-visit";

const DEFAULT_MAX_LENGTH = 120;

export function excerpt(markdown: string, maxLength = DEFAULT_MAX_LENGTH): string {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown);

  const blocks: { isHeading: boolean; text: string }[] = [];
  for (const node of tree.children) {
    if (node.type === "code" || node.type === "html") {
      continue;
    }

    const parts: string[] = [];
    visit(node, (inner) => {
      if (inner.type === "code" || inner.type === "html") {
        return SKIP;
      }
      if (inner.type === "text" || inner.type === "inlineCode") {
        parts.push(inner.value);
      }
    });

    const blockText = parts.join("").replace(/\s+/g, " ").trim();
    if (blockText) {
      blocks.push({ isHeading: node.type === "heading", text: blockText });
    }
  }

  let text = "";
  blocks.forEach((block, index) => {
    if (index > 0) {
      text += block.isHeading || blocks[index - 1].isHeading ? "　" : " ";
    }
    text += block.text;
  });

  return text.length > maxLength ? `${text.slice(0, maxLength).trimEnd()}…` : text;
}
