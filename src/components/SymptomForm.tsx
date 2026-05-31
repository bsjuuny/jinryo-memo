"use client";

import { useEffect, useRef, useState } from "react";
import { ClipboardPlus, Plus, RotateCcw, X } from "lucide-react";
import { createEmptyMemo, createExampleMemo } from "@/lib/summary";
import { deleteVisitMemo, loadVisitMemos, saveVisitMemo } from "@/lib/storage";
import type { SubjectType, TemperatureRecord, VisitMemo } from "@/types/visitMemo";
import { RecordList } from "./RecordList";
import { SafetyNotice } from "./SafetyNotice";
import { SymptomSectionCard } from "./SymptomSectionCard";
import { VisitSummaryCard } from "./VisitSummaryCard";

const SYMPTOM_TAGS = [
  "기침", "열", "콧물", "코막힘", "구토", "설사", "발진", "복통", "두통", "인후통",
];

type InputProps = {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
};

function TextInput({ label, value, placeholder, onChange }: InputProps) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
      />
    </label>
  );
}

function TextArea({ label, value, placeholder, onChange }: InputProps) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <textarea
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
      />
    </label>
  );
}

function TempTimeline({
  records,
  onChange,
  resetKey,
}: {
  records: TemperatureRecord[];
  onChange: (records: TemperatureRecord[]) => void;
  resetKey: number;
}) {
  const [time, setTime] = useState("");
  const [temp, setTemp] = useState("");
  const tempRef = useRef<HTMLInputElement>(null);

  // 폼 리셋 시 입력값 초기화
  useEffect(() => {
    setTime("");
    setTemp("");
  }, [resetKey]);

  function handleAdd() {
    if (!temp.trim()) return;
    onChange([
      ...records,
      { id: crypto.randomUUID(), time: time.trim(), temp: temp.trim() },
    ]);
    setTime("");
    setTemp("");
  }

  return (
    <div className="grid gap-1.5">
      <span className="text-sm font-bold text-slate-700">체온 기록</span>
      <div className="grid gap-2">
        <input
          value={time}
          onChange={(e) => setTime(e.target.value)}
          placeholder="측정 시각 (예: 오늘 오전 10시)"
          onKeyDown={(e) => e.key === "Enter" && tempRef.current?.focus()}
          className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
        />
        <div className="flex gap-2">
          <input
            ref={tempRef}
            value={temp}
            onChange={(e) => setTemp(e.target.value)}
            placeholder="체온 입력 (예: 38.2)"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className="min-h-10 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
          />
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex min-h-10 flex-shrink-0 items-center gap-1 rounded-lg bg-teal-600 px-4 text-sm font-bold text-white hover:bg-teal-700 active:scale-95 transition-transform"
          >
            <Plus size={15} />
            추가
          </button>
        </div>
      </div>
      {records.length > 0 && (
        <div className="mt-1 space-y-1.5">
          {records.map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-2 rounded-lg bg-teal-50 px-3 py-2 text-sm"
            >
              {r.time && <span className="text-slate-500">{r.time}</span>}
              {r.time && <span className="text-slate-300">·</span>}
              <span className="font-semibold text-teal-800">{r.temp}도</span>
              <button
                type="button"
                onClick={() => onChange(records.filter((x) => x.id !== r.id))}
                className="ml-auto text-slate-400 hover:text-rose-500"
                aria-label="삭제"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function SymptomForm() {
  const [memo, setMemo] = useState<VisitMemo>(createEmptyMemo());
  const [records, setRecords] = useState<VisitMemo[]>([]);
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [savedAt, setSavedAt] = useState("");
  const [formKey, setFormKey] = useState(0);
  const dirtyRef = useRef(false);

  useEffect(() => {
    setRecords(loadVisitMemos());
  }, []);

  // 자동 저장 — 2초 디바운스
  useEffect(() => {
    if (!dirtyRef.current) return;

    const hasContent =
      memo.mainSymptoms.trim() ||
      memo.temperatureRecords.length > 0 ||
      memo.medications.trim();

    if (!hasContent) {
      setSaveStatus("idle");
      return;
    }

    setSaveStatus("saving");
    const timer = setTimeout(() => {
      dirtyRef.current = false;
      const nextRecords = saveVisitMemo(memo);
      setRecords(nextRecords);
      const saved = memo.id
        ? (nextRecords.find((r) => r.id === memo.id) ?? nextRecords[0])
        : nextRecords[0];
      setMemo((prev) => ({ ...prev, id: saved.id, createdAt: saved.createdAt }));
      setSelectedId(saved.id);
      setSaveStatus("saved");
      setSavedAt(
        new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })
      );
    }, 2000);

    return () => clearTimeout(timer);
  }, [memo]); // eslint-disable-line react-hooks/exhaustive-deps

  function update<K extends keyof VisitMemo>(key: K, value: VisitMemo[K]) {
    setMemo((prev) => ({ ...prev, [key]: value }));
    dirtyRef.current = true;
  }

  function appendSymptomTag(tag: string) {
    const current = memo.mainSymptoms.trim();
    update("mainSymptoms", current ? `${current}, ${tag}` : tag);
  }

  function resetForm(next: VisitMemo) {
    setMemo(next);
    setSelectedId(next.id || undefined);
    dirtyRef.current = false;
    setSaveStatus("idle");
    setSavedAt("");
    setFormKey((k) => k + 1);
  }

  function handleExample() {
    resetForm(createExampleMemo());
  }

  function handleReset() {
    resetForm(createEmptyMemo());
  }

  function handleSelect(record: VisitMemo) {
    resetForm(record);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleDelete(id: string) {
    const next = deleteVisitMemo(id);
    setRecords(next);
    if (selectedId === id) handleReset();
  }

  const statusText =
    saveStatus === "saving"
      ? "저장 중..."
      : saveStatus === "saved"
      ? `자동 저장됨 · ${savedAt}`
      : "내용을 입력하면 자동으로 저장됩니다.";

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
      <div className="grid gap-4">
        {/* 헤더 */}
        <div className="rounded-lg border border-teal-100 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">
                진료 전 메모 도구
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                진료메모
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                병원 가기 전, 급하게 증상을 정리할 때 씁니다.
              </p>
            </div>
            <div className="no-print flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleExample}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-3 text-sm font-bold text-teal-800 hover:bg-teal-100"
              >
                <ClipboardPlus size={16} />
                예시 입력
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                <RotateCcw size={16} />
                새 메모
              </button>
            </div>
          </div>
        </div>

        <form className="grid gap-4" onSubmit={(e) => e.preventDefault()}>
          {/* ① 핵심 증상 — 항상 표시 */}
          <SymptomSectionCard title="핵심 증상 정보">
            <TextInput
              label="증상 시작 시점"
              value={memo.startedAt}
              placeholder="예: 어제 저녁부터, 오늘 아침부터"
              onChange={(v) => update("startedAt", v)}
            />

            <div className="grid gap-1.5">
              <span className="text-sm font-bold text-slate-700">주요 증상</span>
              <div className="flex flex-wrap gap-1.5">
                {SYMPTOM_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => appendSymptomTag(tag)}
                    className="rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700 transition-transform hover:bg-teal-100 active:scale-95"
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <textarea
                value={memo.mainSymptoms}
                placeholder="태그를 누르거나 직접 입력하세요."
                onChange={(e) => update("mainSymptoms", e.target.value)}
                rows={2}
                className="resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              />
            </div>

            <TempTimeline
              key={formKey}
              records={memo.temperatureRecords}
              onChange={(v) => update("temperatureRecords", v)}
              resetKey={formKey}
            />

            <TextArea
              label="먹은 약"
              value={memo.medications}
              placeholder="예: 해열제를 1회 먹었습니다."
              onChange={(v) => update("medications", v)}
            />
          </SymptomSectionCard>

          {/* ② 대상 정보 — 접힌 채로 시작 */}
          <SymptomSectionCard
            title="대상 정보"
            description="모르는 항목은 비워두어도 됩니다."
            collapsible
            defaultOpen={false}
          >
            <label className="grid gap-1.5">
              <span className="text-sm font-bold text-slate-700">대상</span>
              <select
                value={memo.subjectType}
                onChange={(e) => update("subjectType", e.target.value as SubjectType)}
                className="min-h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              >
                <option>아이</option>
                <option>본인</option>
                <option>가족</option>
              </select>
            </label>
            <TextInput
              label="나이 또는 개월 수"
              value={memo.age}
              placeholder="예: 38개월, 만 5세, 42세"
              onChange={(v) => update("age", v)}
            />
          </SymptomSectionCard>

          {/* ③ 동반 증상 & 생활 상태 — 접힌 채로 시작 */}
          <SymptomSectionCard
            title="동반 증상 · 생활 상태"
            description="식사, 물, 잠 상태는 진료실에서 자주 묻는 내용입니다."
            collapsible
            defaultOpen={false}
          >
            <TextArea
              label="동반 증상"
              value={memo.additionalSymptoms}
              placeholder="예: 코막힘, 복통, 구토, 발진 등"
              onChange={(v) => update("additionalSymptoms", v)}
            />
            <TextArea
              label="식사/수분 섭취 상태"
              value={memo.eatingDrinking}
              placeholder="예: 밥은 적게 먹고 물은 조금씩 마셨습니다."
              onChange={(v) => update("eatingDrinking", v)}
            />
            <TextArea
              label="수면 상태"
              value={memo.sleep}
              placeholder="예: 기침 때문에 자주 깼습니다."
              onChange={(v) => update("sleep", v)}
            />
            <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <input
                type="checkbox"
                checked={memo.hasPhotoMemo}
                onChange={(e) => update("hasPhotoMemo", e.target.checked)}
                className="h-5 w-5 rounded border-slate-300 text-teal-700"
              />
              <span className="text-sm font-bold text-slate-700">
                관련 사진 메모가 있습니다
              </span>
            </label>
          </SymptomSectionCard>

          {/* ④ 질문 & 기타 — 접힌 채로 시작 */}
          <SymptomSectionCard title="질문 · 기타 메모" collapsible defaultOpen={false}>
            <TextArea
              label="병원에서 물어볼 질문"
              value={memo.questions}
              placeholder="예: 집에서 어떤 점을 더 관찰하면 좋을까요?"
              onChange={(v) => update("questions", v)}
            />
            <TextArea
              label="기타 메모"
              value={memo.notes}
              placeholder="예: 증상 사진을 휴대폰에 저장해 두었습니다."
              onChange={(v) => update("notes", v)}
            />
          </SymptomSectionCard>

          {/* 자동 저장 상태 바 */}
          <div className="no-print sticky bottom-3 z-10 rounded-lg border border-teal-100 bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
            <p
              className={`text-sm ${
                saveStatus === "saved"
                  ? "font-semibold text-teal-700"
                  : saveStatus === "saving"
                  ? "text-slate-400"
                  : "text-slate-400"
              }`}
            >
              {statusText}
            </p>
          </div>
        </form>

        <VisitSummaryCard memo={memo} />
        <SafetyNotice />
      </div>

      <aside className="no-print lg:sticky lg:top-4">
        <RecordList
          records={records}
          selectedId={selectedId}
          onSelect={handleSelect}
          onDelete={handleDelete}
        />
      </aside>
    </div>
  );
}
