import { useState, useCallback } from "react";
import { type CrawlingMessage } from "../Types/WebSocket";

/**
 * 크롤링 진행 상태(progress, count) 관리 훅
 * - WebSocket 메시지를 통해 백엔드에서 계산된 진행 상태를 저장하고 업데이트
 */

export interface CrawlingProgress {
  progress: number;
  state?: string;
  totalCount?: number;
  collectCount?: number;
  failCount?: number;
  expectEndAt?: string;
  endAt?: string; // 수집완료 시간 (크롤링 완료 시 웹소켓으로 전송됨)
}

// progressmap : workId로 여러 개의 크롤링 작업 동시 관리(workId:number)하기 위해
export type ProgressMap = Map<number, CrawlingProgress>;

const useCrawlingProgress = () => {
  const [progressMap, setProgressMap] = useState<ProgressMap>(new Map());

  // WebSocket 메시지 처리 (백엔드에서 계산된 crawlingmessage 받아서 progressmap 업데이트))
  const handleCrawlingProgress = useCallback((message: CrawlingMessage) => {
    setProgressMap((prevMap) => {
      const newMap = new Map(prevMap);
      const { workId, data } = message;
      console.log(data);
      // 업데이트 전의 현재 진행 상태 (없으면 기본값 사용)
      const currentProgress = newMap.get(workId) || {
        progress: 0,
        state: "대기중",
        totalCount: 0,
        collectCount: 0,
        failCount: 0,
        expectEndAt: "계산 중...",
      };

      // 백엔드에서 계산된 집계 데이터로 업데이트
      newMap.set(workId, {
        ...currentProgress,
        ...data,
      });

      return newMap;
    });
  }, []);

  // 상태 초기화 (workId 지정 시 해당 작업만, 미지정 시 전체)
  const resetCrawlingState = useCallback((workId?: number) => {
    if (workId) {
      setProgressMap((prevMap) => {
        const newMap = new Map(prevMap);
        newMap.delete(workId);
        return newMap;
      });
    } else {
      setProgressMap(new Map());
    }
  }, []);

  return {
    progressMap,
    handleCrawlingProgress,
    resetCrawlingState,
  };
};

export default useCrawlingProgress;
