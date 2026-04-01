"use client";

import { useEffect, useState } from "react";

const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "ja", label: "日本語" },
  { code: "es", label: "Español" },
];

type Props = {
  content: string;
  lang: string;
  onTranslate: (translatedContent: string | null) => void;
};

export function ChromeAiSidebar({ content, lang, onTranslate }: Props) {
  const [hasTranslator, setHasTranslator] = useState(false);
  const [hasSummarizer, setHasSummarizer] = useState(false);

  const [isTranslating, setIsTranslating] = useState(false);
  const [translateStatus, setTranslateStatus] = useState("");
  const [isTranslated, setIsTranslated] = useState(false);
  const [translateLang, setTranslateLang] = useState("ja");

  const [summary, setSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryStatus, setSummaryStatus] = useState("");
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [summaryLang, setSummaryLang] = useState("ja");

  useEffect(() => {
    if (typeof navigator !== "undefined") {
      const detectedLang = navigator.language.split("-")[0];
      setTranslateLang(detectedLang === lang ? (lang === "ja" ? "en" : "ja") : detectedLang);
      setSummaryLang(detectedLang);
    }
    if ("Translator" in self) {
      setHasTranslator(true);
    }
    if ("Summarizer" in self) {
      setHasSummarizer(true);
    }
  }, [lang]);

  const handleTranslate = async () => {
    if (isTranslated) {
      setIsTranslated(false);
      setTranslateStatus("");
      onTranslate(null);
      return;
    }

    setIsTranslating(true);
    setTranslateStatus("Translating...");

    try {
      // biome-ignore lint/suspicious/noExplicitAny: Translator API is not yet typed
      const availability = await (self as any).Translator.availability({
        sourceLanguage: lang,
        targetLanguage: translateLang,
      });

      if (availability === "unavailable") {
        setTranslateStatus(`${lang} → ${translateLang} is not supported`);
        setIsTranslating(false);
        return;
      }

      if (availability === "downloadable") {
        setTranslateStatus("Downloading model...");
      }

      // biome-ignore lint/suspicious/noExplicitAny: Translator API is not yet typed
      const translator = await (self as any).Translator.create({
        sourceLanguage: lang,
        targetLanguage: translateLang,
        // biome-ignore lint/suspicious/noExplicitAny: Translator API is not yet typed
        monitor(m: any) {
          // biome-ignore lint/suspicious/noExplicitAny: Translator API is not yet typed
          m.addEventListener("downloadprogress", (e: any) => {
            const progress = Math.round((e.loaded / e.total) * 100);
            setTranslateStatus(`Downloading: ${progress}%`);
          });
        },
      });

      setTranslateStatus("Translating...");
      // Use dynamic import to avoid bundling AST utils in the sidebar
      const { translateMarkdownWithAST } = await import("./translateMarkdown");
      const translated = await translateMarkdownWithAST(content, translator);
      onTranslate(translated);
      setIsTranslated(true);
      setTranslateStatus("");
    } catch (error) {
      setTranslateStatus(`Error: ${error}`);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSummarize = async () => {
    if (isSummaryOpen && summary) {
      setIsSummaryOpen(false);
      return;
    }

    if (summary) {
      setIsSummaryOpen(true);
      return;
    }

    setIsSummarizing(true);
    setSummaryStatus("Summarizing...");
    setIsSummaryOpen(true);

    try {
      // biome-ignore lint/suspicious/noExplicitAny: Summarizer API is not yet typed
      const summarizer = await (self as any).Summarizer.create({
        type: "key-points",
        length: "medium",
        format: "markdown",
        outputLanguage: summaryLang,
        // biome-ignore lint/suspicious/noExplicitAny: Summarizer API is not yet typed
        monitor(m: any) {
          // biome-ignore lint/suspicious/noExplicitAny: Summarizer API is not yet typed
          m.addEventListener("downloadprogress", (e: any) => {
            const progress = Math.round((e.loaded / e.total) * 100);
            setSummaryStatus(`Downloading: ${progress}%`);
          });
        },
      });

      setSummaryStatus("Summarizing...");
      const result = await summarizer.summarize(content);
      setSummary(result);
      setSummaryStatus("");
    } catch (error) {
      setSummaryStatus(`Error: ${error}`);
    } finally {
      setIsSummarizing(false);
    }
  };

  if (!hasTranslator && !hasSummarizer) {
    return null;
  }

  return (
    <nav
      aria-label="Chrome AI"
      className="hidden xl:block sticky top-24 self-start w-48 shrink-0 rounded-lg p-3 mr-3"
      style={{ backgroundColor: "#F1F1F1" }}
    >
      <h2 className="text-base font-bold text-gray-800 mb-4">Chrome AI</h2>

      {hasTranslator && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <button
              type="button"
              onClick={handleTranslate}
              disabled={isTranslating}
              className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 text-xs"
            >
              {isTranslated ? "Show Original" : "Translate"}
            </button>
            <select
              value={translateLang}
              onChange={(e) => {
                setTranslateLang(e.target.value);
                setIsTranslated(false);
                onTranslate(null);
              }}
              className="text-xs border border-gray-300 rounded px-1.5 py-1.5"
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
          {translateStatus && <p className="text-xs text-gray-500">{translateStatus}</p>}
        </div>
      )}

      {hasSummarizer && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <button
              type="button"
              onClick={handleSummarize}
              disabled={isSummarizing}
              className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 text-xs"
            >
              {isSummarizing ? "Summarizing..." : isSummaryOpen ? "Hide Summary" : "Summarize"}
            </button>
          </div>
          {summaryStatus && <p className="text-xs text-gray-500 mb-2">{summaryStatus}</p>}
          {isSummaryOpen && summary && (
            <div className="text-xs text-gray-700 leading-relaxed" style={{ whiteSpace: "pre-wrap" }}>
              {summary}
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
