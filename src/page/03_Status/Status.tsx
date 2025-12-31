import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Container, Paper } from "@mui/material";
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
    useCrawlingProgress(); //"진행상황" 실시간 업데이트
  const subscriptionRef = useRef<Subscription | undefined>(undefined);

  // 데이터 State
  const [baseRows, setBaseRows] = useState<StatusTableRows[]>([]); // API 호출 데이터
  const [displayRows, setDisplayRows] = useState<StatusTableRows[]>([]); //API + Websocket 데이터

  // UI State
  const [alertOpen, setAlertOpen] = useState(false);
  const [openErrorAlert, setOpenErrorAlert] = useState(false);
  const [errorMsg, setErrorMsg] = useState("")
  const [alertStopResultOpen, setAlertStopResultOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<StatusTableRows | null>(null);

  // 현황 목록 조회 API
  const fetchStatusList = useCallback(async () => {
    try {
      const data = await getStatusList();

      const result = data.map((row: StatusTableRows) => ({
        ...row,
        id: row.workId,
      }));
      setBaseRows(result);
      console.log('result', result)
    } catch (error) {
      alert("수집 현황 목록을 불러오는 데 실패했습니다.");
      console.error("수집 현황 목록 조회 실패:", error);
    }
  }, []);

  // 수집 중지 API
  const handleStopCrawl = async (row: StatusTableRows) => {
    try {
      resetCrawlingState(row.workId);
      await stopCrawl(row.workId);
      setAlertStopResultOpen(true);
      await fetchStatusList();
    } catch (error) {
      console.error("수집 중지 요청 실패:", error);
      setErrorMsg("수집 중지 요청에 실패했습니다.");
      setOpenErrorAlert(true);
    }
  };

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

  const columns = getColumns({ handleDetailOpen, handleStopClick });

  useEffect(() => {
    //데이터 로딩 확인
    if (baseRows.length === 0) {
      setDisplayRows([]);
      return;
    }

    //메모리 정리
    const validWorkIds = new Set(baseRows.map((row) => row.workId));
    progressMap.forEach((_, workId) => {
      if (!validWorkIds.has(workId)) {
        resetCrawlingState(workId); //목록에서 사라진 작업은 progressMap에서 삭제
      }
    });

    //데이터 병합 [ 목록데이터(baseRows) + Websocket(progressInfo) ]
    setDisplayRows([
      ...baseRows
      .map((row) => {
        const progressInfo = progressMap.get(row.workId);
        if (!progressInfo) return row; // 없으면 API원본 그대로

        //progressInfo 있으면 업데이트
        return {
          ...row,
          progress: progressInfo.progress,
          state: progressInfo.state,
        };
      }),
    ]);
    
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseRows, progressMap]);

  // 초기 데이터 로드
  useEffect(() => {
    fetchStatusList();
  }, [fetchStatusList]);

  // WebSocket 연결
  useEffect(() => {
    if (userId) {
      connect(import.meta.env.VITE_WS_URL || "http://localhost:8080/ws");
    }
  }, [userId, connect]);

  // WebSocket 구독 (progressInfo)
  useEffect(() => {
    if (readyState === ReadyState.OPEN && userId && !subscriptionRef.current) {
      const destination =
        userRole === "ROLE_ADMIN"
          ? `/topic/crawling-progress` // 관리자: 공개 토픽 (모든 크롤링 작업)
          : `/user/queue/crawling-progress`; // 일반 유저: 개인 큐 (자신의 작업만)

      subscriptionRef.current = subscribe(destination, (message) => {
        const crawlingMessage: CrawlingMessage = JSON.parse(message.body);

        handleCrawlingProgress({
          workId: crawlingMessage.workId,
          data: { progress: crawlingMessage.progress },
        } as CrawlingMessage);

        // setBaseRows((prevRows) => {
        //   const exists = prevRows.some(
        //     (row) => row.workId === crawlingMessage.workId
        //   );
        //   if (!exists) {
        //     console.log(
        //       `[Status] 신규 작업 감지 (ID: ${crawlingMessage.workId}) -> 목록 갱신 요청`
        //     );
        //     fetchStatusList();
        //   }

        //   baseRows.map((row) => {
        //     const progressInfo = progressMap.get(row.workId);
        //     if (!progressInfo) return row;

        //     //workid 있으면 progressInfo 업데이트
        //     return {
        //       ...row,
        //       progress: progressInfo.progress,
        //       state: progressInfo.state,
        //     };
        //   });
        //   return prevRows;
        // });

        setBaseRows((prev) => {
          // 신규 작업만 감지해서 목록 갱신
          const exists = prev.some(row => row.workId === crawlingMessage.workId);
          if (!exists) fetchStatusList();
          return prev;
        });
      });
    }

    //cleanup 함수
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = undefined;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readyState, subscribe]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        pb: 4,
      }}
    >
      {/* 1. 헤더 섹션: 타이틀 폰트 조정 및 설명 추가 */}
      <Box sx={{ px: 4, pt: 6, pb: 2 }}>
        <Typography
          sx={{
            fontSize: "1.85rem", // 60px에서 세련된 크기로 하향 조정
            fontWeight: 800,
            color: "#1E293B",
            letterSpacing: "-0.02em",
            mb: 0.5,
          }}
        >
          데이터 수집 현황
        </Typography>
        <Typography
          sx={{ color: "#64748B", fontSize: "0.95rem", fontWeight: 500 }}
        >
          현재 진행 중인 데이터 수집 작업을 실시간으로 모니터링할 수 있습니다.
        </Typography>
      </Box>

      <Container maxWidth={false} sx={{ px: 4 }}>
        {/* 2. 테이블 영역: 카드 스타일 및 내부 패딩 조정 */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: "12px",
            border: "1px solid #E2E8F0",
            backgroundColor: "#fff",
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <Box sx={{ p: 1 }}>
            <CommonTable columns={columns} rows={displayRows} />
          </Box>
        </Paper>
      </Container>

      <Alert
        open={alertOpen}
        type="question"
        text={`"${selectedRow?.settingName}"의 수집을 중지하시겠습니까?`}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
      {/* 수집 중지 결과 확인 알람 */}
      <Alert
        open={alertStopResultOpen}
        text={`"${selectedRow?.settingName}"의 수집이 중지되었습니다.`}
        type="success"
        onConfirm={() => {
          setAlertStopResultOpen(false);
        }}
      />
      {/* Error Alert */}
      <Alert
        open={openErrorAlert}
        text={errorMsg}
        type="error"
        onConfirm={() => {
          setOpenErrorAlert(false);
        }}
      />
    </Box>
  );
}

export default Status;
