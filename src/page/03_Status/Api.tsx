import axios from "axios";
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

// 공통 axios config
const getAxiosConfig = () => ({
  headers: { "Content-Type": "application/json" },
});

// ==================== 수집 현황 관련 API ====================

/**
 * 수집 현황 목록 조회
 * @returns 진행 중인 수집 현황 목록
 */
export const getStatusList = async (): Promise<StatusTableRows[]> => {
  const response = await axios.get(`${BASE_URL}/status`, getAxiosConfig());
  return response.data;
};

/**
 * 수집 현황 상세 조회
 * @param id - 수집 설정 ID
 * @returns 수집 현황 상세 정보 (기본정보, 실패목록, 수집데이터)
 */
export const getStatusDetail = async (
  id: number
): Promise<StatusDetailResponse> => {
  const response = await axios.get(
    `${BASE_URL}/status/${id}`,
    getAxiosConfig()
  );
  return response.data;
};

/**
 * 수집 중지
 * @param settingId - 중지할 수집 설정 ID
 * @returns 중지 결과
 */
export const stopCrawl = async (settingId: number) => {
  const response = await axios.post(
    `${BASE_URL}/crawl/stop`,
    { settingId },
    getAxiosConfig()
  );
  return response.data;
};

// ==================== WebSocket 연결 (실시간 수집 현황) ====================

/**
 * WebSocket 연결 생성 - 수집 현황 실시간 업데이트
 * @param settingId - 수집 설정 ID
 * @param onMessage - 메시지 수신 시 콜백
 * @returns WebSocket 인스턴스
 *
 * 수신 데이터 형식:
 * - type: 'failure' - 실패 목록 업데이트
 *   { type: 'failure', rows: [{ id, progressNo, url }] }
 * - type: 'collection' - 수집 데이터 업데이트
 *   { type: 'collection', rows: [{ id, progressNo, ...dynamic fields }] }
 * - type: 'progress' - 진행률 업데이트
 *   { type: 'progress', totalCount, collectionCount, failureCount, estimatedTime }
 */
interface WebSocketMessage {
  type: "failure" | "collection" | "progress";
  rows?: Array<any>;
  totalCount?: number;
  collectionCount?: number;
  failureCount?: number;
  estimatedTime?: string;
}
export const createStatusWebSocket = (
  settingId: number,
  options: {
    onMessage: (data: WebSocketMessage) => void;
    onError?: (error: Event) => void;
    onClose?: () => void;
  }
) => {
  const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8080";
  const ws = new WebSocket(`${WS_URL}/status/${settingId}`);

  ws.onopen = () => {
    console.log("WebSocket 연결 성공:", settingId);
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (error) {
      console.error("WebSocket 메시지 파싱 오류:", error);
    }
  };

  ws.onerror = (error) => {
    console.error("WebSocket 오류:", error);
    options.onError?.(error);
  };

  ws.onclose = () => {
    console.log("WebSocket 연결 종료:", settingId);
    options.onClose?.();
  };

  return ws;
};
