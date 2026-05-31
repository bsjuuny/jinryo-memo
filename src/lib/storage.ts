import type { VisitMemo } from "@/types/visitMemo";

const STORAGE_KEY = "jinryo-memo.records";

function migrateMemo(raw: Record<string, unknown>): VisitMemo {
  const temp = raw.temperatureRecords;
  if (typeof temp === "string") {
    return {
      ...(raw as Omit<VisitMemo, "temperatureRecords">),
      temperatureRecords: temp.trim()
        ? [{ id: crypto.randomUUID(), time: "", temp: temp.trim() }]
        : [],
    } as VisitMemo;
  }
  if (!Array.isArray(temp)) {
    return { ...(raw as Omit<VisitMemo, "temperatureRecords">), temperatureRecords: [] } as VisitMemo;
  }
  return raw as VisitMemo;
}

export function loadVisitMemos(): VisitMemo[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(migrateMemo) : [];
  } catch {
    return [];
  }
}

export function saveVisitMemo(memo: VisitMemo): VisitMemo[] {
  const records = loadVisitMemos();
  const savedMemo: VisitMemo = {
    ...memo,
    id: memo.id || crypto.randomUUID(),
    createdAt: memo.createdAt || new Date().toISOString(),
  };
  const next = [savedMemo, ...records.filter((item) => item.id !== savedMemo.id)];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function deleteVisitMemo(id: string): VisitMemo[] {
  const next = loadVisitMemos().filter((memo) => memo.id !== id);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}
