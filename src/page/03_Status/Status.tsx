import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import CommonTable from "../../component/CommonTable";
import { getColumns } from "../../Types/TableHeaders/StatusHeader";
import Alert from "../../component/Alert";
import {
  type StatusTableRows,
  getStatusList,
  stopCrawl,
} from "../../API/03_StatusApi";
import type { Subscription } from "stompjs";

import useWebSocketStore, { ReadyState } from "../../Store/WebSocketStore";
import { type CrawlingMessage } from "../../Types/WebSocket";
import { useAuthStore } from "../../Store/authStore";
import useCrawlingProgress from "../../hooks/useCrawlingProgress";

function Status() {
  const navigate = useNavigate();
  const userId = useAuthStore((state) => state.user?.userId);
  const userRole = useAuthStore((state) => state.user?.role);
  const { readyState, connect, subscribe } = useWebSocketStore();
  const { progressMap, handleCrawlingProgress, resetCrawlingState } =
    useCrawlingProgress();
  const subscriptionRef = useRef<Subscription | undefined>(undefined);

  // 데이터 State
  const [baseRows, setBaseRows] = useState<StatusTableRows[]>([]);
  const [displayRows, setDisplayRows] = useState<StatusTableRows[]>([]);

  // UI State
  const [alertOpen, setAlertOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<StatusTableRows | null>(null);

  // 현황 목록 조회 API
  const fetchStatusList = useCallback(async () => {
    console.log("API 호출 시작");
    try {
      const data = await getStatusList();
      console.log("API 응답:", data);
      const result = data.map((row: StatusTableRows) => ({
        ...row,
        id: row.workId,
      }));
      setBaseRows(result);
      console.log("baseRows 업데이트 완료");
    } catch (error) {
      alert("수집 현황 목록을 불러오는 데 실패했습니다.");
      console.error("수집 현황 목록 조회 실패:", error);
    }
  }, []);

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

  // 컬럼 정의
  const columns = getColumns({ handleDetailOpen, handleStopClick });

  // API 응답(baseRows)과 웹소켓(progressMap) 상태 동기화
  // 완료되거나 없어진 작업을 progressMap에서 제거
  useEffect(() => {
    if (baseRows.length === 0) return; // baseRows가 아직 로드되지 않았으면 실행하지 않음

    const validWorkIds = new Set(baseRows.map((row) => row.workId)); //baseRows에서 유효한 작업id목록 추출
    progressMap.forEach((_, workId) => {
      if (!validWorkIds.has(workId)) {
        resetCrawlingState(workId); //progressMap에 없으면 메모리에서 제거
      }
    });

    setDisplayRows([
      ...baseRows.map((row) => {
        const progressInfo = progressMap.get(row.workId);
        if (!progressInfo) return row;

        //workid 있으면 progress, state 업데이트
        return {
          ...row,
          progress: progressInfo.progress,
          state: progressInfo.state,
        };
      }),
    ]);
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseRows, progressMap]);

  // useEffect(() => {
  //   console.log(displayRows);
  // }, [displayRows]);

  // 초기 데이터 로드
  useEffect(() => {
    console.log("[useEffect] fetchStatusList 실행됨");
    fetchStatusList();
  }, [fetchStatusList]);

  // WebSocket 연결
  useEffect(() => {
    if (userId) {
      connect(import.meta.env.VITE_WS_URL || "http://localhost:8080/ws");
    }
  }, [userId, connect]);

  // WebSocket 구독 (크롤링 진행 상태)
  useEffect(() => {
    if (readyState === ReadyState.OPEN && userId && !subscriptionRef.current) {
      // 역할에 따라 구독 경로 분기
      const destination =
        userRole === "ROLE_ADMIN"
          ? `/topic/crawling-progress` // 관리자: 공개 토픽 (모든 크롤링 작업)
          : `/user/queue/crawling-progress`; // 일반 유저: 개인 큐 (자신의 작업만)

      console.log(`[WebSocket] 구독 시작: ${destination}`);
      subscriptionRef.current = subscribe(destination, (message) => {
        const crawlingMessage: CrawlingMessage = JSON.parse(message.body);

        handleCrawlingProgress({
          workId: crawlingMessage.workId,
          data: { progress: crawlingMessage.progress },
        } as CrawlingMessage);

        setBaseRows((prevRows) => {
          const exists = prevRows.some(
            (row) => row.workId === crawlingMessage.workId
          );
          if (!exists) {
            console.log(
              `[Status] 신규 작업 감지 (ID: ${crawlingMessage.workId}) -> 목록 갱신 요청`
            );
            fetchStatusList();
          }

          baseRows.map((row) => {
            const progressInfo = progressMap.get(row.workId);
            if (!progressInfo) return row;

            //workid 있으면 progress, state 업데이트
            return {
              ...row,
              progress: progressInfo.progress,
              state: progressInfo.state,
            };
          });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readyState, subscribe]);

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        color: "black",
      }}
    >
      <Typography
        sx={{
          fontSize: 60,
          fontWeight: "bold",
          color: "black",
          paddingLeft: 2,
          marginTop: 5,
        }}
      >
        데이터 수집 현황
      </Typography>
      <Box
        sx={{
          padding: 2,
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
        }}
      >
        <Box sx={{ marginTop: 13 }}>
          <CommonTable columns={columns} rows={displayRows} />
        </Box>
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
