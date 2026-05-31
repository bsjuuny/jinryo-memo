import { AlertTriangle, ShieldCheck } from "lucide-react";

type SafetyNoticeProps = {
  urgentExpression?: boolean;
};

export function SafetyNotice({ urgentExpression = false }: SafetyNoticeProps) {
  return (
    <div className="space-y-3">
      {urgentExpression ? (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          <div className="mb-1 flex items-center gap-2 font-semibold">
            <AlertTriangle size={18} />
            의료진에게 빠르게 공유할 표현이 있습니다
          </div>
          입력하신 내용 중 의료진에게 빠르게 알려야 할 수 있는 표현이 포함되어 있습니다.
          병원 또는 응급 상담 창구에 직접 문의해 주세요.
        </div>
      ) : null}
      <div className="rounded-lg border border-teal-200 bg-teal-50 p-4 text-sm leading-6 text-teal-950">
        <div className="mb-1 flex items-center gap-2 font-semibold">
          <ShieldCheck size={18} />
          안전 안내
        </div>
        이 서비스는 진단이나 처방을 제공하지 않습니다. 증상이 심하거나 걱정되는 경우
        의료진에게 직접 문의하세요.
      </div>
    </div>
  );
}
