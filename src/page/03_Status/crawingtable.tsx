import { useState, useEffect, useCallback, useRef } from "react";
import { startCrawling as apiStartCrawling } from "../../API/crawlingApi";
import useWebSocketStore, {
  ReadyState,
  type CrawlingMessage,
} from "../../Store/WebSocketStore";
import useCrawlingData from "../../hooks/useCrawling";
import type { Subscription } from "stompjs";
import { useAuthStore } from "../../Store/authStore";

const readyStateTextMap: { [key in ReadyState]: string } = {
  [ReadyState.CONNECTING]: "CONNECTING",
  [ReadyState.OPEN]: "OPEN",
  [ReadyState.CLOSING]: "CLOSING",
  [ReadyState.CLOSED]: "CLOSED",
  [ReadyState.UNINSTANTIATED]: "UNINSTANTIATED",
};

const CrawlingTable: React.FC = () => {
  const userId = useAuthStore((state) => state.user?.userId);
  const subscriptionRef = useRef<Subscription | undefined>(undefined);

  const { readyState, connect, subscribe } = useWebSocketStore();

  const { progressMap, handleWebSocketMessage, resetCrawlingState } =
    useCrawlingData();

  const [isCrawling, setIsCrawling] = useState(false);

  const setupWebSocketConnection = useCallback(() => {
    if (
      userId &&
      (readyState === ReadyState.UNINSTANTIATED ||
        readyState === ReadyState.CLOSED)
    ) {
      const protocol = window.location.protocol;
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      connect(wsUrl);
    }
  }, [userId, connect, readyState]);

  useEffect(() => {
    setupWebSocketConnection();
  }, [setupWebSocketConnection]);

  useEffect(() => {
    if (readyState === ReadyState.OPEN && userId && !subscriptionRef.current) {
      const destination = `/user/queue/crawling-progress`;
      subscriptionRef.current = subscribe(destination, (message) => {
        const parsedMessage: CrawlingMessage = JSON.parse(message.body);
        handleWebSocketMessage(parsedMessage);
        if (parsedMessage.type === "COMPLETE") {
          setIsCrawling(false);
        }
      });
    }

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = undefined;
      }
    };
  }, [readyState, userId, subscribe, handleWebSocketMessage]);

  const handleStartCrawling = async () => {
    resetCrawlingState();
    setIsCrawling(true);
    try {
      await apiStartCrawling();
    } catch (error) {
      console.error("크롤링 시작 실패:", error);
      setIsCrawling(false);
    }
  };

  return (
    <div className="crawling-test-container">
      <h2>WebSocket Crawling Test</h2>
      <p>
        WebSocket Status: <strong>{readyStateTextMap[readyState]}</strong>
      </p>

      <button
        onClick={handleStartCrawling}
        disabled={isCrawling || readyState !== ReadyState.OPEN || !userId}
      >
        {isCrawling ? "크롤링 중..." : "크롤링 시작"}
      </button>
      {readyState !== ReadyState.OPEN && (
        <p style={{ color: "red" }}>WebSocket이 연결되지 않았습니다.</p>
      )}

      {Array.from(progressMap.entries()).map(([workId, progressData]) => (
        <div key={workId} style={{ marginTop: "10px" }}>
          <h4>Work ID: {workId}</h4>
          <progress value={progressData.progress} max="100"></progress>
          <span>{Math.floor(progressData.progress)}%</span>
          <p>State: {progressData.state}</p>
        </div>
      ))}
    </div>
  );
};

export default CrawlingTable;
