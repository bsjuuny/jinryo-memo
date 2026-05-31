import type { VisitMemo, VisitSummary } from "@/types/visitMemo";

const SAFETY_KEYWORDS = [
  "고열",
  "호흡곤란",
  "숨쉬기 힘",
  "숨을 못",
  "의식저하",
  "의식 저하",
  "경련",
  "발작",
  "탈수",
  "소변이 안",
  "축 처짐",
  "청색증",
  "입술 파래",
];

const emptyText = "기록하지 않았습니다.";

function clean(value: string): string {
  return value.trim();
}

function sentence(value: string, fallback = emptyText): string {
  return clean(value) || fallback;
}

function formatTempRecords(records: VisitMemo["temperatureRecords"]): string {
  if (!records || records.length === 0) return "";
  return records
    .map((r) => [r.time, r.temp ? `${r.temp}도` : ""].filter(Boolean).join(" "))
    .join(", ");
}

export function createEmptyMemo(): VisitMemo {
  return {
    id: "",
    createdAt: "",
    subjectType: "아이",
    age: "",
    startedAt: "",
    mainSymptoms: "",
    temperatureRecords: [],
    medications: "",
    additionalSymptoms: "",
    eatingDrinking: "",
    sleep: "",
    hasPhotoMemo: false,
    questions: "",
    notes: "",
  };
}

export function createExampleMemo(): VisitMemo {
  return {
    id: "",
    createdAt: "",
    subjectType: "아이",
    age: "38개월",
    startedAt: "어제 저녁부터",
    mainSymptoms: "기침, 콧물이 있고 밤에 조금 더 심해졌습니다.",
    temperatureRecords: [
      { id: "ex-1", time: "어제 저녁", temp: "37.8" },
      { id: "ex-2", time: "오늘 오전", temp: "38.2" },
    ],
    medications: "해열제를 1회 먹었습니다.",
    additionalSymptoms: "식욕이 줄었고 코막힘이 있습니다.",
    eatingDrinking: "밥은 평소보다 적게 먹고 물은 조금씩 마셨습니다.",
    sleep: "기침 때문에 자주 깼습니다.",
    hasPhotoMemo: true,
    questions: "집에서 관찰할 때 어떤 점을 보면 좋을까요?",
    notes: "증상 사진을 휴대폰에 저장해 두었습니다.",
  };
}

export function buildVisitSummary(memo: VisitMemo): VisitSummary {
  const agePart = clean(memo.age) ? `${memo.age} ` : "";
  const subject = `${agePart}${memo.subjectType}`;
  const started = clean(memo.startedAt) || "시작 시점은 아직 정리하지 못했습니다";
  const symptoms = clean(memo.mainSymptoms) || "주요 증상은 아직 정리하지 못했습니다";
  const temp = formatTempRecords(memo.temperatureRecords);
  const meds = clean(memo.medications);
  const additional = clean(memo.additionalSymptoms);
  const eating = clean(memo.eatingDrinking);
  const sleep = clean(memo.sleep);

  const oneLineParts = [
    `대상은 ${subject}입니다.`,
    `${started} ${symptoms}`,
    temp ? `체온 기록은 ${temp}입니다.` : "",
    meds ? `복용한 약은 ${meds}` : "",
  ].filter(Boolean);

  const mustTell = [
    clean(memo.startedAt) ? `증상 시작: ${memo.startedAt}` : "",
    clean(memo.mainSymptoms) ? `주요 증상: ${memo.mainSymptoms}` : "",
    temp ? `체온 기록: ${temp}` : "",
    meds ? `복용한 약: ${meds}` : "",
    additional ? `동반 증상: ${additional}` : "",
    memo.hasPhotoMemo ? "관련 사진 메모가 있습니다." : "",
  ].filter(Boolean);

  return {
    oneLine: oneLineParts.join(" "),
    timeline: clean(memo.startedAt)
      ? `${memo.startedAt} 증상이 시작되거나 인지되었습니다.`
      : emptyText,
    temperature: temp || emptyText,
    medications: meds || emptyText,
    additionalSymptoms: additional || emptyText,
    dailyChanges:
      [eating ? `식사/수분: ${eating}` : "", sleep ? `수면: ${sleep}` : ""]
        .filter(Boolean)
        .join(" ") || emptyText,
    mustTell:
      mustTell.length > 0 ? mustTell : ["아직 꼭 말할 내용을 충분히 적지 않았습니다."],
    questions: sentence(memo.questions),
    originalNotes: sentence(memo.notes),
    safetyNoticeRequired: hasSafetyKeyword(memo),
  };
}

export function hasSafetyKeyword(memo: VisitMemo): boolean {
  const text = [
    memo.mainSymptoms,
    memo.additionalSymptoms,
    memo.notes,
    memo.questions,
    ...memo.temperatureRecords.map((r) => `${r.time} ${r.temp}`),
  ]
    .join(" ")
    .toLowerCase();

  return SAFETY_KEYWORDS.some((keyword) => text.includes(keyword.toLowerCase()));
}

export function formatMemoForClipboard(memo: VisitMemo): string {
  const summary = buildVisitSummary(memo);

  return [
    "[진료메모]",
    `한 줄 요약: ${summary.oneLine}`,
    `증상 타임라인: ${summary.timeline}`,
    `체온 변화: ${summary.temperature}`,
    `복용한 약: ${summary.medications}`,
    `동반 증상: ${summary.additionalSymptoms}`,
    `생활 상태 변화: ${summary.dailyChanges}`,
    `의사에게 꼭 말할 내용: ${summary.mustTell.join(" / ")}`,
    `의사에게 물어볼 질문: ${summary.questions}`,
    `원문 메모: ${summary.originalNotes}`,
  ].join("\n");
}
