"use client";

import { useState, useEffect } from "react";
import { PageTitle } from "@/components/PageTitle";

const SAMPLE_TEXT = "The Translator API provides a way to translate text on-device using AI models. This enables fast, private translation without sending data to servers. The API supports multiple languages and can handle both short and long texts efficiently. You can monitor download progress when language models are being fetched, and use either synchronous or streaming translation methods depending on your needs.";

export default function TranslatorAPIDemo() {
  const [sourceLanguage, setSourceLanguage] = useState("en");
  const [targetLanguage, setTargetLanguage] = useState("ja");
  const [sourceText, setSourceText] = useState(SAMPLE_TEXT);
  const [translatedText, setTranslatedText] = useState("");
  const [status, setStatus] = useState("");
  const [availabilityResult, setAvailabilityResult] = useState("");
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isTranslating, setIsTranslating] = useState(false);

  // Feature detection
  const checkSupport = () => {
    if ("Translator" in self) {
      setStatus("✅ Translator API is supported");
      return true;
    }
    setStatus("❌ Translator API is not supported in this browser");
    return false;
  };

  useEffect(() => {
    checkSupport();
  });

  // Check availability
  const checkAvailability = async () => {
    if (!checkSupport()) return;

    try {
      // biome-ignore lint/suspicious/noExplicitAny: Translator API is not yet typed
      const canTranslate = await (self as any).Translator.availability({
        sourceLanguage,
        targetLanguage,
      });
      setAvailabilityResult(`Availability: ${canTranslate}`);
    } catch (error) {
      setAvailabilityResult(`Error: ${error}`);
    }
  };

  // Translate text
  const handleTranslate = async () => {
    if (!checkSupport()) return;
    if (!sourceText.trim()) {
      setStatus("Please enter text to translate");
      return;
    }

    setIsTranslating(true);
    setTranslatedText("");
    setDownloadProgress(0);

    try {
      // biome-ignore lint/suspicious/noExplicitAny: Translator API is not yet typed
      const translator = await (self as any).Translator.create({
        sourceLanguage,
        targetLanguage,
        // biome-ignore lint/suspicious/noExplicitAny: Translator API is not yet typed
        monitor(m: any) {
          // biome-ignore lint/suspicious/noExplicitAny: Translator API is not yet typed
          m.addEventListener("downloadprogress", (e: any) => {
            const progress = Math.round((e.loaded / e.total) * 100);
            setDownloadProgress(progress);
            setStatus(`Downloading model: ${progress}%`);
          });
        },
      });

      setStatus("Translating...");
      const result = await translator.translate(sourceText);
      setTranslatedText(result);
      setStatus("✅ Translation complete");
    } catch (error) {
      setStatus(`❌ Error: ${error}`);
    } finally {
      setIsTranslating(false);
    }
  };

  // Streaming translation
  const handleStreamingTranslate = async () => {
    if (!checkSupport()) return;
    if (!sourceText.trim()) {
      setStatus("Please enter text to translate");
      return;
    }

    setIsTranslating(true);
    setTranslatedText("");
    setDownloadProgress(0);

    try {
      // biome-ignore lint/suspicious/noExplicitAny: Translator API is not yet typed
      const translator = await (self as any).Translator.create({
        sourceLanguage,
        targetLanguage,
        // biome-ignore lint/suspicious/noExplicitAny: Translator API is not yet typed
        monitor(m: any) {
          // biome-ignore lint/suspicious/noExplicitAny: Translator API is not yet typed
          m.addEventListener("downloadprogress", (e: any) => {
            const progress = Math.round((e.loaded / e.total) * 100);
            setDownloadProgress(progress);
            setStatus(`Downloading model: ${progress}%`);
          });
        },
      });

      setStatus("Streaming translation...");
      const stream = translator.translateStreaming(sourceText);
      let accumulated = "";

      for await (const chunk of stream) {
        accumulated = chunk;
        setTranslatedText(accumulated);
      }

      setStatus("✅ Streaming translation complete");
    } catch (error) {
      setStatus(`❌ Error: ${error}`);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <>
      <PageTitle title="Translator API Demo" />
      <div style={{ display: "block", maxWidth: "65ch", marginInlineStart: "auto", marginInlineEnd: "auto" }}>
        <div>
          <p>Status: {status || "Ready"}</p>

          <h2>Language Configuration</h2>
          <div>
            <label>Source Language:</label>
            <select value={sourceLanguage} onChange={(e) => setSourceLanguage(e.target.value)}>
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="ja">Japanese</option>
              <option value="zh">Chinese</option>
            </select>
          </div>
          <div>
            <label>Target Language:</label>
            <select value={targetLanguage} onChange={(e) => setTargetLanguage(e.target.value)}>
              <option value="ja">Japanese</option>
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="zh">Chinese</option>
            </select>
          </div>
          <button type="button" onClick={checkAvailability}>Check Availability</button>
          {availabilityResult && <p>{availabilityResult}</p>}

          <h2>Translation</h2>
          <div>
            <label>Text to translate:</label>
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="Enter text to translate..."
              rows={4}
              style={{ width: "100%" }}
            />
          </div>
          <button type="button" onClick={handleTranslate} disabled={isTranslating}>
            Translate
          </button>
          <button type="button" onClick={handleStreamingTranslate} disabled={isTranslating}>
            Streaming Translate
          </button>

          {downloadProgress > 0 && downloadProgress < 100 && (
            <div>
              <h2>Download Progress</h2>
              <progress value={downloadProgress} max={100} />
              <span>{downloadProgress}%</span>
            </div>
          )}

          <h2>Translation Result</h2>
          <div>{translatedText || "Translation will appear here..."}</div>
        </div>
      </div>
    </>
  );
}
