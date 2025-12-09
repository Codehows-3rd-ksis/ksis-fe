import { useState, useCallback } from "react";
import { type CrawlingMessage } from "../Types/Crawling";

/**
 * 크롤링 진행 상태(progress, count) 관리 훅
 * - WebSocket 메시지를 통해 진행률과 카운트를 계산
 * - 실제 데이터(row)는 저장하지 않음 (가벼운 상태 관리)
 */

export interface CrawlingProgress {
  progress: number;
  state: string;
  totalCount: number;
  collectionCount: number;
  failureCount: number;
  estimatedTime: string;
}

// workId로 여러 개의 크롤링 작업 동시 관리(workId:number)
export type ProgressMap = Map<number, CrawlingProgress>;

const useCrawlingProgress = () => {
  const [progressMap, setProgressMap] = useState<ProgressMap>(new Map());

  // WebSocket 메시지 처리 (진행률 및 카운트 계산)
  const handleWebSocketMessage = useCallback((message: CrawlingMessage) => {
    setProgressMap((prevMap) => {
      const newMap = new Map(prevMap);
      const { workId } = message;

      const currentProgress = newMap.get(workId) || {
        progress: 0,
        state: "대기중",
        totalCount: 0,
        collectionCount: 0,
        failureCount: 0,
        estimatedTime: "",
      };

      switch (message.type) {
        // 진행 정보 업데이트
        case "PROGRESS": {
          newMap.set(workId, {
            ...currentProgress,
            totalCount: message.totalCount,
            estimatedTime: message.estimatedTime,
            state: "진행중",
          });
          break;
        }

        // 수집 성공 (카운트 증가, 진행률 재계산)
        case "COLLECTION": {
          const addedCount = message.row ? 1 : 0;
          const collectionCount = currentProgress.collectionCount + addedCount;

          // 진행률 = (성공 + 실패) / 전체
          const totalProcessed = collectionCount + currentProgress.failureCount;
          const rawProgress =
            currentProgress.totalCount > 0
              ? (totalProcessed / currentProgress.totalCount) * 100
              : 0;

          newMap.set(workId, {
            ...currentProgress,
            collectionCount,
            progress: Math.min(rawProgress, 100),
            state: "진행중",
          });
          break;
        }

        // 수집 실패 (실패 카운트 증가, 진행률 재계산)
        case "FAILURE": {
          const addedFailure = message.row ? 1 : 0;
          const failureCount = currentProgress.failureCount + addedFailure;

          // 진행률 = (성공 + 실패) / 전체
          const totalProcessed = currentProgress.collectionCount + failureCount;
          const rawProgress =
            currentProgress.totalCount > 0
              ? (totalProcessed / currentProgress.totalCount) * 100
              : 0;

          newMap.set(workId, {
            ...currentProgress,
            failureCount,
            progress: Math.min(rawProgress, 100),
            state: "진행중",
          });
          break;
        }

        // 작업 완료
        case "COMPLETE": {
          newMap.set(workId, {
            ...currentProgress,
            progress: 100,
            state: "완료",
          });
          break;
        }
      }
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
    handleWebSocketMessage,
    resetCrawlingState,
  };
};

export default useCrawlingProgress;
