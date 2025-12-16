import AxiosInstance from "./AxiosInstance";

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
  progress?: string; // 진행도
}

// 상세 조회 응답 타입
export interface StatusDetailResponse {
  basicInfo: StatusTableRows;
  failureList: Array<{ itemId: number; seq: number; url: string }>;
  collectionData: {
    columns: Array<{ field: string; headerName: string }>;
    rows: Array<{
      itemId: number;
      seq: number;
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
  const response = await AxiosInstance.get(`/status`);
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
  const response = await AxiosInstance.get(`/status/detail/${workId}`);
  return response.data;
};

/**
 수집 중지
 @param workId 작업 ID
 @returns 중지 결과
 */

export const stopCrawl = async (workId: number): Promise<StopCrawlResponse> => {
  const response = await AxiosInstance.post(`/crawl/stop`, { workId });
  return response.data;
};