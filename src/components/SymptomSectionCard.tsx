"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

type SymptomSectionCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
};

export function SymptomSectionCard({
  title,
  description,
  children,
  collapsible = false,
  defaultOpen = true,
}: SymptomSectionCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div
        role={collapsible ? "button" : undefined}
        tabIndex={collapsible ? 0 : undefined}
        onClick={() => collapsible && setOpen((v) => !v)}
        onKeyDown={(e) => collapsible && e.key === "Enter" && setOpen((v) => !v)}
        className={`flex items-center justify-between p-4 ${
          collapsible ? "cursor-pointer select-none rounded-lg hover:bg-slate-50" : ""
        }`}
      >
        <div>
          <h2 className="text-base font-bold text-slate-950">{title}</h2>
          {description && open && (
            <p className="mt-1 text-sm leading-5 text-slate-500">{description}</p>
          )}
        </div>
        {collapsible &&
          (open ? (
            <ChevronUp size={18} className="flex-shrink-0 text-slate-400" />
          ) : (
            <ChevronDown size={18} className="flex-shrink-0 text-slate-400" />
          ))}
      </div>
      {open && <div className="grid gap-4 px-4 pb-4">{children}</div>}
    </section>
  );
}
