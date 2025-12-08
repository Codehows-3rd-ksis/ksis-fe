import AxiosInstance from "../../API/AxiosInstance";
import { type StatusTableRows } from "../../Types/TableHeaders/StatusHeader";

// 상세 조회 응답 타입
export interface StatusDetailResponse {
  basicInfo: StatusTableRows;
  failureList: Array<{ id: number; progressNo: string; url: string }>;
  collectionData: {
    columns: Array<{ field: string; headerName: string }>;
    rows: Array<{ id: number; progressNo: string; [key: string]: any }>;
  };
  progress: {
    totalCount: number;
    collectionCount: number;
    failureCount: number;
    estimatedTime: string;
  };
}

// 수집 중지 응답 타입
export interface StopCrawlResponse {
  success: boolean;
  message?: string;
}

// ==================== 수집 현황 관련 API ====================

/**
 * 수집 현황 목록 조회
 * @returns 진행 중인 수집 현황 목록

 */
export const getStatusList = async (): Promise<StatusTableRows[]> => {
  // try {
  const response = await AxiosInstance.get(`/status`);
  return response.data;
  // } catch (error) {
  //   console.error("수집 현황 목록 조회 실패:", error);
  //   throw new Error("수집 현황 목록을 불러오는 데 실패했습니다.");
  // }
};

/**
 * 수집 현황 상세 조회
 * @param workId 작업 ID
 * @returns 수집 현황 상세 정보 (기본정보, 실패목록, 수집데이터, 진행률)

 */
export const getStatusDetail = async (
  workId: number
): Promise<StatusDetailResponse> => {
  // try {
  const response = await AxiosInstance.get(`/status/detail/${workId}`);
  return response.data;
  // } catch (error) {
  //   console.error(`수집 현황 상세 조회 실패 (workId: ${workId}):`, error);
  //   throw new Error("수집 현황 상세 정보를 불러오는 데 실패했습니다.");
  // }
};

/**
 * 수집 중지
 * @param workId 작업 ID
 * @returns 중지 결과

 */
export const stopCrawl = async (workId: number): Promise<StopCrawlResponse> => {
  // try {
  const response = await AxiosInstance.post(`/crawl/stop`, { workId });
  return response.data;
  // } catch (error) {
  //   console.error(`수집 중지 요청 실패 (workId: ${workId}):`, error);
  //   throw new Error("수집 중지 요청에 실패했습니다.");
  // }
};
