"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

type CopySummaryButtonProps = {
  text: string;
};

export function CopySummaryButton({ text }: CopySummaryButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800"
    >
      {copied ? <Check size={18} /> : <Copy size={18} />}
      {copied ? "복사됨" : "요약 복사"}
    </button>
  );
}
