/**
 * @file 04_SchedulerApi.tsx
 * @description 스케줄러 관련 API 호출
 */

import instance from "./AxiosInstance";

/**
 * 스케줄 데이터 인터페이스
 */
export interface Schedule {
  id: number;
  settingId: number; // 어떤 데이터 수집 설정을 스케줄링할지
  settingName: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  cronExpression: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 스케줄 등록 요청 데이터
 */
export interface CreateScheduleRequest {
  settingId: number;
  startDate: string;
  endDate: string;
  cronExpression: string;
}

/**
 * 스케줄 목록 조회
 */
export const getSchedules = async (): Promise<Schedule[]> => {
  const response = await instance.get<Schedule[]>("/scheduler");
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
  const response = await instance.put<Schedule>(`/scheduler/${scheduleId}`, data);
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
export const getScheduleById = async (scheduleId: number): Promise<Schedule> => {
  const response = await instance.get<Schedule>(`/scheduler/${scheduleId}`);
  return response.data;
};
