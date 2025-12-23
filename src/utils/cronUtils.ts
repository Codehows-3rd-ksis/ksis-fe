/**
 * @file cronUtils.ts
 * @description 스케줄러의 Cron 표현식 생성 및 파싱 유틸리티
 */

// 요일 영문 약자
const DAY_OF_WEEK_EN = [
  "SUN",
  "MON",
  "TUE",
  "WED",
  "THU",
  "FRI",
  "SAT",
] as const;
const DAY_OF_WEEK_KR = [
  "일요일",
  "월요일",
  "화요일",
  "수요일",
  "목요일",
  "금요일",
  "토요일",
] as const;

export type ScheduleType =
  | "weekly"
  | "1st-week"
  | "2nd-week"
  | "3rd-week"
  | "4th-week"
  | "last-week";

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface CronConfig {
  type: ScheduleType;
  hour: number;
  minute: number;
  daysOfWeek: DayOfWeek[]; // 매주일 때 복수 요일 가능
}
/**
 * Cron 표현식 생성
 * @example
 * generateCronExpression({ type: 'weekly', hour: 9, minute: 0, daysOfWeek: [1, 3, 5] })
 * // => "0 0 9 ? * MON,WED,FRI"
 *
 * generateCronExpression({ type: '1st-week', hour: 9, minute: 0, daysOfWeek: [1] })
 * // => "0 0 9 ? * 1#MON"
 */
export const generateCronExpression = (config: CronConfig): string => {
  const { type, hour, minute, daysOfWeek } = config;
  const second = 0; // 초는 항상 0

  // 요일 문자열 생성
  let dayPart = "";

  if (type === "weekly") {
    // 매주: MON,WED,FRI 형태
    dayPart = daysOfWeek.map((d) => DAY_OF_WEEK_EN[d]).join(",");
  } else if (type === "1st-week") {
    // 첫번째 주: 1#MON,1#WED,1#FRI 형태
    dayPart = daysOfWeek.map((d) => `1#${DAY_OF_WEEK_EN[d]}`).join(",");
  } else if (type === "2nd-week") {
    dayPart = daysOfWeek.map((d) => `2#${DAY_OF_WEEK_EN[d]}`).join(",");
  } else if (type === "3rd-week") {
    dayPart = daysOfWeek.map((d) => `3#${DAY_OF_WEEK_EN[d]}`).join(",");
  } else if (type === "4th-week") {
    dayPart = daysOfWeek.map((d) => `4#${DAY_OF_WEEK_EN[d]}`).join(",");
  } else if (type === "last-week") {
    // 마지막 주: LMON,LWED,LFRI 형태
    dayPart = daysOfWeek.map((d) => `L${DAY_OF_WEEK_EN[d]}`).join(",");
  }

  // Spring Cron: 초 분 시 일 월 요일
  return `${second} ${minute} ${hour} ? * ${dayPart}`;
};

/**
 * Cron 표현식 파싱 (수정 페이지에서 사용)
 * @example
 * parseCronExpression("0 30 9 ? * MON,WED,FRI")
 * // => { type: 'weekly', hour: 9, minute: 30, daysOfWeek: [1, 3, 5] }
 */
export const parseCronExpression = (cron: string): CronConfig | null => {
  const parts = cron.split(" ");
  if (parts.length !== 6) return null;

  const minute = parseInt(parts[1], 10);
  const hour = parseInt(parts[2], 10);
  const dowStr = parts[5]; //요일(day of week string)은 parts[5]에 있음

  // 매주 (MON 또는 MON,WED,FRI)
  if (!dowStr.includes("#") && !dowStr.includes("L")) {
    const days = dowStr
      .split(",")
      .map((d) => DAY_OF_WEEK_EN.indexOf(d as any) as DayOfWeek);
    return {
      type: "weekly",
      hour,
      minute,
      daysOfWeek: days,
    };
  }

  // N번째 주 (1#MON,1#WED,1#FRI)
  if (dowStr.includes("#")) {
    const parts = dowStr.split(",");
    const firstPart = parts[0].split("#");
    const weekNum = parseInt(firstPart[0], 10);

    // 숫자를 타입으로 변환
    const weekTypeMap: { [key: number]: ScheduleType } = {
      1: "1st-week",
      2: "2nd-week",
      3: "3rd-week",
      4: "4th-week",
    };

    // 각 부분에서 요일만 추출
    const days = parts.map((part) => {
      const dayStr = part.split("#")[1];
      return DAY_OF_WEEK_EN.indexOf(dayStr as any) as DayOfWeek;
    });

    return {
      type: weekTypeMap[weekNum] || "1st-week",
      hour,
      minute,
      daysOfWeek: days,
    };
  }

  // 마지막 주 (LMON,LWED,LFRI)
  if (dowStr.startsWith("L")) {
    const parts = dowStr.split(",");
    const days = parts.map((part) => {
      const dayStr = part.substring(1);
      return DAY_OF_WEEK_EN.indexOf(dayStr as any) as DayOfWeek;
    });

    return {
      type: "last-week",
      hour,
      minute,
      daysOfWeek: days,
    };
  }

  return null;
};

/**
 * Cron 표현식을 한글로 변환 (테이블 표시용)
 * @example
 * formatCronToKorean("0 0 9 ? * MON,WED,FRI")
 * // => "매주 월요일, 수요일, 금요일"
 */
export const formatCronToKorean = (cron: string): string => {
  const config = parseCronExpression(cron);
  if (!config) return cron;

  const { type, daysOfWeek } = config;
  const dayNames = daysOfWeek.map((d) => DAY_OF_WEEK_KR[d]);

  if (type === "weekly") {
    return `매주 ${dayNames.join(", ")}`;
  } else if (type === "1st-week") {
    return `첫번째 주 ${dayNames.join(", ")}`;
  } else if (type === "2nd-week") {
    return `두번째 주 ${dayNames.join(", ")}`;
  } else if (type === "3rd-week") {
    return `세번째 주 ${dayNames.join(", ")}`;
  } else if (type === "4th-week") {
    return `네번째 주 ${dayNames.join(", ")}`;
  } else if (type === "last-week") {
    return `마지막 주 ${dayNames.join(", ")}`;
  }

  return cron;
};
