import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Paper } from "@mui/material";
import CommonTable from "../../component/CommonTable";
import {
  getColumns,
  type StatusTableRows,
} from "../../Types/TableHeaders/StatusHeader";
import Alert from "../../component/Alert";
import { getStatusList, stopCrawl } from "./Api";
import type { Subscription } from "stompjs";

import useWebSocketStore, {
  ReadyState,
  type CrawlingMessage,
} from "../../Store/WebSocketStore";
import { useAuthStore } from "../../Store/authStore";
import useCrawlingData from "../../hooks/useCrawling";

function Status() {
  // ========== 1. 훅 선언 ==========
  const navigate = useNavigate();
  const userId = useAuthStore((state) => state.user?.userId);
  const { readyState, connect, subscribe } = useWebSocketStore();
  const { progressMap, handleWebSocketMessage } = useCrawlingData();
  const subscriptionRef = useRef<Subscription | undefined>(undefined);

  // ========== 2. State 선언 (데이터) ==========
  const [baseRows, setBaseRows] = useState<StatusTableRows[]>([]);

  // ========== 3. State 선언 (UI 상태) ==========
  const [alertOpen, setAlertOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<StatusTableRows | null>(null);

  // ========== 4. API 함수 ==========
  const handleStopCrawl = async (row: StatusTableRows) => {
    try {
      await stopCrawl(row.workId);
      console.log("수집 중지 성공:", row.settingName);
      fetchStatusList(); // 목록 새로고침
    } catch (error) {
      console.error("수집 중지 요청 중 오류:", error);
    }
  };

  const fetchStatusList = useCallback(async () => {
    try {
      const data = await getStatusList();
      setBaseRows(data);
    } catch (error) {
      console.error("수집 현황 목록 조회 실패:", error);
    }
  }, []);

  // ========== 5. 이벤트 핸들러 ==========
  const handleDetailOpen = (row: StatusTableRows) => {
    navigate(`/status/detail/${row.workId}`);
  };

  const handleStopClick = (row: StatusTableRows) => {
    setSelectedRow(row);
    setAlertOpen(true);
  };

  const handleConfirm = async () => {
    setAlertOpen(false);
    if (selectedRow) {
      await handleStopCrawl(selectedRow);
    }
  };

  const handleCancel = () => {
    setAlertOpen(false);
    setSelectedRow(null);
  };

  // ========== 6. 파생 데이터 ==========
  const columns = getColumns({ handleDetailOpen, handleStopClick });

  const displayRows = useMemo(() => {
    return baseRows.map((row) => {
      const progressInfo = progressMap.get(row.workId);
      if (progressInfo) {
        return {
          ...row,
          progress: progressInfo.progress, // 숫자형 진행률
          state: progressInfo.state, // 웹소켓에서 받은 최신 상태
        };
      }
      return row;
    });
  }, [baseRows, progressMap]);

  // ========== 7. useEffect ==========
  // API를 통해 기본 목록 데이터 로드
  useEffect(() => {
    fetchStatusList();
  }, [fetchStatusList]);

  // WebSocket 연결 설정
  const setupWebSocketConnection = useCallback(() => {
    if (
      userId &&
      (readyState === ReadyState.UNINSTANTIATED ||
        readyState === ReadyState.CLOSED)
    ) {
      const wsUrl = import.meta.env.VITE_WS_URL || `http://localhost:8080/ws`;
      connect(wsUrl);
    }
  }, [userId, connect, readyState]);

  useEffect(() => {
    setupWebSocketConnection();
  }, [setupWebSocketConnection]);

  // WebSocket 구독 설정
  useEffect(() => {
    if (readyState === ReadyState.OPEN && userId && !subscriptionRef.current) {
      const destination = `/user/queue/crawling-progress`;
      subscriptionRef.current = subscribe(destination, (message) => {
        const parsedMessage: CrawlingMessage = JSON.parse(message.body);
        handleWebSocketMessage(parsedMessage);
      });
    }

    // 클린업 함수에서 구독 해제
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = undefined;
        console.log("[WebSocket] 구독 해제: Status Page");
      }
    };
  }, [readyState, userId, subscribe, handleWebSocketMessage]);

  // ========== 8. JSX ==========
  return (
    <Box sx={{ height: "97%", display: "flex", flexDirection: "column" }}>
      <Typography
        sx={{
          fontSize: 60,
          fontWeight: "bold",
          color: "black",
          paddingLeft: 2,
          marginTop: 20,
        }}
      >
        데이터 수집 현황
      </Typography>
      <Box
        sx={{ padding: 2, flex: 1, display: "flex", flexDirection: "column" }}
      >
        <Paper
          elevation={3}
          sx={{ padding: 4, flex: 1, display: "flex", flexDirection: "column" }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              height: "100%",
            }}
          >
            <Box sx={{ padding: 2, marginTop: "auto", marginBottom: "auto" }}>
              <CommonTable columns={columns} rows={displayRows} />
            </Box>
          </Box>
        </Paper>
      </Box>

      <Alert
        open={alertOpen}
        type="question"
        text={`"${selectedRow?.settingName}"의 수집을 중지하시겠습니까?`}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </Box>
  );
}

export default Status;
