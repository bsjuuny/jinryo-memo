export type SubjectType = "아이" | "본인" | "가족";

export type TemperatureRecord = {
  id: string;
  time: string;
  temp: string;
};

export type VisitMemo = {
  id: string;
  createdAt: string;
  subjectType: SubjectType;
  age: string;
  startedAt: string;
  mainSymptoms: string;
  temperatureRecords: TemperatureRecord[];
  medications: string;
  additionalSymptoms: string;
  eatingDrinking: string;
  sleep: string;
  hasPhotoMemo: boolean;
  questions: string;
  notes: string;
};

export type VisitSummary = {
  oneLine: string;
  timeline: string;
  temperature: string;
  medications: string;
  additionalSymptoms: string;
  dailyChanges: string;
  mustTell: string[];
  questions: string;
  originalNotes: string;
  safetyNoticeRequired: boolean;
};
