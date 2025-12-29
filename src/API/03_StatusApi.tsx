import instance from "./AxiosInstance";

export interface StatusTableRows {
  // 기본 정보
  id: number;
  seq: number;
  workId: number;
  settingId?: number;
  settingName?: string;
  type?: string;
  userId?: string;

  // 스케줄링 설정 (고정값)
  startDate?: string; // 스케줄 시작 날짜
  endDate?: string; // 스케줄 종료 날짜
  period?: string; // startDate ~ endDate
  cycle?: string; // 수집 주기

  // 실행 정보 (실시간)
  startAt?: string; // 수집시작
  endAt?: string; // 수집완료
  state?: string; // 진행 상태
  progress?: number; // 진행도
}

// 상세 조회 백엔드 응답 타입
export interface StatusDetailResponse {
  basicInfo: StatusTableRows;

  failureList: Array<{ itemId: number; seq: number; url: string }>;

  collectionData: {
    rows: Array<{
      itemId: number;
      seq: number;
      state: "SUCCESS" | "FAILED";
      resultValue: string;
      [key: string]: any;
    }>;
  };

  progress: {
    totalCount: number;
    collectCount: number;
    failCount: number;
    expectEndAt: string;
  };
}

// 수집 중지 응답 타입
export interface StopCrawlResponse {
  success: boolean;
  message?: string;
}

/**
 수집 현황 목록 조회
 @returns 진행 중인 수집 현황 목록
 */

export const getStatusList = async (): Promise<StatusTableRows[]> => {
  const response = await instance.get(`/status`);
  return response.data;
};

/**
 수집 현황 상세 조회
 @param workId 작업 ID
 @returns 수집 현황 상세 정보 (기본정보, 실패목록, 수집데이터, 진행률)
 */

export const getStatusDetail = async (
  workId: number
): Promise<StatusDetailResponse> => {
  const response = await instance.get(`/status/detail/${workId}`);
  return response.data;
};

/**
 수집 중지
 @param workId 작업 ID
 @returns 중지 결과
 */

// export const stopCrawl = async (workId: number): Promise<StopCrawlResponse> => {
export const stopCrawl = async (workId: number) => {
  const response = await instance.put(`/crawl/stop/${workId}`);
  return response.data;
};

// /**
//  * 일괄 재수집
//  * @param workId 작업 ID
//  * @returns 재수집 결과
//  */
// export const recollectWork = async (workId: number): Promise<any> => {
//   const response = await instance.post(`/recollect/work/${workId}`);
//   return response.data;
// };

// /**
//  * 개별 재수집
//  * @param itemId 항목 ID
//  * @returns 재수집 결과
//  */
// export const recollectItem = async (itemId: number): Promise<any> => {
//   const response = await instance.post(`/recollect/item/${itemId}`);
//   return response.data;
// };
