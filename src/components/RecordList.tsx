"use client";

import { FileText, Trash2 } from "lucide-react";
import type { VisitMemo } from "@/types/visitMemo";

type RecordListProps = {
  records: VisitMemo[];
  selectedId?: string;
  onSelect: (memo: VisitMemo) => void;
  onDelete: (id: string) => void;
};

function formatDate(value: string) {
  if (!value) return "";
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function RecordList({ records, selectedId, onSelect, onDelete }: RecordListProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <FileText size={18} className="text-teal-700" />
        <h2 className="text-base font-bold text-slate-950">기록 목록</h2>
      </div>

      {records.length === 0 ? (
        <p className="rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-500">
          저장된 진료메모가 없습니다. 입력 후 저장하면 이곳에서 다시 볼 수 있습니다.
        </p>
      ) : (
        <div className="grid gap-2">
          {records.map((record) => (
            <div
              key={record.id}
              className={`rounded-lg border p-3 transition ${
                selectedId === record.id ? "border-teal-500 bg-teal-50" : "border-slate-200 bg-white"
              }`}
            >
              <button
                type="button"
                onClick={() => onSelect(record)}
                className="block w-full text-left"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-bold text-slate-900">
                    {record.age ? `${record.age} ` : ""}
                    {record.subjectType}
                  </span>
                  <span className="text-xs text-slate-500">{formatDate(record.createdAt)}</span>
                </div>
                <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-600">
                  {record.mainSymptoms || record.notes || "증상 메모"}
                </p>
              </button>
              <button
                type="button"
                onClick={() => onDelete(record.id)}
                className="mt-3 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold text-rose-700 hover:bg-rose-50"
              >
                <Trash2 size={14} />
                삭제
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
