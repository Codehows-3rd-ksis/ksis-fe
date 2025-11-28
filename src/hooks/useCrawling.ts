import { useState, useCallback } from "react";
import { type CrawlingMessage } from "../Store/WebSocketStore";

// 각 크롤링 작업의 진행 상태를 저장하는 인터페이스
export interface CrawlingProgress {
  progress: number; // 진행률 (0-100)
  state: string; // 상태 메시지 (예: "진행중", "완료")
  totalCount: number;
  collectionCount: number;
  failureCount: number;
  estimatedTime: string;
}

// 여러 크롤링 작업의 진행 상태를 workId를 키로 하여 저장하는 맵
export type ProgressMap = Map<number, CrawlingProgress>;

const useCrawlingData = () => {
  const [progressMap, setProgressMap] = useState<ProgressMap>(new Map());

  const handleWebSocketMessage = useCallback((message: CrawlingMessage) => {
    setProgressMap((prevMap) => {
      const newMap = new Map(prevMap);
      const { workId } = message;

      // 이전 상태를 가져오거나 새로 초기화
      const currentProgress = newMap.get(workId) || {
        progress: 0,
        state: "대기중",
        totalCount: 0,
        collectionCount: 0,
        failureCount: 0,
        estimatedTime: "",
      };

      switch (message.type) {
        case "PROGRESS": {
          newMap.set(workId, {
            ...currentProgress,
            totalCount: message.totalCount,
            estimatedTime: message.estimatedTime,
            state: "진행중",
          });
          break;
        }

        case "COLLECTION": {
          const collectionCount = currentProgress.collectionCount + (message.row ? 1 : message.rows?.length || 0);
          const totalCount = currentProgress.totalCount;
          const progress =
            totalCount > 0 ? (collectionCount / totalCount) * 100 : 0;
          
          newMap.set(workId, {
            ...currentProgress,
            collectionCount,
            progress: Math.min(progress, 100), // 100%를 넘지 않도록
            state: "진행중",
          });
          break;
        }
        
        case "FAILURE": {
            const failureCount = currentProgress.failureCount + (message.failure ? 1 : message.rows?.length || 0);
            newMap.set(workId, {
                ...currentProgress,
                failureCount,
            });
            break;
        }

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

  const resetCrawlingState = useCallback((workId?: number) => {
    if (workId) {
        setProgressMap(prevMap => {
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

export default useCrawlingData;
