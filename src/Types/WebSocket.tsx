/**
 * @file WebSocket.tsx
 * @description WebSocket 메시지 프로토콜 타입 정의
 */

import { type CrawlingProgress } from "../hooks/useCrawlingProgress";

// 웹소켓으로 수신되는 크롤링 메시지 프로토콜
// 크롤링 항목 1개 처리 시마다 전송되며, 집계 데이터 + 개별 항목을 함께 포함
export interface CrawlingMessage {
  type: "COLLECT_UPDATE";
  workId: number;
  data: Partial<CrawlingProgress>; // CrawlWork 엔티티 집계 데이터 (collectCount, failCount, progress, expectEndAt 등)
  crawlResultItem?: {
    id: number;
    itemId: number;
    seq: number;
    resultValue: any;
    state: "SUCCESS" | "FAILURE";
    url?: string;
    [key: string]: any;
  }; // 방금 처리된 CrawlResultItem (state로 성공/실패 구분)
}
