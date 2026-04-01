import type { Root, Text } from "mdast";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { unified } from "unified";
import { visit } from "unist-util-visit";

// biome-ignore lint/suspicious/noExplicitAny: Translator API is not yet typed
export async function translateMarkdownWithAST(markdown: string, translator: any): Promise<string> {
  const tree = unified().use(remarkParse).parse(markdown) as Root;

  // biome-ignore lint/suspicious/noExplicitAny: AST node types are complex
  const nodesToTranslate: Array<{ node: any; textContent: string; inlineCodeMap: Map<string, string> }> = [];
  let placeholderIndex = 0;

  visit(tree, (node) => {
    if (node.type === "paragraph" || node.type === "heading") {
      let textContent = "";
      const inlineCodeMap = new Map<string, string>();

      visit(node, (childNode) => {
        if (childNode.type === "text") {
          textContent += (childNode as Text).value;
        } else if (childNode.type === "inlineCode") {
          const placeholder = `__INLINE_CODE_${placeholderIndex++}__`;
          // biome-ignore lint/suspicious/noExplicitAny: inlineCode node type
          inlineCodeMap.set(placeholder, (childNode as any).value);
          textContent += placeholder;
        }
      });

      if (textContent.trim().length > 0) {
        nodesToTranslate.push({ node, textContent, inlineCodeMap });
      }
    }
  });

  for (const { node, textContent, inlineCodeMap } of nodesToTranslate) {
    try {
      let translated = await translator.translate(textContent);

      for (const [placeholder, code] of Array.from(inlineCodeMap.entries())) {
        const variations = [
          placeholder,
          placeholder.toLowerCase(),
          placeholder.replace(/__/g, "_"),
          placeholder.toLowerCase().replace(/__/g, "_"),
        ];

        for (const variant of variations) {
          if (translated.includes(variant)) {
            translated = translated.replaceAll(variant, `\`${code}\``);
            break;
          }
        }
      }

      const translatedTree = unified().use(remarkParse).parse(translated) as Root;

      if (translatedTree.children.length > 0) {
        const firstChild = translatedTree.children[0];
        if (firstChild.type === "paragraph" || firstChild.type === "heading") {
          // biome-ignore lint/suspicious/noExplicitAny: Replace children
          node.children = (firstChild as any).children;
        }
      }
    } catch (error) {
      console.error("Translation failed for node:", error);
    }
  }

  const result = unified().use(remarkStringify, { bullet: "-", emphasis: "_", strong: "*" }).stringify(tree);

  return result;
}
