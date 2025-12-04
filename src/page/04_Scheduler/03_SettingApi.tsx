/**
 * @file 03_SettingApi.tsx
 * @description 데이터 수집 설정 관련 API 호출
 */

import instance from "../../API/AxiosInstance";

/**
 * 설정 데이터 인터페이스
 */
export interface Setting {
  id: number;
  settingName: string;
  url: string;
  userAgent: string;
  type?: string;
  rate?: number;
  listArea?: string;
  pagingArea?: string;
  maxPage?: number;
  linkArea?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 설정 목록 조회
 */
export const getSettings = async (): Promise<Setting[]> => {
  const response = await instance.get<Setting[]>("/setting");
  return response.data;
};
