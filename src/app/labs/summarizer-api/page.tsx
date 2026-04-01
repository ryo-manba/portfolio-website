"use client";

import { useState, useEffect } from "react";
import { PageTitle } from "@/components/PageTitle";

const SAMPLE_TEXT = `# Summarizer API

## Overview

The Summarizer API is a built-in browser AI feature that allows developers to generate summaries of text content **directly on-device**. Unlike cloud-based solutions, it runs entirely in the browser using a local language model.

## Key Features

- **Privacy**: No data is sent to external servers
- **No API keys**: Works without any server infrastructure
- **Multiple summary types**: Key points, TL;DR, teaser, and headline
- **Output control**: Adjustable length (short, medium, long) and format (plain text, markdown)
- **Streaming**: Real-time summary generation via streaming interface
- **Capability detection**: Graceful handling for unsupported browsers

## Model Management

When the required model is not yet available locally, the API handles downloading it transparently. Developers can monitor download progress through event listeners.`;

export default function SummarizerAPIDemo() {
  const [sourceText, setSourceText] = useState(SAMPLE_TEXT);
  const [summary, setSummary] = useState("");
  const [status, setStatus] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [summaryType, setSummaryType] = useState("key-points");
  const [summaryLength, setSummaryLength] = useState("medium");
  const [summaryFormat, setSummaryFormat] = useState("markdown");
  const [outputLanguage, setOutputLanguage] = useState("ja");
  const [inputLanguage, setInputLanguage] = useState("en");

  useEffect(() => {
    if ("Summarizer" in self) {
      setStatus("✅ Summarizer API is supported");
    } else {
      setStatus("❌ Summarizer API is not supported in this browser");
    }
  }, []);

  const checkCapabilities = async () => {
    try {
      // biome-ignore lint/suspicious/noExplicitAny: Summarizer API is not yet typed
      const availability = await (self as any).Summarizer.availability();
      setStatus(`Availability: ${availability}`);
    } catch (error) {
      setStatus(`❌ Error: ${error}`);
    }
  };

  const handleSummarize = async () => {
    if (!sourceText.trim()) {
      setStatus("Please enter text to summarize");
      return;
    }

    setIsSummarizing(true);
    setSummary("");
    setDownloadProgress(0);

    try {
      // biome-ignore lint/suspicious/noExplicitAny: Summarizer API is not yet typed
      const summarizer = await (self as any).Summarizer.create({
        type: summaryType,
        length: summaryLength,
        format: summaryFormat,
        expectedInputLanguages: [inputLanguage],
        outputLanguage,
        // biome-ignore lint/suspicious/noExplicitAny: Summarizer API is not yet typed
        monitor(m: any) {
          // biome-ignore lint/suspicious/noExplicitAny: Summarizer API is not yet typed
          m.addEventListener("downloadprogress", (e: any) => {
            const progress = Math.round((e.loaded / e.total) * 100);
            setDownloadProgress(progress);
            setStatus(`Downloading model: ${progress}%`);
          });
        },
      });

      setStatus("Summarizing...");
      const result = await summarizer.summarize(sourceText);
      setSummary(result);
      setStatus("✅ Summarization complete");
    } catch (error) {
      setStatus(`❌ Error: ${error}`);
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <>
      <PageTitle title="Summarizer API Demo" />
      <div style={{ display: "block", maxWidth: "65ch", marginInlineStart: "auto", marginInlineEnd: "auto" }}>
        <div>
          <p>Status: {status || "Ready"}</p>

          <h2>Configuration</h2>
          <div>
            <label>Type:</label>
            <select value={summaryType} onChange={(e) => setSummaryType(e.target.value)}>
              <option value="tldr">TL;DR</option>
              <option value="teaser">Teaser</option>
              <option value="key-points">Key Points</option>
              <option value="headline">Headline</option>
            </select>
          </div>
          <div>
            <label>Length:</label>
            <select value={summaryLength} onChange={(e) => setSummaryLength(e.target.value)}>
              <option value="short">Short</option>
              <option value="medium">Medium</option>
              <option value="long">Long</option>
            </select>
          </div>
          <div>
            <label>Format:</label>
            <select value={summaryFormat} onChange={(e) => setSummaryFormat(e.target.value)}>
              <option value="markdown">Markdown</option>
              <option value="plain-text">Plain Text</option>
            </select>
          </div>
          <div>
            <label>Input Language:</label>
            <select value={inputLanguage} onChange={(e) => setInputLanguage(e.target.value)}>
              <option value="en">English</option>
              <option value="ja">Japanese</option>
              <option value="es">Spanish</option>
            </select>
          </div>
          <div>
            <label>Output Language:</label>
            <select value={outputLanguage} onChange={(e) => setOutputLanguage(e.target.value)}>
              <option value="ja">Japanese</option>
              <option value="en">English</option>
              <option value="es">Spanish</option>
            </select>
          </div>
          <h2>Summarization</h2>
          <div>
            <label>Text to summarize:</label>
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="Enter text to summarize..."
              rows={6}
              style={{ width: "100%" }}
            />
          </div>
          <button type="button" onClick={handleSummarize} disabled={isSummarizing}>
            Summarize
          </button>

          {downloadProgress > 0 && downloadProgress < 100 && (
            <div>
              <h2>Download Progress</h2>
              <progress value={downloadProgress} max={100} />
              <span>{downloadProgress}%</span>
            </div>
          )}

          <h2>Summary Result</h2>
          <div style={{ whiteSpace: "pre-wrap" }}>{summary || "Summary will appear here..."}</div>

          <hr style={{ margin: "2rem 0", borderColor: "#e5e7eb" }} />
          <h2>Reference</h2>
          <ul>
            <li>
              <a href="https://developer.chrome.com/docs/ai/summarizer-api" target="_blank" rel="noopener noreferrer">
                Summarizer API - Chrome for Developers
              </a>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
