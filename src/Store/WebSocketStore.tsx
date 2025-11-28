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
import { useAuthStore } from "./authStore";

/**
 * WebSocket 연결 상태
 */
export const ReadyState = {
  CONNECTING: 0, // 연결 시도 중
  OPEN: 1, // 연결 성공
  CLOSING: 2, // 연결 종료 중
  CLOSED: 3, // 연결 끊김
  UNINSTANTIATED: 4, // 초기 상태
} as const;

export type ReadyState = (typeof ReadyState)[keyof typeof ReadyState];

// 기본 타입 정의
interface CollectionRow {
  id: number;
  progressNo: string;
  [key: string]: any; // 동적 필드 (title, writer 등)
}

interface FailureRow {
  id: number;
  progressNo: string;
  url: string;
}

// Union 타입
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
      row?: CollectionRow; // 단일 데이터(크롤링 진행중)
      rows?: CollectionRow[]; // 일괄 데이터(초기로딩, 재연결)
    }
  | {
      type: "FAILURE";
      workId: number;
      failure?: FailureRow; // 단일 실패
      rows?: FailureRow[]; // 일괄 실패
    }
  | {
      type: "COMPLETE";
      workId: number;
    };

interface WebSocketState {
  stompClient: Stomp.Client | null;
  readyState: ReadyState;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
  reconnectTimeoutId: NodeJS.Timeout | null;

  connect: (url: string) => void;
  disconnect: () => void;
  subscribe: (
    destination: string,
    callback: (message: Stomp.Message) => void
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
    // 기존 stompClient가 있으면 무조건 정리
    if (stompClient) {
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
    const accessToken = useAuthStore.getState().accessToken;
    const headers: { [key: string]: string } = accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : {};

    // SockJS 연결 생성
    const socket = new SockJS(url);
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
      (error: string | Stomp.Frame) => {
        // 에러 타입에 따라 상세 로그 출력
        if (typeof error === "string") {
          console.error(`[WebSocket] 연결 오류: ${error}`);
        } else if (error instanceof Stomp.Frame) {
          console.error(`[WebSocket] STOMP 에러: ${error.body}`);
        } else {
          console.error("[WebSocket] 연결 오류:", error);
        }

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
            console.warn("[WebSocket] 최대 재연결 시도 횟수 도달");
            return {
              readyState: ReadyState.CLOSED,
              stompClient: null,
              reconnectAttempts: nextAttempts,
              reconnectTimeoutId: null,
            };
          }
        });
      }
    );
  },

  disconnect: () => {
    const { stompClient, reconnectTimeoutId } = get();

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
   * STOMP 목적지 구독
   * @param destination - 구독할 경로 (예: /user/queue/crawling/123)
   * @param callback - 메시지 수신 콜백
   * @returns STOMP 구독 객체
   */
  subscribe: (
    destination: string,
    callback: (message: Stomp.Message) => void
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

    console.log(`[WebSocket] 구독 시작: ${destination}`);
    return stompClient.subscribe(destination, callback);
  },
}));

export default useWebSocketStore;
