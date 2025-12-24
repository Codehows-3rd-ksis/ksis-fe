//상수
export const DAY_OF_WEEK_EN = [
  "SUN",
  "MON",
  "TUE",
  "WED",
  "THU",
  "FRI",
  "SAT",
] as const;

export const DAY_OF_WEEK_KR = [
  "일요일",
  "월요일",
  "화요일",
  "수요일",
  "목요일",
  "금요일",
  "토요일",
] as const;

//타입
export type WeekOfMonth = "0" | "1" | "2" | "3" | "4" | "L"; // 주차 ("0": 매주 | "1" ~ "4": n번째 주 | "L": 마지막 주)
export type DayOfWeekIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 요일  (0: 일요일 ~ 6: 토요일)
export type DayOfWeekEN = (typeof DAY_OF_WEEK_EN)[number]; // 요일 영문

//cron 표현식 생성
export const generateTimeCron = (hour: number, minute: number): string => {
  return `0 ${minute} ${hour} * * ?`;
};

//한글로 변환
export const formatScheduleToKorean = (
  daysOfWeek: DayOfWeekEN[],
  weekOfMonth: WeekOfMonth
): string => {
  const dayNames = daysOfWeek.map(
    (d) => DAY_OF_WEEK_KR[DAY_OF_WEEK_EN.indexOf(d)]
  );

  const weekPrefixMap: Record<WeekOfMonth, string> = {
    "0": "매주",
    "1": "첫번째 주",
    "2": "두번째 주",
    "3": "세번째 주",
    "4": "네번째 주",
    L: "마지막 주",
  };

  const prefix = weekPrefixMap[weekOfMonth];
  return `${prefix} ${dayNames.join(", ")}`;
};

//Cron에서 시,분 파싱(editPage용)
export const parseTimeCron = (
  cron: string
): { hour: number; minute: number } | null => {
  const parts = cron.split(" ");
  if (parts.length !== 6) return null;

  return {
    minute: parseInt(parts[1], 10),
    hour: parseInt(parts[2], 10),
  };
};

// Select 옵션
/** 주차 선택 옵션 */
export const WEEK_OF_MONTH_OPTIONS = [
  { value: "0", name: "매주" },
  { value: "1", name: "첫번째 주" },
  { value: "2", name: "두번째 주" },
  { value: "3", name: "세번째 주" },
  { value: "4", name: "네번째 주" },
  { value: "L", name: "마지막 주" },
] as const;

/** 시간 선택 옵션 (0~23시) */
export const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => ({
  value: i,
  name: `${i}시`,
}));

/** 분 선택 옵션 (10분 단위) */
export const MINUTE_OPTIONS = [
  { value: 0, name: "0분" },
  { value: 10, name: "10분" },
  { value: 20, name: "20분" },
  { value: 30, name: "30분" },
  { value: 40, name: "40분" },
  { value: 50, name: "50분" },
] as const;
