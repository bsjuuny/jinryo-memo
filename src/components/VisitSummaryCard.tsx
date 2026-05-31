import { Printer } from "lucide-react";
import { buildVisitSummary, formatMemoForClipboard } from "@/lib/summary";
import type { VisitMemo } from "@/types/visitMemo";
import { CopySummaryButton } from "./CopySummaryButton";
import { SafetyNotice } from "./SafetyNotice";

type VisitSummaryCardProps = {
  memo: VisitMemo;
};

function SummaryBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <dt className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">{title}</dt>
      <dd className="whitespace-pre-wrap text-sm leading-6 text-slate-900">{children}</dd>
    </div>
  );
}

export function VisitSummaryCard({ memo }: VisitSummaryCardProps) {
  const summary = buildVisitSummary(memo);
  const clipboardText = formatMemoForClipboard(memo);

  return (
    <article className="print-card rounded-lg border border-teal-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">진료용 요약 카드</p>
          <h2 className="mt-1 text-xl font-black text-slate-950">의료진에게 보여줄 메모</h2>
        </div>
        <div className="no-print flex gap-2">
          <CopySummaryButton text={clipboardText} />
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <Printer size={18} />
            인쇄
          </button>
        </div>
      </div>

      <div className="mb-4 rounded-lg bg-teal-700 p-4 text-white">
        <div className="text-xs font-bold uppercase tracking-wide text-teal-100">한 줄 요약</div>
        <p className="mt-2 text-base font-semibold leading-7">{summary.oneLine}</p>
      </div>

      <dl className="grid gap-3">
        <SummaryBlock title="증상 타임라인">{summary.timeline}</SummaryBlock>
        <SummaryBlock title="체온 변화">{summary.temperature}</SummaryBlock>
        <SummaryBlock title="복용한 약">{summary.medications}</SummaryBlock>
        <SummaryBlock title="동반 증상">{summary.additionalSymptoms}</SummaryBlock>
        <SummaryBlock title="생활 상태 변화">{summary.dailyChanges}</SummaryBlock>
        <SummaryBlock title="의사에게 꼭 말할 내용">
          <ul className="list-inside list-disc space-y-1">
            {summary.mustTell.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </SummaryBlock>
        <SummaryBlock title="의사에게 물어볼 질문">{summary.questions}</SummaryBlock>
        <SummaryBlock title="원문 메모">{summary.originalNotes}</SummaryBlock>
      </dl>

      <div className="mt-4">
        <SafetyNotice urgentExpression={summary.safetyNoticeRequired} />
      </div>
    </article>
  );
}
