/**
 * @file 04_SchedulerApi.tsx
 * @description 스케줄러 관련 API 호출
 */

import instance from "./AxiosInstance";

import type { WeekOfMonth, DayOfWeekEN } from "../utils/cronUtils";

/**
 * 스케줄 데이터 인터페이스
 */
export interface Schedule {
  scheduleId: number;
  settingName: string;
  settingId: number;
  userId: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  cronExpression: string; // 시간 정보만 (0 0 9 * * ?)
  collectAt: string;
  daysOfWeek: string; // "MON,WED,FRI" (문자열)
  weekOfMonth: WeekOfMonth; // "0": 매주 | "1"~"4": n번째 주 | "L": 마지막 주
  createAt: string;
  updateAt: string;
  isDelete: string;
}

export interface ScheduleResponse {
  content: Schedule[];
  page: number;
  size: number;
  totalElements: number;
}

/**
 * 스케줄 등록 요청 데이터
 */
export interface CreateScheduleRequest {
  schedulerId?: number; // 수정 시에만 필요
  settingId: number;
  startDate: string;
  endDate: string;
  cronExpression: string; // 시간 정보만 (0 0 9 * * ?)
  daysOfWeek: DayOfWeekEN[]; // ["MON", "WED", "FRI"]
  weekOfMonth: WeekOfMonth; // "0": 매주 | "1"~"4": n번째 주 | "L": 마지막 주
}

/**
 * 스케줄 목록 조회
 */
export const getSchedules = async (
  startDate: string,
  endDate: string,
  type: string,
  keyword: string,
  page: number,
  size: number
): Promise<ScheduleResponse> => {
  const response = await instance.get<ScheduleResponse>("/scheduler", {
    params: {
      startDate,
      endDate,
      type,
      keyword,
      page,
      size,
    },
  });
  return response.data;
};

/**
 * 스케줄 등록
 */
export const createSchedule = async (
  data: CreateScheduleRequest
): Promise<Schedule> => {
  const response = await instance.post<Schedule>("/scheduler", data);
  return response.data;
};

/**
 * 스케줄 수정
 */
export const updateSchedule = async (
  scheduleId: number,
  data: Partial<CreateScheduleRequest>
): Promise<Schedule> => {
  const response = await instance.put<Schedule>(
    `/scheduler/${scheduleId}`,
    data
  );
  return response.data;
};

/**
 * 스케줄 삭제
 */
export const deleteSchedule = async (scheduleId: number): Promise<void> => {
  await instance.delete(`/scheduler/${scheduleId}`);
};

/**
 * 특정 스케줄 조회
 */
export const getScheduleById = async (
  scheduleId: number
): Promise<Schedule> => {
  const response = await instance.get<Schedule>(`/scheduler/${scheduleId}`);
  return response.data;
};
