/**
 * @file useWebSocketStore.ts
 * @description STOMP over WebSocket을 사용한 실시간 크롤링 진행 상황 관리
 *
 * 주요 기능:
 * - 자동 재연결 (지수 백오프)
 * - JWT 인증
 * - 사용자별 개인 큐 구독
 * - 크롤링 작업별 구독 관리
 */

import { create } from "zustand";
import SockJS from "sockjs-client";
import * as Stomp from "stompjs";

/**
 * WebSocket 연결 상태
 */
export const enum ReadyState {
  CONNECTING = 0, // 연결 시도 중
  OPEN = 1, // 연결 성공
  CLOSING = 2, // 연결 종료 중
  CLOSED = 3, // 연결 끊김
  UNINSTANTIATED = 4, // 초기 상태
}

/**
 * 크롤링 진행 상황 메시지 타입
 */
export interface CrawlingMessage {
  type: "PROGRESS" | "COLLECTION" | "FAILURE" | "COMPLETE";
  workId: number;
  totalCount?: number;
  collectionCount?: number;
  failureCount?: number;
  estimatedTime?: string;
  row?: any;
  rows?: any[];
  failure?: any;
}

interface WebSocketState {
  stompClient: Stomp.Client | null;
  readyState: ReadyState;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
  reconnectTimeoutId: NodeJS.Timeout | null;

  connect: (url: string) => void;
  disconnect: () => void;
  subscribeCrawling: (
    workId: number,
    callback: (message: CrawlingMessage) => void
  ) => Stomp.Subscription | undefined;
}

const useWebSocketStore = create<WebSocketState>((set, get) => ({
  stompClient: null,
  readyState: ReadyState.UNINSTANTIATED,
  reconnectAttempts: 0,
  maxReconnectAttempts: 5,
  reconnectTimeoutId: null,

  connect: (url: string) => {
    const {
      stompClient,
      readyState,
      reconnectAttempts,
      maxReconnectAttempts,
      reconnectTimeoutId,
    } = get();

    // 기존 재연결 타이머 취소
    if (reconnectTimeoutId) {
      clearTimeout(reconnectTimeoutId);
      set({ reconnectTimeoutId: null });
    }

    // 이미 연결되어 있으면 return
    if (readyState === ReadyState.OPEN) {
      console.log("[WebSocket] 이미 연결되어 있습니다.");
      return;
    }

    if (readyState === ReadyState.CONNECTING) {
      console.log("[WebSocket] 연결 시도 중입니다.");
      return;
    }

    // 최대 재연결 시도 횟수 초과
    if (reconnectAttempts >= maxReconnectAttempts) {
      console.warn("[WebSocket] 최대 재연결 시도 횟수 초과");
      set({
        readyState: ReadyState.CLOSED,
      });
      return;
    }

    if (
      stompClient &&
      (readyState === ReadyState.CLOSED ||
        readyState === ReadyState.CLOSING ||
        !stompClient.connected)
    ) {
      stompClient.disconnect(() => {
        set({
          stompClient: null,
          readyState: ReadyState.UNINSTANTIATED,
        });
      });
    } else if (stompClient) {
      stompClient.disconnect(() => {
        set({
          stompClient: null,
          readyState: ReadyState.UNINSTANTIATED,
        });
      });
    }

    set({
      readyState: ReadyState.CONNECTING,
    });

    // JWT 토큰 가져오기 (localStorage에서)
    const accessToken = localStorage.getItem("accessToken");
    const headers: { [key: string]: string } = accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : {};

    // SockJS 연결 생성
    const socket = new SockJS(url, null, { headers });
    const newStompClient = Stomp.over(socket);

    // STOMP 디버그 로그 비활성화
    newStompClient.debug = () => {};

    // STOMP 연결
    // 첫 번째 인자인 headers는 STOMP CONNECT 프레임에 포함됩니다.
    newStompClient.connect(
      headers,
      // 연결 성공
      () => {
        console.log("[WebSocket] STOMP 연결 성공");
        set({
          readyState: ReadyState.OPEN,
          stompClient: newStompClient,
          reconnectAttempts: 0,
        });
      },
      (error: Stomp.Frame | CloseEvent) => {
        console.error("[WebSocket] 연결 오류:", error);

        set((state) => {
          const nextAttempts = state.reconnectAttempts + 1;
          const delay = Math.min(1000 * Math.pow(2, nextAttempts), 30000);

          if (nextAttempts < state.maxReconnectAttempts) {
            console.log(
              `[WebSocket] ${delay / 1000}초 후 재연결 시도 (${nextAttempts}/${
                state.maxReconnectAttempts
              })`
            );

            const timeoutId = setTimeout(() => get().connect(url), delay);

            return {
              readyState: ReadyState.CLOSED,
              stompClient: null,
              reconnectAttempts: nextAttempts,
              reconnectTimeoutId: timeoutId,
            };
          } else {
            console.error("[WebSocket] 최대 재연결 시도 횟수 도달");
            return {
              readyState: ReadyState.CLOSED,
              stompClient: null,
              reconnectAttempts: nextAttempts,
              reconnectTimeoutId: null,
            };
          }
        });

        // 에러 타입에 따라 상세 로그 출력
        if (error instanceof CloseEvent) {
          console.log(
            `>>>> [WebSocket] Connection closed due to error. Code: ${error.code}, Reason: ${error.reason}`
          );
        } else if (error instanceof Stomp.Frame) {
          console.log(`>>>> [WebSocket] STOMP error frame: ${error.body}`);
        }
      }
    );

    // 새로 생성된 stompClient 인스턴스를 스토어에 저장
    set({ stompClient: newStompClient });
  },

  disconnect: () => {
    const { stompClient, readyState, reconnectTimeoutId } = get();
    // 디버그 로그: console.log(`[WebSocketStore] disconnect called. Current ReadyState: ${readyState}`);

    // 재연결 타이머 취소
    if (reconnectTimeoutId) {
      clearTimeout(reconnectTimeoutId);
      set({ reconnectTimeoutId: null });
    }

    if (stompClient && stompClient.connected) {
      stompClient.disconnect(() => {
        set({
          readyState: ReadyState.CLOSED,
          stompClient: null,
          reconnectAttempts: 0,
        });
        console.log("[WebSocket] 연결 종료됨");
      });
    } else {
      set({
        readyState: ReadyState.CLOSED,
        stompClient: null,
        reconnectAttempts: 0,
      });
      console.log("[WebSocket] 연결 안 됨");
    }
  },

  /**
   * 특정 크롤링 작업 구독
   * @param workId - 작업ID
   * @param callback - 메시지 수신 콜백
   * @returns STOMP 구독 객체
   */
  subscribeCrawling: (
    workId: number,
    callback: (message: CrawlingMessage) => void
  ) => {
    const { stompClient, readyState } = get();

    if (
      !stompClient ||
      !stompClient.connected ||
      readyState !== ReadyState.OPEN
    ) {
      console.warn("[WebSocket] STOMP 클라이언트가 연결되지 않았습니다.");
      return undefined;
    }

    // 사용자별 개인 큐 구독 (중요: /user/queue/... 형식)
    // 백엔드에서 현재 인증된 사용자의 큐로만 메시지 전송
    const destination = `/user/queue/crawling/${workId}`;

    console.log(`[WebSocket] 구독 시작: ${destination}`);

    return stompClient.subscribe(destination, (message: Stomp.Message) => {
      try {
        const data: CrawlingMessage = JSON.parse(message.body);
        callback(data);
      } catch (error) {
        console.error("[WebSocket] 메시지 파싱 오류:", error);
      }
    });
  },
}));

export default useWebSocketStore;
