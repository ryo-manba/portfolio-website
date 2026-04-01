"use client";

import { useState } from "react";
import { MdContentCopy, MdCheck } from "react-icons/md";

type Props = {
  content: string;
};

export function CopyMarkdownButton({ content }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md px-3 py-1.5 transition-colors hover:bg-gray-100"
    >
      {copied ? (
        <MdCheck className="w-4 h-4" aria-hidden="true" />
      ) : (
        <MdContentCopy className="w-4 h-4" aria-hidden="true" />
      )}
      {copied ? "コピーしました" : "Markdown をコピー"}
    </button>
  );
}
