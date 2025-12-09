import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Paper,
  Breadcrumbs,
  Link,
  LinearProgress,
} from "@mui/material";
import { type GridColDef } from "@mui/x-data-grid";
import CommonTable from "../../component/CommonTable";
import {
  type StatusTableRows,
  DETAIL_SETTING_COLUMNS,
  FAILURE_COLUMNS,
  createCollectionColumns,
} from "../../Types/TableHeaders/StatusHeader";
import { getStatusDetail } from "./03_StatusApi";
import useWebSocketStore, { ReadyState } from "../../Store/WebSocketStore";
import { type CrawlingMessage } from "../../Types/Crawling";
import useCrawlingProgress from "../../hooks/useCrawlingProgress";
import { useAuthStore } from "../../Store/authStore";
import type { Subscription } from "stompjs";

function StatusDetail() {
  // 라우팅
  const workId = Number(useParams().workId);
  const navigate = useNavigate();

  // workId 검증
  useEffect(() => {
    if (!workId || isNaN(workId) || workId <= 0) {
      alert("잘못된 접근입니다.");
      navigate("/status");
    }
  }, [workId, navigate]);

  // WebSocket
  const userId = useAuthStore((state) => state.user?.userId);
  const { connect, subscribe, readyState } = useWebSocketStore();
  const { progressMap, handleWebSocketMessage, resetCrawlingState } =
    useCrawlingProgress();
  const subscriptionRef = useRef<Subscription | undefined>(undefined);

  // 데이터 상태
  const [detailData, setDetailData] = useState<StatusTableRows | null>(null);
  const [failureRows, setFailureRows] = useState<
    Array<{ id: number; progressNo: string; url: string }>
  >([]);
  const [collectionRows, setCollectionRows] = useState<
    Array<{ id: number; progressNo: string; [key: string]: string | number }>
  >([]);
  const [collectionColumns, setCollectionColumns] = useState<GridColDef[]>([]);

  // 중복 체크용 ID
  const collectionIdSet = useRef(new Set<number>());

  // 진행도 정보
  const currentProgress = progressMap.get(workId) ?? null;

  // 실패 여부가 포함된 수집 데이터
  const failureNos = failureRows.map((row) => row.progressNo);
  const collectionRowsWithFailure = collectionRows.map((row) => ({
    ...row,
    isFailure: failureNos.includes(row.progressNo),
  }));

  // UI 표시용 값
  const totalCount = currentProgress?.totalCount ?? 0;
  const collectionCount =
    currentProgress?.collectionCount ?? collectionRows.length;
  const failureCount = currentProgress?.failureCount ?? failureRows.length;
  const estimatedTime = currentProgress?.estimatedTime ?? "계산 중...";
  const progressValue = currentProgress?.progress ?? 0;

  const handleBack = () => navigate("/status");

  // workId 변경 시 상태 초기화
  useEffect(() => {
    setDetailData(null);
    setFailureRows([]);
    setCollectionRows([]);
    setCollectionColumns([]);
    collectionIdSet.current.clear();
  }, [workId]);

  const fetchDetailData = useCallback(async () => {
    if (!workId) return;
    try {
      const data = await getStatusDetail(workId);

      // 기본 정보 설정
      setDetailData(data.basicInfo);

      // 실패 목록 설정
      setFailureRows(data.failureList);

      // 수집 데이터 설정
      setCollectionRows(data.collectionData.rows);
      data.collectionData.rows.forEach((row) =>
        collectionIdSet.current.add(row.id)
      );

      // 컬럼 정의 설정
      setCollectionColumns(
        createCollectionColumns(data.collectionData.columns)
      );

      // 진행률 정보 초기화 (WebSocket 메시지 형식으로 전달)
      handleWebSocketMessage({
        type: "PROGRESS",
        workId,
        totalCount: data.progress.totalCount,
        estimatedTime: data.progress.estimatedTime,
      });
    } catch (error) {
      console.error("상세 정보 조회 실패:", error);
      alert("상세 정보를 불러오는 데 실패했습니다.");
      navigate("/status");
    }
  }, [workId, navigate, handleWebSocketMessage]);

  useEffect(() => {
    if (readyState === ReadyState.OPEN) {
      fetchDetailData();
    }
  }, [readyState, fetchDetailData]);

  // WebSocket 연결
  useEffect(() => {
    if (userId) {
      connect(import.meta.env.VITE_WS_URL || "http://localhost:8080/ws");
    }
  }, [userId, connect]);

  useEffect(() => {
    if (readyState === ReadyState.OPEN && userId && !subscriptionRef.current) {
      const destination = `/user/queue/crawling-progress/${workId}`;
      subscriptionRef.current = subscribe(destination, (message) => {
        const data: CrawlingMessage = JSON.parse(message.body);

        // 진행도 업데이트
        handleWebSocketMessage(data);

        // 실제 크롤링 데이터 처리 (성공/실패)
        switch (data.type) {
          case "COLLECTION":
            if (data.row && typeof data.row === "object" && "id" in data.row) {
              const newRow = data.row;

              // 중복 체크
              if (collectionIdSet.current.has(newRow.id)) break;

              // 데이터 추가
              collectionIdSet.current.add(newRow.id);
              setCollectionRows((prev) => {
                const newRows = [...prev, newRow];

                // 브라우저 메모리 관리 (최대 1000개)
                if (newRows.length > 1000) {
                  collectionIdSet.current.delete(newRows[0].id);
                  return newRows.slice(1);
                }
                return newRows;
              });
            }
            break;

          case "FAILURE":
            if (data.row && typeof data.row === "object" && "id" in data.row) {
              const newFailure = data.row;

              // 중복 체크 및 추가
              setFailureRows((prev) => {
                if (prev.some((row) => row.id === newFailure.id)) return prev;
                return [...prev, newFailure];
              });
            }
            break;

          case "COMPLETE":
            console.log(`[크롤링 완료] workId: ${workId}`);
            break;
        }
      });
    }
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = undefined;
        console.log("[WebSocket] 구독 해제: Status Detail Page");
      }
    };
  }, [workId, readyState, subscribe, handleWebSocketMessage]);

  // 컴포넌트 언마운트 시 progressMap 전체 초기화
  useEffect(() => {
    return () => {
      resetCrawlingState();
    };
  }, [resetCrawlingState]);

  return (
    <Box sx={{ height: "97%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ paddingLeft: 2, marginTop: 1 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
          <Link
            component={RouterLink}
            to="/status"
            underline="hover"
            color="inherit"
            sx={{ fontWeight: "bold", fontSize: 16 }}
          >
            데이터 수집 현황
          </Link>
          <Typography
            color="text.primary"
            sx={{ fontWeight: "bold", fontSize: 16 }}
          >
            상세조회
          </Typography>
        </Breadcrumbs>
      </Box>
      <Typography
        sx={{
          fontSize: 60,
          fontWeight: "bold",
          color: "black",
          paddingLeft: 2,
          marginTop: 5,
        }}
      >
        데이터 수집 현황 상세조회
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
            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", marginBottom: 1 }}
              >
                기본 정보
              </Typography>
              <CommonTable
                columns={DETAIL_SETTING_COLUMNS}
                rows={detailData ? [detailData] : []}
                pageSize={1}
                hideFooter={true}
              />
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, my: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                진행률:
              </Typography>
              <Box sx={{ width: "100%", mr: 1 }}>
                <LinearProgress variant="determinate" value={progressValue} />
              </Box>
              <Box sx={{ minWidth: 35 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >{`${Math.round(progressValue)}%`}</Typography>
              </Box>
            </Box>
            <Box sx={{ marginTop: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    gap: "10px",
                    alignItems: "center",
                    marginBottom: 1,
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    수집 실패
                  </Typography>
                  <Typography>
                    {failureCount}/{totalCount}
                  </Typography>
                </Box>
              </Box>
              <CommonTable
                columns={FAILURE_COLUMNS}
                rows={failureRows}
                pageSize={5}
              />
            </Box>
            <Box sx={{ marginTop: "auto" }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    gap: "10px",
                    alignItems: "center",
                    marginBottom: 1,
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    수집 데이터
                  </Typography>
                  <Typography>
                    {collectionCount}/{totalCount}
                  </Typography>
                </Box>
                <Typography sx={{ fontWeight: "bold" }}>
                  수집완료 예상시간 : {estimatedTime}
                </Typography>
              </Box>
              <CommonTable
                columns={collectionColumns}
                rows={collectionRowsWithFailure}
                pageSize={5}
              />
            </Box>
            <Box
              sx={{
                marginTop: 3,
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
              }}
            >
              <Button variant="contained" onClick={handleBack}>
                닫기
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

export default StatusDetail;
