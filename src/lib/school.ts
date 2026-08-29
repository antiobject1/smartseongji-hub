export const SCHOOL_NAME = "성지중학교";

/** 학년별 반 수: 1학년 8반, 2학년 9반, 3학년 9반 (총 26학급) */
export const CLASS_COUNT: Record<number, number> = { 1: 8, 2: 9, 3: 9 };

export const GRADES = [1, 2, 3] as const;

export function classesForGrade(grade: number): number[] {
  const count = CLASS_COUNT[grade] ?? 0;
  return Array.from({ length: count }, (_, i) => i + 1);
}

export function isValidSelection(grade: number, classNo: number): boolean {
  const count = CLASS_COUNT[grade];
  return !!count && classNo >= 1 && classNo <= count;
}

export const WEEKDAYS = [
  { value: 1, label: "월요일", short: "월" },
  { value: 2, label: "화요일", short: "화" },
  { value: 3, label: "수요일", short: "수" },
  { value: 4, label: "목요일", short: "목" },
  { value: 5, label: "금요일", short: "금" },
];

export const PERIODS = [1, 2, 3, 4, 5, 6, 7];

export const EVENT_CATEGORIES = [
  { value: "exam", label: "시험" },
  { value: "event", label: "행사" },
  { value: "holiday", label: "휴업일" },
  { value: "school", label: "학교 일정" },
  { value: "etc", label: "기타" },
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number]["value"];

export const SUGGESTION_STATUS = [
  { value: "pending", label: "대기중" },
  { value: "in_progress", label: "처리중" },
  { value: "done", label: "완료" },
] as const;

export function categoryLabel(value: string) {
  return EVENT_CATEGORIES.find((c) => c.value === value)?.label ?? "기타";
}

export function statusLabel(value: string) {
  return SUGGESTION_STATUS.find((s) => s.value === value)?.label ?? "대기중";
}

/** 오늘 날짜(로컬)를 YYYY-MM-DD 로 반환 */
export function todayISO(d = new Date()) {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatKoreanDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${m}월 ${d}일`;
}

/** 1=월 ... 5=금, 주말이면 0 */
export function currentWeekday(d = new Date()) {
  const day = d.getDay();
  return day >= 1 && day <= 5 ? day : 0;
}
