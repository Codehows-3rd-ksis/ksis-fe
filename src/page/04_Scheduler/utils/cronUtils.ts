/**
 * @file cronUtils.ts
 * @description 스케줄러의 Cron 표현식 생성 및 파싱 유틸리티
 */

// 요일 영문 약자
const DAY_OF_WEEK_EN = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const;
const DAY_OF_WEEK_KR = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'] as const;

export type ScheduleType = 'weekly' | 'nth-week' | 'last-week';
export type WeekNumber = 1 | 2 | 3 | 4;
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface CronConfig {
  type: ScheduleType;
  hour: number;
  minute: number;
  daysOfWeek: DayOfWeek[]; // 매주일 때 복수 요일 가능
  weekNumber?: WeekNumber; // nth-week일 때 사용
}

/**
 * Cron 표현식 생성
 * @example
 * generateCronExpression({ type: 'weekly', hour: 9, minute: 0, daysOfWeek: [1, 3, 5] })
 * // => "0 0 9 ? * MON,WED,FRI"
 *
 * generateCronExpression({ type: 'nth-week', hour: 9, minute: 0, daysOfWeek: [1], weekNumber: 1 })
 * // => "0 0 9 ? * 1#MON"
 */
export const generateCronExpression = (config: CronConfig): string => {
  const { type, hour, minute, daysOfWeek, weekNumber } = config;
  const second = 0; // 초는 항상 0

  // 요일 문자열 생성
  let dayPart = '';

  if (type === 'weekly') {
    // 매주: MON,WED,FRI 형태
    dayPart = daysOfWeek.map(d => DAY_OF_WEEK_EN[d]).join(',');
  } else if (type === 'nth-week' && weekNumber) {
    // N번째 주: 1#MON 형태 (단일 요일만)
    dayPart = `${weekNumber}#${DAY_OF_WEEK_EN[daysOfWeek[0]]}`;
  } else if (type === 'last-week') {
    // 마지막 주: LMON 형태 (단일 요일만)
    dayPart = `L${DAY_OF_WEEK_EN[daysOfWeek[0]]}`;
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
  const parts = cron.split(' ');
  if (parts.length !== 6) return null;

  const [secStr, minStr, hrStr, domStr, monthStr, dowStr] = parts;

  const minute = parseInt(minStr, 10);
  const hour = parseInt(hrStr, 10);

  // 매주 (MON 또는 MON,WED,FRI)
  if (!dowStr.includes('#') && !dowStr.includes('L')) {
    const days = dowStr.split(',').map(d => DAY_OF_WEEK_EN.indexOf(d as any) as DayOfWeek);
    return {
      type: 'weekly',
      hour,
      minute,
      daysOfWeek: days,
    };
  }

  // N번째 주 (1#MON)
  if (dowStr.includes('#')) {
    const [weekNumStr, dayStr] = dowStr.split('#');
    return {
      type: 'nth-week',
      hour,
      minute,
      daysOfWeek: [DAY_OF_WEEK_EN.indexOf(dayStr as any) as DayOfWeek],
      weekNumber: parseInt(weekNumStr, 10) as WeekNumber,
    };
  }

  // 마지막 주 (LMON)
  if (dowStr.startsWith('L')) {
    const dayStr = dowStr.substring(1);
    return {
      type: 'last-week',
      hour,
      minute,
      daysOfWeek: [DAY_OF_WEEK_EN.indexOf(dayStr as any) as DayOfWeek],
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

  const { type, hour, minute, daysOfWeek, weekNumber } = config;
  const dayNames = daysOfWeek.map(d => DAY_OF_WEEK_KR[d]);

  const timeStr = `${hour}시 ${minute}분`;

  if (type === 'weekly') {
    return `매주 ${dayNames.join(', ')}`;
  } else if (type === 'nth-week') {
    const weekStr = ['첫번째', '두번째', '세번째', '네번째'][weekNumber! - 1];
    return `${weekStr} ${dayNames[0]}`;
  } else if (type === 'last-week') {
    return `마지막 ${dayNames[0]}`;
  }

  return cron;
};
