import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Paper } from "@mui/material";
import CommonTable from "../../component/CommonTable";
import {
  getColumns,
  type StatusTableRows,
} from "../../Types/TableHeaders/StatusHeader";
import Alert from "../../component/Alert";
import { getStatusList, stopCrawl } from "./03_StatusApi";
import type { Subscription } from "stompjs";

import useWebSocketStore, { ReadyState } from "../../Store/WebSocketStore";
import { type CrawlingMessage } from "../../Types/Crawling";
import { useAuthStore } from "../../Store/authStore";
import useCrawlingProgress from "../../hooks/useCrawlingProgress";

function Status() {
  const navigate = useNavigate();
  const userId = useAuthStore((state) => state.user?.userId);
  const { readyState, connect, subscribe } = useWebSocketStore();
  const { progressMap, handleWebSocketMessage } = useCrawlingProgress();
  const subscriptionRef = useRef<Subscription | undefined>(undefined);

  // 데이터 State
  const [baseRows, setBaseRows] = useState<StatusTableRows[]>([]);

  // UI State
  const [alertOpen, setAlertOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<StatusTableRows | null>(null);

  // 현황 목록 조회 API
  const fetchStatusList = async () => {
    try {
      const data = await getStatusList();
      setBaseRows(data);
    } catch (error) {
      alert("수집 현황 목록을 불러오는 데 실패했습니다.");
      console.error("수집 현황 목록 조회 실패:", error);
    }
  };

  // 수집 중지 API
  const handleStopCrawl = async (row: StatusTableRows) => {
    try {
      await stopCrawl(row.workId);
      alert(`"${row.settingName}" 수집이 중지되었습니다.`);
      await fetchStatusList();
    } catch (error) {
      alert("수집 중지 요청에 실패했습니다.");
      console.error("수집 중지 요청 실패:", error);
    }
  };

  // 이벤트 핸들러
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

  // 컬럼 정의 및 데이터 가공 (실시간 진행률 병합)
  const columns = getColumns({ handleDetailOpen, handleStopClick });

  const displayRows = baseRows.map((row) => {
    const progressInfo = progressMap.get(row.workId);
    if (!progressInfo) return row;

    return {
      ...row,
      progress: progressInfo.progress,
      state: progressInfo.state,
    };
  });

  // 초기 데이터 로드
  useEffect(() => {
    fetchStatusList();
  }, []);

  // WebSocket 연결
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

  // WebSocket 구독 (크롤링 진행 상태)
  useEffect(() => {
    if (readyState === ReadyState.OPEN && userId && !subscriptionRef.current) {
      const destination = `/user/queue/crawling-progress`;
      subscriptionRef.current = subscribe(destination, (message) => {
        const parsedMessage: CrawlingMessage = JSON.parse(message.body);
        handleWebSocketMessage(parsedMessage);

        // 신규 작업 감지 시 목록 갱신
        const { workId } = parsedMessage;
        setBaseRows((prevRows) => {
          const exists = prevRows.some((row) => row.workId === workId);
          if (!exists) {
            console.log(
              `[Status] 신규 작업 감지 (ID: ${workId}) -> 목록 갱신 요청`
            );
            fetchStatusList();
          }
          return prevRows;
        });
      });
    }

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = undefined;
        console.log("[WebSocket] 구독 해제: Status Page");
      }
    };
  }, [readyState, userId, subscribe, handleWebSocketMessage]);

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
