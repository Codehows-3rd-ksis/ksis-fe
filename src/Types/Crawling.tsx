/**
 * @file Crawling.tsx
 * @description 크롤링 관련 서버 데이터 모델 (DTO) 정의
 * 서버/웹소켓에서 내려오는 원본 데이터의 형상을 정의합니다.
 */

// 수집된 데이터 행 (DB Row)
export interface CollectionRow {
  id: number;
  progressNo: string;
  [key: string]: any; // 동적 컬럼 대응
}

// 수집 실패 데이터 행
export interface FailureRow {
  id: number;
  progressNo: string;
  url: string;
}

// 웹소켓으로 수신되는 크롤링 메시지 프로토콜
export type CrawlingMessage =
  | {
      type: "PROGRESS";
      workId: number;
      totalCount: number;
      estimatedTime: string;
    }
  | {
      type: "COLLECTION";
      workId: number;
      row?: CollectionRow;
    }
  | {
      type: "FAILURE";
      workId: number;
      row?: FailureRow;
    }
  | {
      type: "COMPLETE";
      workId: number;
    };
