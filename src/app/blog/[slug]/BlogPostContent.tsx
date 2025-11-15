"use client";

import { useState, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type React from "react";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { visit } from "unist-util-visit";
import type { Root, Text } from "mdast";

const markdownComponents = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h1 className="text-4xl font-bold mt-8 mb-4" {...props} />,
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h2 className="text-3xl font-bold mt-6 mb-3" {...props} />,
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h3 className="text-2xl font-bold mt-4 mb-2" {...props} />,
  h4: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h4 className="text-xl font-bold mt-3 mb-2" {...props} />,
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => <p className="my-4 leading-relaxed" {...props} />,
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => <ul className="list-disc list-inside my-4 space-y-2" {...props} />,
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => <ol className="list-decimal list-inside my-4 space-y-2" {...props} />,
  li: (props: React.HTMLAttributes<HTMLLIElement>) => <li className="ml-4" {...props} />,
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a className="text-blue-600 hover:text-blue-800 underline" {...props} />,
  blockquote: (props: React.BlockquoteHTMLAttributes<HTMLQuoteElement>) => (
    <blockquote className="border-l-4 border-gray-300 pl-4 my-4 italic" {...props} />
  ),
  code: (props: React.HTMLAttributes<HTMLElement>) => {
    const { children, className, ...rest } = props;
    const match = /language-(\w+)/.exec(className || "");
    return match ? (
      <code className={className} {...rest}>
        {children}
      </code>
    ) : (
      <code className="bg-gray-100 px-1 py-0.5 rounded text-sm text-gray-800" {...rest}>
        {children}
      </code>
    );
  },
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4" {...props} />
  ),
  img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img className="max-w-full h-auto my-4 rounded-lg" {...props} alt={props.alt || ""} />
  ),
  hr: (props: React.HTMLAttributes<HTMLHRElement>) => <hr className="my-8 border-t border-gray-300" {...props} />,
  table: (props: React.TableHTMLAttributes<HTMLTableElement>) => (
    <div className="overflow-x-auto my-4">
      <table className="min-w-full divide-y divide-gray-200" {...props} />
    </div>
  ),
  th: (props: React.ThHTMLAttributes<HTMLTableHeaderCellElement>) => (
    <th className="px-4 py-2 bg-gray-100 text-left font-semibold" {...props} />
  ),
  td: (props: React.TdHTMLAttributes<HTMLTableDataCellElement>) => <td className="px-4 py-2 border-t" {...props} />,
  strong: (props: React.HTMLAttributes<HTMLElement>) => <strong className="font-bold" {...props} />,
};

type Props = {
  children: ReactNode;
  content: string;
  lang?: string;
};

// biome-ignore lint/suspicious/noExplicitAny: Translator API is not yet typed
async function translateMarkdownWithAST(markdown: string, translator: any): Promise<string> {
  // Parse Markdown to AST
  const tree = unified().use(remarkParse).parse(markdown) as Root;

  // Collect nodes to translate
  // biome-ignore lint/suspicious/noExplicitAny: AST node types are complex
  const nodesToTranslate: Array<{ node: any; textContent: string; inlineCodeMap: Map<string, string> }> = [];
  let placeholderIndex = 0;

  visit(tree, (node) => {
    // Translate paragraph and heading nodes
    if (node.type === "paragraph" || node.type === "heading") {
      // Extract text with placeholders for inline code
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

  // Translate each node
  for (const { node, textContent, inlineCodeMap } of nodesToTranslate) {
    try {
      // Translate the text with placeholders
      let translated = await translator.translate(textContent);

      // Restore inline code placeholders with case-insensitive replacement
      for (const [placeholder, code] of Array.from(inlineCodeMap.entries())) {
        // Try different variations of the placeholder
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

      // Replace the node's children with translated text
      // Parse the translated text back to maintain structure
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

  // Convert AST back to Markdown
  const result = unified().use(remarkStringify, { bullet: "-", emphasis: "_", strong: "*" }).stringify(tree);

  return result;
}

export function BlogPostContent({ children, content, lang = "en" }: Props) {
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [status, setStatus] = useState("");
  const [isTranslated, setIsTranslated] = useState(false);

  const detectBrowserLanguage = () => {
    const browserLang = navigator.language.split("-")[0]; // "en-US" -> "en"
    return browserLang;
  };

  const browserLang = detectBrowserLanguage();
  const needsTranslation = lang !== browserLang;

  const handleTranslate = async () => {
    if (isTranslated) {
      // Toggle back to original
      setIsTranslated(false);
      setStatus("");
      return;
    }

    if (!("Translator" in self)) {
      setStatus("Translation API is not supported in this browser");
      return;
    }

    setIsTranslating(true);
    setStatus("Checking availability...");

    try {
      // Check availability first
      // biome-ignore lint/suspicious/noExplicitAny: Translator API is not yet typed
      const availability = await (self as any).Translator.availability({
        sourceLanguage: lang,
        targetLanguage: browserLang,
      });

      if (availability === "unavailable") {
        setStatus(`Translation from ${lang} to ${browserLang} is not supported`);
        setIsTranslating(false);
        return;
      }

      if (availability === "downloadable") {
        setStatus("Model needs to be downloaded. Starting download...");
      } else if (availability === "downloading") {
        setStatus("Model is currently downloading...");
      } else if (availability === "available") {
        setStatus("Starting translation...");
      }

      // biome-ignore lint/suspicious/noExplicitAny: Translator API is not yet typed
      const translator = await (self as any).Translator.create({
        sourceLanguage: lang,
        targetLanguage: browserLang,
        // biome-ignore lint/suspicious/noExplicitAny: Translator API is not yet typed
        monitor(m: any) {
          // biome-ignore lint/suspicious/noExplicitAny: Translator API is not yet typed
          m.addEventListener("downloadprogress", (e: any) => {
            const progress = Math.round((e.loaded / e.total) * 100);
            setStatus(`Downloading model: ${progress}%`);
          });
        },
      });

      setStatus("Translating markdown...");
      const translated = await translateMarkdownWithAST(content, translator);
      setTranslatedContent(translated);
      setIsTranslated(true);
      setStatus(`Translated to ${browserLang}`);
    } catch (error) {
      setStatus(`Error: ${error}`);
    } finally {
      setIsTranslating(false);
    }
  };

  if (!needsTranslation) {
    return <div className="max-w-none">{children}</div>;
  }

  return (
    <>
      <div className="mb-6 flex items-center gap-4">
        <button
          type="button"
          onClick={handleTranslate}
          disabled={isTranslating}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isTranslated ? "Show Original" : "Translate to Browser Language"}
        </button>
        {status && <span className="text-sm text-gray-600">{status}</span>}
      </div>
      {isTranslated && translatedContent ? (
        <div className="max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
          >
            {translatedContent}
          </ReactMarkdown>
        </div>
      ) : (
        <div className="max-w-none">{children}</div>
      )}
    </>
  );
}
