/* STOMP over WebSocket 기반 실시간 크롤링 상태 관리
 자동 재연결, JWT 인증, 사용자별 큐 구독 지원*/

import { create } from "zustand";
import SockJS from "sockjs-client";
import * as Stomp from "stompjs";
import { useAuthStore } from "./authStore";

// WebSocket 연결 상태
export const ReadyState = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
  UNINSTANTIATED: 4,
} as const;

export type ReadyState = (typeof ReadyState)[keyof typeof ReadyState];

// 스토어 상태 타입
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

  // WebSocket 연결
  connect: (url: string) => {
    const {
      stompClient,
      readyState,
      reconnectAttempts,
      maxReconnectAttempts,
      reconnectTimeoutId,
    } = get();

    if (reconnectTimeoutId) {
      clearTimeout(reconnectTimeoutId);
      set({ reconnectTimeoutId: null });
    }

    if (readyState === ReadyState.OPEN || readyState === ReadyState.CONNECTING)
      return;

    if (reconnectAttempts >= maxReconnectAttempts) {
      console.warn("[WebSocket] 최대 재연결 시도 횟수 초과");
      set({ readyState: ReadyState.CLOSED });
      return;
    }

    if (stompClient) {
      stompClient.disconnect(() => {
        set({ stompClient: null, readyState: ReadyState.UNINSTANTIATED });
      });
    }

    set({ readyState: ReadyState.CONNECTING });

    const accessToken = useAuthStore.getState().accessToken;
    const headers = accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : {};

    const socket = new SockJS(url);
    const newStompClient = Stomp.over(socket);
    newStompClient.debug = () => {};

    newStompClient.connect(
      headers,
      () => {
        console.log("[WebSocket] 연결 성공");
        set({
          readyState: ReadyState.OPEN,
          stompClient: newStompClient,
          reconnectAttempts: 0,
        });
      },
      (error) => {
        console.error("[WebSocket] 연결 오류", error);

        set((state) => {
          const nextAttempts = state.reconnectAttempts + 1;
          const delay = Math.min(1000 * Math.pow(2, nextAttempts), 30000);

          if (nextAttempts < state.maxReconnectAttempts) {
            console.log(`[WebSocket] ${delay / 1000}초 후 재연결 시도...`);
            const timeoutId = setTimeout(() => get().connect(url), delay);
            return {
              readyState: ReadyState.CLOSED,
              stompClient: null,
              reconnectAttempts: nextAttempts,
              reconnectTimeoutId: timeoutId,
            };
          } else {
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

  // 연결 해제
  disconnect: () => {
    const { stompClient, reconnectTimeoutId } = get();
    if (reconnectTimeoutId) clearTimeout(reconnectTimeoutId);

    if (stompClient?.connected) {
      stompClient.disconnect(() => {
        set({
          readyState: ReadyState.CLOSED,
          stompClient: null,
          reconnectAttempts: 0,
        });
        console.log("[WebSocket] 연결 종료");
      });
    } else {
      set({
        readyState: ReadyState.CLOSED,
        stompClient: null,
        reconnectAttempts: 0,
      });
    }
  },

  // 구독
  subscribe: (destination, callback) => {
    const { stompClient, readyState } = get();
    if (!stompClient?.connected || readyState !== ReadyState.OPEN) {
      console.warn("[WebSocket] 연결되지 않아 구독 불가");
      return undefined;
    }
    return stompClient.subscribe(destination, callback);
  },
}));

export default useWebSocketStore;
