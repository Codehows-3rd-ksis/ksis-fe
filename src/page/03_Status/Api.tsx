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

const BASE_URL = import.meta.env.VITE_API_URL;
if (!BASE_URL) {
  throw new Error("VITE_API_URL 환경 변수가 설정되지 않았습니다.");
}

// ==================== 수집 현황 관련 API ====================

/**
 * 수집 현황 목록 조회
 * @returns 진행 중인 수집 현황 목록
 */
export const getStatusList = async (): Promise<StatusTableRows[]> => {
  const response = await AxiosInstance.get(`/status`);
  return response.data;
};

/**
 * 수집 현황 상세 조회
 * @param workId -작업Id
 * @returns 수집 현황 상세 정보 (기본정보, 실패목록, 수집데이터)
 */
export const getStatusDetail = async (
  workId: number
): Promise<StatusDetailResponse> => {
  const response = await axios.get(
    `${BASE_URL}/status/detail/${workId}`, //url경로에 파라미터 전달, 조회용
    getAxiosConfig()
  );
  return response.data;
};

/**
 * 수집 중지
 * @param workId -작업Id
 * @returns 중지 결과
 */
export const stopCrawl = async (workId: number) => {
  const response = await axios.post(
    `${BASE_URL}/crawl/stop`,
    { workId }, //요청 본문(body)에 포함, 실행 제어용
    getAxiosConfig()
  );
  return response.data;
};
